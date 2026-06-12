-- =============================================================================
-- 0003 — INTEGRACIÓN MERCADO PAGO (Checkout Pro)
-- =============================================================================
-- Flow esperado:
--   1) POST /api/checkout → RPC crear_orden_completa('mercadopago')
--      crea purchases con estado='pendiente', NO vacía carrito.
--   2) Cliente redirigido a init_point de MP.
--   3) Webhook /api/webhook/mp → RPC confirmar_pago(order_id, payment_id, estado)
--      pasa purchases a 'pagada' (o 'cancelada' si rechazo) y vacía carrito.
--
-- Aplicar en Supabase Dashboard → SQL Editor. Es idempotente.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. RLS — bloquear INSERT directo a purchases desde el cliente
-- -----------------------------------------------------------------------------
-- El único path válido para crear purchases es la RPC crear_orden_completa()
-- (que corre con SECURITY DEFINER y bypassea RLS). Esto evita que un cliente
-- malicioso inserte directamente con estado='pagada'.
DROP POLICY IF EXISTS purchases_insert ON purchases;


-- -----------------------------------------------------------------------------
-- 2. UNIQUE parcial — permitir múltiples intentos pendientes/cancelados
-- -----------------------------------------------------------------------------
-- Hoy UNIQUE(user_id, revista_id) impide reintentos: si un user inicia un pago,
-- queda 'pendiente', cancela, y vuelve a intentar → constraint violation.
-- Solución: solo es UNIQUE para estados "ya pagado". Estados intermedios pueden
-- duplicarse (cada intento es una fila).
ALTER TABLE purchases DROP CONSTRAINT IF EXISTS purchases_user_id_revista_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS purchases_paid_unique
  ON purchases (user_id, revista_id)
  WHERE estado IN ('completada', 'pagada', 'confirmada');


-- -----------------------------------------------------------------------------
-- 3. snapshot_purchase_price — respetar 'pendiente' cuando lo pasa la RPC
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION snapshot_purchase_price()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT precio INTO NEW.precio_pagado FROM revistas WHERE id = NEW.revista_id;
  IF NEW.precio_pagado IS NULL THEN
    RAISE EXCEPTION 'Revista % no existe', NEW.revista_id;
  END IF;
  -- 'pendiente' = flow MP (esperando webhook). 'completada' = flow mock.
  -- Cualquier otro valor en INSERT → forzamos 'completada' por seguridad.
  IF NEW.estado IS NULL OR NEW.estado NOT IN ('pendiente', 'completada') THEN
    NEW.estado := 'completada';
  END IF;
  RETURN NEW;
END;
$$;


-- -----------------------------------------------------------------------------
-- 4. crear_orden_completa — agregar comportamiento MP
-- -----------------------------------------------------------------------------
-- mock        → estado='completada', vacía carrito (igual que antes).
-- mercadopago → estado='pendiente',  NO vacía carrito (lo hace el webhook).
CREATE OR REPLACE FUNCTION crear_orden_completa(p_metodo_pago text DEFAULT 'mock')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id     uuid := auth.uid();
  v_order_id    uuid;
  v_cart_count  int;
  v_total       numeric(10,2) := 0;
  v_items_count int := 0;
  v_estado      purchase_estado;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No autenticado' USING ERRCODE = 'P0001';
  END IF;

  IF p_metodo_pago NOT IN ('mock', 'mercadopago', 'stripe') THEN
    RAISE EXCEPTION 'Método de pago inválido: %', p_metodo_pago USING ERRCODE = 'P0001';
  END IF;

  SELECT count(*) INTO v_cart_count FROM cart_items WHERE user_id = v_user_id;
  IF v_cart_count = 0 THEN
    RAISE EXCEPTION 'Carrito vacío' USING ERRCODE = 'P0002';
  END IF;

  v_estado := CASE WHEN p_metodo_pago = 'mock' THEN 'completada'::purchase_estado
                                               ELSE 'pendiente'::purchase_estado END;
  v_order_id := gen_random_uuid();

  SELECT COALESCE(SUM(r.precio), 0) INTO v_total
  FROM cart_items ci
  JOIN revistas r ON r.id = ci.revista_id
  WHERE ci.user_id = v_user_id AND r.activa = true;

  -- Insert. El trigger pisa precio_pagado. No insertamos si ya hay un purchase
  -- "ownership" para esa revista (estado pagado o confirmado).
  WITH inserted AS (
    INSERT INTO purchases (user_id, revista_id, order_id, metodo_pago, estado)
    SELECT v_user_id, ci.revista_id, v_order_id, p_metodo_pago, v_estado
    FROM cart_items ci
    JOIN revistas r ON r.id = ci.revista_id AND r.activa = true
    WHERE ci.user_id = v_user_id
      AND NOT EXISTS (
        SELECT 1 FROM purchases p
        WHERE p.user_id = v_user_id
          AND p.revista_id = ci.revista_id
          AND p.estado IN ('completada', 'pagada', 'confirmada')
      )
    RETURNING 1
  )
  SELECT count(*) INTO v_items_count FROM inserted;

  IF v_items_count = 0 THEN
    RAISE EXCEPTION 'Todas las revistas del carrito ya fueron compradas' USING ERRCODE = 'P0003';
  END IF;

  -- Solo vaciamos el carrito si la orden ya quedó completada (mock).
  IF p_metodo_pago = 'mock' THEN
    DELETE FROM cart_items WHERE user_id = v_user_id;
  END IF;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'total', v_total,
    'items_count', v_items_count
  );
END;
$$;


-- -----------------------------------------------------------------------------
-- 5. confirmar_pago — llamada desde el webhook (server con SUPABASE_SECRET_KEY)
-- -----------------------------------------------------------------------------
-- Idempotente: si ya está en estado final, no hace nada.
-- Solo updatea las filas en estado='pendiente' de la order_id dada.
-- Cuando aprueba: setea estado='pagada', referencia_pago=payment_id, pagado_en
-- y borra los cart_items correspondientes.
CREATE OR REPLACE FUNCTION confirmar_pago(
  p_order_id   uuid,
  p_payment_id text,
  p_estado_mp  text,                          -- 'approved'|'pending'|'rejected'|'cancelled'|'refunded'
  p_pagado_en  timestamptz DEFAULT now()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nuevo_estado purchase_estado;
  v_user_id      uuid;
  v_revista_ids  uuid[];
  v_count        int;
BEGIN
  v_nuevo_estado := CASE p_estado_mp
    WHEN 'approved'    THEN 'pagada'::purchase_estado
    WHEN 'pending'     THEN 'pendiente'::purchase_estado
    WHEN 'in_process'  THEN 'pendiente'::purchase_estado
    WHEN 'rejected'    THEN 'cancelada'::purchase_estado
    WHEN 'cancelled'   THEN 'cancelada'::purchase_estado
    WHEN 'refunded'    THEN 'reembolsada'::purchase_estado
    ELSE 'pendiente'::purchase_estado
  END;

  UPDATE purchases
  SET estado = v_nuevo_estado,
      referencia_pago = p_payment_id,
      pagado_en = CASE WHEN v_nuevo_estado = 'pagada' THEN p_pagado_en ELSE pagado_en END
  WHERE order_id = p_order_id
    AND estado = 'pendiente';

  GET DIAGNOSTICS v_count = ROW_COUNT;

  IF v_nuevo_estado = 'pagada' AND v_count > 0 THEN
    SELECT user_id INTO v_user_id FROM purchases WHERE order_id = p_order_id LIMIT 1;
    SELECT array_agg(revista_id) INTO v_revista_ids FROM purchases WHERE order_id = p_order_id;

    DELETE FROM cart_items
    WHERE user_id = v_user_id AND revista_id = ANY(v_revista_ids);
  END IF;

  RETURN jsonb_build_object('updated', v_count, 'estado', v_nuevo_estado);
END;
$$;

-- Solo el backend (service_role / SUPABASE_SECRET_KEY) puede ejecutar.
REVOKE ALL ON FUNCTION confirmar_pago(uuid, text, text, timestamptz) FROM public;
REVOKE EXECUTE ON FUNCTION confirmar_pago(uuid, text, text, timestamptz) FROM authenticated, anon;
GRANT  EXECUTE ON FUNCTION confirmar_pago(uuid, text, text, timestamptz) TO service_role;
