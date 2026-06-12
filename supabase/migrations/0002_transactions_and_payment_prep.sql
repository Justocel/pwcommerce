-- =============================================================================
-- 0002 — TRANSACCIONES + PREPARACIÓN PARA PAGO REAL
-- =============================================================================
-- PRIMERO aplicar 0002a_enums.sql (agrega valores nuevos a los enums). Postgres
-- no deja usar un valor de enum recién creado en la misma transacción.
--
-- Este archivo:
-- 1) is_admin() + is_editor() actualizado para incluir admin como superset.
-- 2) Campos metodo_pago / referencia_pago / pagado_en en purchases.
-- 3) Storage RLS extendida para aceptar 'pagada' y 'confirmada' como acceso.
-- 4) Stored procedure crear_orden_completa() atómico.
--
-- Idempotente.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. ROLES — is_admin() y is_editor() ampliado
-- -----------------------------------------------------------------------------
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
-- 2. CAMPOS DE PAGO en purchases
-- -----------------------------------------------------------------------------
ALTER TABLE purchases
  ADD COLUMN IF NOT EXISTS metodo_pago      text,        -- 'mock' | 'mercadopago' | 'stripe' | ...
  ADD COLUMN IF NOT EXISTS referencia_pago  text,        -- id del provider (preference_id, payment_id, etc)
  ADD COLUMN IF NOT EXISTS pagado_en        timestamptz; -- timestamp del cobro confirmado

-- Índice para resolver webhooks por referencia_pago.
CREATE INDEX IF NOT EXISTS purchases_referencia_idx
  ON purchases (referencia_pago) WHERE referencia_pago IS NOT NULL;


-- -----------------------------------------------------------------------------
-- 3. ACCESO AL PDF — extender RLS de storage para aceptar estados "pagados"
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
-- 4. STORED PROCEDURE — crear_orden_completa()
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
