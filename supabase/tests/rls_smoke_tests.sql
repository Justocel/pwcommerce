-- =============================================================================
-- TESTS DE SEGURIDAD — Picnic
-- =============================================================================
-- Correr DESPUÉS de aplicar 0001_initial_schema.sql.
-- Cada bloque "TEST" hay que correrlo solo (resaltar y Run).
-- Si algo dice "ERROR" donde esperás que diga ERROR, está bien.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- SETUP — crear dos usuarios de prueba desde el SQL Editor
-- -----------------------------------------------------------------------------
-- Esto NO es la forma normal (lo normal es signup desde la UI).
-- Pero sirve para tests aislados sin tocar Auth.

-- Crea: alice@test.com (user normal) y bob@test.com (editor)
-- ⚠ Estos usuarios no van a poder loguearse desde la UI sin contraseña;
-- son solo para tests SQL.

INSERT INTO auth.users (id, email, raw_user_meta_data, email_confirmed_at, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'alice@test.com', '{"nombre":"Alice"}'::jsonb, now(), now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'bob@test.com',   '{"nombre":"Bob"}'::jsonb,   now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- Hacé editor a Bob
UPDATE profiles SET role = 'editor' WHERE id = '22222222-2222-2222-2222-222222222222';

-- Verificá
SELECT id, nombre, role FROM profiles WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);


-- =============================================================================
-- TESTS DE ESCALAMIENTO DE ROL
-- =============================================================================

-- TEST 1: Alice (user normal) intenta hacerse editor → debe FALLAR
-- Simulamos que es Alice con set_config
BEGIN;
  SET LOCAL role authenticated;
  SET LOCAL "request.jwt.claims" TO '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
  -- esto debería tirar "No tenés permiso para cambiar el rol"
  UPDATE profiles SET role = 'editor' WHERE id = '11111111-1111-1111-1111-111111111111';
ROLLBACK;

-- TEST 2: Bob (editor) sí puede promover a Alice → debe ANDAR
BEGIN;
  SET LOCAL role authenticated;
  SET LOCAL "request.jwt.claims" TO '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
  UPDATE profiles SET role = 'editor' WHERE id = '11111111-1111-1111-1111-111111111111';
  SELECT id, role FROM profiles WHERE id = '11111111-1111-1111-1111-111111111111';
ROLLBACK;  -- rollback para no dejar a Alice como editor


-- =============================================================================
-- TESTS DE COMPRAS
-- =============================================================================

-- TEST 3: Alice intenta comprar con precio_pagado=0 → trigger pisa con 500
BEGIN;
  SET LOCAL role authenticated;
  SET LOCAL "request.jwt.claims" TO '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
  INSERT INTO purchases (user_id, revista_id, precio_pagado, estado)
  SELECT '11111111-1111-1111-1111-111111111111', id, 0, 'reembolsada'
  FROM revistas WHERE numero_edicion = 1;
  -- Verificá: precio_pagado=500 y estado='completada' (el trigger los pisó)
  SELECT user_id, precio_pagado, estado FROM purchases
  WHERE user_id = '11111111-1111-1111-1111-111111111111';
ROLLBACK;

-- TEST 4: Alice intenta crear una compra a nombre de Bob → debe FALLAR
BEGIN;
  SET LOCAL role authenticated;
  SET LOCAL "request.jwt.claims" TO '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
  -- esto debería tirar "new row violates row-level security policy"
  INSERT INTO purchases (user_id, revista_id)
  SELECT '22222222-2222-2222-2222-222222222222', id FROM revistas WHERE numero_edicion = 1;
ROLLBACK;

-- TEST 5: Alice intenta SELECT de las compras de Bob → debe devolver 0 rows
BEGIN;
  SET LOCAL role authenticated;
  SET LOCAL "request.jwt.claims" TO '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
  SELECT count(*) AS deberia_ser_0
  FROM purchases WHERE user_id = '22222222-2222-2222-2222-222222222222';
ROLLBACK;


-- =============================================================================
-- TESTS DE CARRITO
-- =============================================================================

-- TEST 6: Alice no puede leer el cart de Bob → 0 rows
BEGIN;
  SET LOCAL role authenticated;
  SET LOCAL "request.jwt.claims" TO '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
  SELECT count(*) AS deberia_ser_0
  FROM cart_items WHERE user_id = '22222222-2222-2222-2222-222222222222';
ROLLBACK;

-- TEST 7: Alice no puede meter items en el cart de Bob → FALLA
BEGIN;
  SET LOCAL role authenticated;
  SET LOCAL "request.jwt.claims" TO '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
  INSERT INTO cart_items (user_id, revista_id)
  SELECT '22222222-2222-2222-2222-222222222222', id FROM revistas WHERE numero_edicion = 1;
ROLLBACK;


-- =============================================================================
-- TESTS DE CONTENIDO (articulos/integrantes/videos)
-- =============================================================================

-- TEST 8: Alice (no editor) intenta crear un articulo → FALLA
BEGIN;
  SET LOCAL role authenticated;
  SET LOCAL "request.jwt.claims" TO '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
  INSERT INTO articulos (titulo, contenido) VALUES ('hack', 'soy alice y meto contenido');
ROLLBACK;

-- TEST 9: Bob (editor) sí puede → ANDA
BEGIN;
  SET LOCAL role authenticated;
  SET LOCAL "request.jwt.claims" TO '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
  INSERT INTO articulos (titulo, contenido) VALUES ('test', 'soy bob');
  SELECT titulo, autor FROM articulos WHERE titulo = 'test';
ROLLBACK;

-- TEST 10: Anon puede leer articulos visibles, no los ocultos
BEGIN;
  SET LOCAL role anon;
  -- inserto un oculto como postgres (bypassea RLS)
  INSERT INTO articulos (titulo, contenido, visible) VALUES ('secreto', 'oculto', false);
  -- pero anon no lo ve
  SELECT count(*) AS deberia_ser_0 FROM articulos WHERE titulo = 'secreto';
ROLLBACK;


-- =============================================================================
-- TESTS DE ANALYTICS
-- =============================================================================

-- TEST 11: Anon puede insertar page_view → ANDA
BEGIN;
  SET LOCAL role anon;
  INSERT INTO analytics_events (event_type, path) VALUES ('page_view', '/test');
  SELECT count(*) FROM analytics_events WHERE path = '/test';
ROLLBACK;

-- TEST 12: Alice intenta insertar evento con user_id de Bob → FALLA
BEGIN;
  SET LOCAL role authenticated;
  SET LOCAL "request.jwt.claims" TO '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
  INSERT INTO analytics_events (event_type, user_id, path)
  VALUES ('page_view', '22222222-2222-2222-2222-222222222222', '/spoof');
ROLLBACK;

-- TEST 13: Alice no puede ver eventos (solo editores) → 0 rows
BEGIN;
  SET LOCAL role authenticated;
  SET LOCAL "request.jwt.claims" TO '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
  SELECT count(*) AS deberia_ser_0 FROM analytics_events;
ROLLBACK;


-- =============================================================================
-- CLEANUP (opcional) — borrar usuarios de test
-- =============================================================================
-- DELETE FROM auth.users WHERE email IN ('alice@test.com', 'bob@test.com');
-- (cascadea a profiles, cart_items, purchases)
