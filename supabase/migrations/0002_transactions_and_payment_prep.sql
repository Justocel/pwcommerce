-- =============================================================================
-- 0002 — TRANSACCIONES + PREPARACIÓN PARA PAGO REAL
-- =============================================================================
-- 1) Sistema de roles ampliado: 'admin' además de 'user'/'editor'.
-- 2) Estados de pago ampliados para reflejar el ciclo real de una orden.
-- 3) Campos metodo_pago / referencia_pago / pagado_en en purchases.
-- 4) Stored procedure crear_orden_completa() que arma la orden atómicamente
--    (purchases + vaciado del carrito en una sola transacción).
--
-- Aplicar en Supabase Dashboard → SQL Editor. Es idempotente.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. ROLES — agregar 'admin'
-- -----------------------------------------------------------------------------
-- ADD VALUE IF NOT EXISTS no se puede correr dentro de un bloque atomico junto
-- a un uso del nuevo valor, por eso lo separamos en un DO propio.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'user_role'::regtype AND enumlabel = 'admin'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'admin';
  END IF;
END $$;

-- is_admin(): true solo para admin. is_editor() ya cubre tanto editor como
-- admin (admin es superset). Las policies existentes siguen funcionando.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;
REVOKE ALL ON FUNCTION is_admin() FROM public;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;

-- Actualizar is_editor() para que admin también devuelva true.
CREATE OR REPLACE FUNCTION is_editor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('editor', 'admin')
  );
$$;
REVOKE ALL ON FUNCTION is_editor() FROM public;
GRANT EXECUTE ON FUNCTION is_editor() TO authenticated, anon;


-- -----------------------------------------------------------------------------
-- 2. ESTADOS DE PAGO — ampliar enum
-- -----------------------------------------------------------------------------
-- Ciclo de una orden de revista digital:
--   pendiente  → creada, esperando pago (MP genera link)
--   pagada     → MP confirmó que cobró
--   confirmada → ya entregamos acceso al PDF (equivalente a 'entregada' para producto físico)
--   cancelada  → el user canceló o MP rechazó
--   reembolsada → devolución
-- 'completada' queda como alias de 'confirmada' para compatibilidad con datos viejos.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid='purchase_estado'::regtype AND enumlabel='pagada') THEN
    ALTER TYPE purchase_estado ADD VALUE 'pagada';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid='purchase_estado'::regtype AND enumlabel='confirmada') THEN
    ALTER TYPE purchase_estado ADD VALUE 'confirmada';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid='purchase_estado'::regtype AND enumlabel='cancelada') THEN
    ALTER TYPE purchase_estado ADD VALUE 'cancelada';
  END IF;
END $$;


-- -----------------------------------------------------------------------------
-- 3. CAMPOS DE PAGO en purchases
-- -----------------------------------------------------------------------------
ALTER TABLE purchases
  ADD COLUMN IF NOT EXISTS metodo_pago      text,        -- 'mock' | 'mercadopago' | 'stripe' | ...
  ADD COLUMN IF NOT EXISTS referencia_pago  text,        -- id del provider (preference_id, payment_id, etc)
  ADD COLUMN IF NOT EXISTS pagado_en        timestamptz; -- timestamp del cobro confirmado

-- Índice para resolver webhooks por referencia_pago.
CREATE INDEX IF NOT EXISTS purchases_referencia_idx
  ON purchases (referencia_pago) WHERE referencia_pago IS NOT NULL;


-- -----------------------------------------------------------------------------
-- 4. ACCESO AL PDF — extender RLS de storage para aceptar estados "pagados"
-- -----------------------------------------------------------------------------
-- Cuando integremos MP, las purchases nacerán 'pagada' o 'confirmada'.
-- Tanto 'completada' (legacy) como 'pagada' y 'confirmada' habilitan acceso.
DROP POLICY IF EXISTS revistas_pdf_select ON storage.objects;
CREATE POLICY revistas_pdf_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'revistas-pdf'
    AND (
      is_editor()
      OR EXISTS (
        SELECT 1 FROM purchases p
        WHERE p.user_id = auth.uid()
          AND p.estado IN ('completada', 'pagada', 'confirmada')
          AND p.revista_id::text = (storage.foldername(name))[1]
      )
    )
  );


-- -----------------------------------------------------------------------------
-- 5. STORED PROCEDURE — crear_orden_completa()
-- -----------------------------------------------------------------------------
-- Atomicidad: toda función PL/pgSQL corre en una transacción implícita.
-- Si cualquier sentencia falla (RAISE, violación de constraint, etc), TODO
-- se revierte. No puede pasar "compré pero el carrito sigue lleno" ni "vacié
-- el carrito pero no quedaron compras".
--
-- SECURITY DEFINER: corre con permisos del owner. Validamos manualmente que
-- el caller esté autenticado (auth.uid()). NO aceptamos user_id por parámetro
-- — siempre se usa el del JWT, evitando que un user spoofee otro.
--
-- Retorna: { order_id uuid, total numeric, items_count int }
-- =============================================================================
CREATE OR REPLACE FUNCTION crear_orden_completa(
  p_metodo_pago text DEFAULT 'mock'
)
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
BEGIN
  -- Validar auth.
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No autenticado' USING ERRCODE = 'P0001';
  END IF;

  -- Validar metodo_pago.
  IF p_metodo_pago NOT IN ('mock', 'mercadopago', 'stripe') THEN
    RAISE EXCEPTION 'Método de pago inválido: %', p_metodo_pago USING ERRCODE = 'P0001';
  END IF;

  -- Carrito no vacío.
  SELECT count(*) INTO v_cart_count FROM cart_items WHERE user_id = v_user_id;
  IF v_cart_count = 0 THEN
    RAISE EXCEPTION 'Carrito vacío' USING ERRCODE = 'P0002';
  END IF;

  -- Calcular total (precio actual de revistas en carrito, sin tocar lo guardado).
  SELECT COALESCE(SUM(r.precio), 0) INTO v_total
  FROM cart_items ci
  JOIN revistas r ON r.id = ci.revista_id
  WHERE ci.user_id = v_user_id
    AND r.activa = true;

  -- Generar order_id compartido.
  v_order_id := gen_random_uuid();

  -- Insertar purchases. El trigger snapshot_purchase_price pisa precio_pagado
  -- con revistas.precio (no se puede spoofear desde el cliente).
  -- ON CONFLICT: si ya compraste esa revista, no la duplico (UNIQUE user_id+revista_id).
  WITH inserted AS (
    INSERT INTO purchases (user_id, revista_id, order_id, metodo_pago)
    SELECT v_user_id, ci.revista_id, v_order_id, p_metodo_pago
    FROM cart_items ci
    JOIN revistas r ON r.id = ci.revista_id AND r.activa = true
    WHERE ci.user_id = v_user_id
    ON CONFLICT (user_id, revista_id) DO NOTHING
    RETURNING 1
  )
  SELECT count(*) INTO v_items_count FROM inserted;

  -- Vaciar carrito (todo o nada con lo anterior).
  DELETE FROM cart_items WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'total', v_total,
    'items_count', v_items_count
  );
END;
$$;

REVOKE ALL ON FUNCTION crear_orden_completa(text) FROM public;
GRANT EXECUTE ON FUNCTION crear_orden_completa(text) TO authenticated;
