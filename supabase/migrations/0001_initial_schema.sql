-- =============================================================================
-- PICNIC MAGAZINE — Schema inicial
-- =============================================================================
-- Para aplicar: Supabase Dashboard → SQL Editor → New query → pegar todo → Run.
-- Es re-ejecutable: usa CREATE IF NOT EXISTS / DROP POLICY IF EXISTS / ON CONFLICT
-- donde corresponde. Si cambiás columnas, hay que ALTER manualmente.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. EXTENSIONES
-- -----------------------------------------------------------------------------
-- pgcrypto da gen_random_uuid(). En PG 15+ ya viene built-in pero no hace daño.
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- -----------------------------------------------------------------------------
-- 2. ENUMS
-- -----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'editor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE purchase_estado AS ENUM ('pendiente', 'completada', 'reembolsada');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- -----------------------------------------------------------------------------
-- 3. TABLAS
-- -----------------------------------------------------------------------------

-- profiles: extiende auth.users con datos de app.
-- IMPORTANTE: la contraseña vive en auth.users.encrypted_password (hasheada
-- por Supabase Auth). Nunca, jamás, una columna `password` acá.
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre      text NOT NULL DEFAULT '',
  role        user_role NOT NULL DEFAULT 'user',
  pais        text,
  ciudad      text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS revistas (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_edicion     int NOT NULL UNIQUE,
  titulo             text NOT NULL,
  descripcion        text,
  portada_path       text,                 -- path en bucket 'imagenes-publicas'
  pdf_path           text,                 -- path en bucket 'revistas-pdf'
  precio             numeric(10,2) NOT NULL CHECK (precio >= 0),
  fecha_lanzamiento  date,
  activa             boolean NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  revista_id  uuid NOT NULL REFERENCES revistas(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, revista_id)
);

CREATE TABLE IF NOT EXISTS purchases (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  revista_id          uuid NOT NULL REFERENCES revistas(id) ON DELETE RESTRICT,
  precio_pagado       numeric(10,2) NOT NULL DEFAULT 0 CHECK (precio_pagado >= 0),
  estado              purchase_estado NOT NULL DEFAULT 'completada',
  payment_provider_id text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, revista_id)
);
-- revista_id ON DELETE RESTRICT: una revista comprada NO se puede borrar.
-- Para "bajar" una revista del catálogo, los editores ponen activa=false.

CREATE TABLE IF NOT EXISTS articulos (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                text UNIQUE,                -- usado en /articulos/[slug]
  categoria           text,                       -- ej: 'ENTREVISTAS'
  titulo              text NOT NULL,
  subtitulo           text,
  contenido           text NOT NULL DEFAULT '',   -- markdown
  imagen_path         text,
  autor               text,
  fecha_publicacion   date,
  orden               int NOT NULL DEFAULT 0,
  visible             boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS integrantes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text NOT NULL,
  rol         text,
  foto_path   text,
  bio         text,
  orden       int NOT NULL DEFAULT 0,
  visible     boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS videos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id      text NOT NULL UNIQUE,
  titulo          text NOT NULL,
  descripcion     text,
  thumbnail_url   text,
  published_at    timestamptz,
  visible         boolean NOT NULL DEFAULT true,
  orden           int,
  seccion         text CHECK (seccion IS NULL OR seccion IN ('gracias', 'picnic')),
  last_synced_at  timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now()
);
-- seccion: 'gracias' (Gracias por la intercomunicación) | 'picnic' (Picnic en
-- la tierra) | NULL (recién sincronizado, sin clasificar — no se muestra al
-- público, solo visible para editores que después lo asignan).

CREATE TABLE IF NOT EXISTS analytics_events (
  id          bigserial PRIMARY KEY,
  event_type  text NOT NULL CHECK (event_type IN (
    'page_view','video_play','add_to_cart','purchase','pdf_open','login','signup'
  )),
  user_id     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  session_id  uuid,
  path        text CHECK (path IS NULL OR length(path) < 2048),
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);


-- -----------------------------------------------------------------------------
-- 4. ÍNDICES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS analytics_events_type_created_idx
  ON analytics_events (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_user_created_idx
  ON analytics_events (user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS purchases_user_idx        ON purchases   (user_id);
CREATE INDEX IF NOT EXISTS cart_items_user_idx       ON cart_items  (user_id);
CREATE INDEX IF NOT EXISTS articulos_visible_idx     ON articulos   (visible, orden);
CREATE INDEX IF NOT EXISTS integrantes_visible_idx   ON integrantes (visible, orden);
CREATE INDEX IF NOT EXISTS videos_visible_idx        ON videos      (visible, published_at DESC);


-- -----------------------------------------------------------------------------
-- 5. FUNCIONES Y TRIGGERS
-- -----------------------------------------------------------------------------

-- is_editor(): check de rol. SECURITY DEFINER para bypassear RLS de profiles
-- (sino, recursión infinita en policies que la usan).
-- SET search_path para evitar hijack de search_path.
CREATE OR REPLACE FUNCTION is_editor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'editor'
  );
$$;
REVOKE ALL ON FUNCTION is_editor() FROM public;
GRANT EXECUTE ON FUNCTION is_editor() TO authenticated, anon;

-- handle_new_user(): trigger AFTER INSERT en auth.users → crea row en profiles.
-- CRÍTICO: NO leemos role de raw_user_meta_data (user-controlled). Solo nombre.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, nombre)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- prevent_role_self_escalation(): bloquea cambios de role si no sos editor.
-- Defensa en profundidad por si la policy de UPDATE en profiles permite escribir.
-- auth.uid() IS NULL = ejecución admin (SQL Editor o service_role) → permitido.
CREATE OR REPLACE FUNCTION prevent_role_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND auth.uid() IS NOT NULL
     AND NOT is_editor() THEN
    RAISE EXCEPTION 'No tenés permiso para cambiar el rol';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_role_escalation ON profiles;
CREATE TRIGGER profiles_prevent_role_escalation
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION prevent_role_self_escalation();

-- snapshot_purchase_price(): pisa precio_pagado con el de revistas.precio y
-- fuerza estado='completada'. Evita que el cliente mande precio_pagado=0 o
-- estado='reembolsada' al insertar. Cuando integres pago real, cambiá el
-- 'completada' por 'pendiente' (el webhook lo pasa a 'completada').
CREATE OR REPLACE FUNCTION snapshot_purchase_price()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT precio INTO NEW.precio_pagado
  FROM revistas WHERE id = NEW.revista_id;
  IF NEW.precio_pagado IS NULL THEN
    RAISE EXCEPTION 'Revista % no existe', NEW.revista_id;
  END IF;
  NEW.estado := 'completada';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS purchases_snapshot_price ON purchases;
CREATE TRIGGER purchases_snapshot_price
  BEFORE INSERT ON purchases
  FOR EACH ROW EXECUTE FUNCTION snapshot_purchase_price();

-- set_updated_at(): trigger genérico.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON profiles;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS revistas_set_updated_at ON revistas;
CREATE TRIGGER revistas_set_updated_at BEFORE UPDATE ON revistas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS articulos_set_updated_at ON articulos;
CREATE TRIGGER articulos_set_updated_at BEFORE UPDATE ON articulos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS integrantes_set_updated_at ON integrantes;
CREATE TRIGGER integrantes_set_updated_at BEFORE UPDATE ON integrantes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- -----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
-- Sin RLS, la anon key (que está en el navegador) puede leer/escribir todo.
-- Activar SIEMPRE.

ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE revistas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases        ENABLE ROW LEVEL SECURITY;
ALTER TABLE articulos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrantes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- ........... PROFILES .........................................
-- INSERT: NO hay policy → solo el trigger handle_new_user puede insertar.
DROP POLICY IF EXISTS profiles_select ON profiles;
CREATE POLICY profiles_select ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR is_editor());

DROP POLICY IF EXISTS profiles_update ON profiles;
CREATE POLICY profiles_update ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR is_editor())
  WITH CHECK (id = auth.uid() OR is_editor());
-- El cambio de role queda bloqueado por trigger prevent_role_self_escalation.

-- ........... REVISTAS .........................................
DROP POLICY IF EXISTS revistas_select ON revistas;
CREATE POLICY revistas_select ON revistas
  FOR SELECT TO anon, authenticated
  USING (activa = true OR is_editor());

DROP POLICY IF EXISTS revistas_write ON revistas;
CREATE POLICY revistas_write ON revistas
  FOR ALL TO authenticated
  USING (is_editor())
  WITH CHECK (is_editor());

-- ........... CART_ITEMS .......................................
DROP POLICY IF EXISTS cart_items_select ON cart_items;
CREATE POLICY cart_items_select ON cart_items
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS cart_items_write ON cart_items;
CREATE POLICY cart_items_write ON cart_items
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ........... PURCHASES ........................................
DROP POLICY IF EXISTS purchases_select ON purchases;
CREATE POLICY purchases_select ON purchases
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_editor());

DROP POLICY IF EXISTS purchases_insert ON purchases;
CREATE POLICY purchases_insert ON purchases
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS purchases_update ON purchases;
CREATE POLICY purchases_update ON purchases
  FOR UPDATE TO authenticated
  USING (is_editor())
  WITH CHECK (is_editor());
-- Sin policy de DELETE → nadie puede borrar (audit trail intacto).

-- ........... ARTICULOS / INTEGRANTES / VIDEOS .................
DROP POLICY IF EXISTS articulos_select ON articulos;
CREATE POLICY articulos_select ON articulos
  FOR SELECT TO anon, authenticated
  USING (visible = true OR is_editor());

DROP POLICY IF EXISTS articulos_write ON articulos;
CREATE POLICY articulos_write ON articulos
  FOR ALL TO authenticated
  USING (is_editor()) WITH CHECK (is_editor());

DROP POLICY IF EXISTS integrantes_select ON integrantes;
CREATE POLICY integrantes_select ON integrantes
  FOR SELECT TO anon, authenticated
  USING (visible = true OR is_editor());

DROP POLICY IF EXISTS integrantes_write ON integrantes;
CREATE POLICY integrantes_write ON integrantes
  FOR ALL TO authenticated
  USING (is_editor()) WITH CHECK (is_editor());

DROP POLICY IF EXISTS videos_select ON videos;
CREATE POLICY videos_select ON videos
  FOR SELECT TO anon, authenticated
  USING (visible = true OR is_editor());

DROP POLICY IF EXISTS videos_write ON videos;
CREATE POLICY videos_write ON videos
  FOR ALL TO authenticated
  USING (is_editor()) WITH CHECK (is_editor());
-- El cron de YouTube usa SUPABASE_SECRET_KEY desde el server → bypassea RLS.

-- ........... ANALYTICS_EVENTS .................................
DROP POLICY IF EXISTS analytics_insert ON analytics_events;
CREATE POLICY analytics_insert ON analytics_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS analytics_select ON analytics_events;
CREATE POLICY analytics_select ON analytics_events
  FOR SELECT TO authenticated
  USING (is_editor());


-- -----------------------------------------------------------------------------
-- 7. STORAGE BUCKETS + POLICIES
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES
  ('imagenes-publicas', 'imagenes-publicas', true),
  ('revistas-pdf',      'revistas-pdf',      false)
ON CONFLICT (id) DO NOTHING;

-- imagenes-publicas: lectura libre, escritura solo editor.
DROP POLICY IF EXISTS imagenes_select ON storage.objects;
CREATE POLICY imagenes_select ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'imagenes-publicas');

DROP POLICY IF EXISTS imagenes_insert ON storage.objects;
CREATE POLICY imagenes_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'imagenes-publicas' AND is_editor());

DROP POLICY IF EXISTS imagenes_update ON storage.objects;
CREATE POLICY imagenes_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'imagenes-publicas' AND is_editor())
  WITH CHECK (bucket_id = 'imagenes-publicas' AND is_editor());

DROP POLICY IF EXISTS imagenes_delete ON storage.objects;
CREATE POLICY imagenes_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'imagenes-publicas' AND is_editor());

-- revistas-pdf: lectura solo si tenés compra completada para esa revista.
-- Convención de path: `<revista_id>/<archivo>.pdf` → folder = revista_id.
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
          AND p.estado = 'completada'
          AND p.revista_id::text = (storage.foldername(name))[1]
      )
    )
  );

DROP POLICY IF EXISTS revistas_pdf_insert ON storage.objects;
CREATE POLICY revistas_pdf_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'revistas-pdf' AND is_editor());

DROP POLICY IF EXISTS revistas_pdf_update ON storage.objects;
CREATE POLICY revistas_pdf_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'revistas-pdf' AND is_editor())
  WITH CHECK (bucket_id = 'revistas-pdf' AND is_editor());

DROP POLICY IF EXISTS revistas_pdf_delete ON storage.objects;
CREATE POLICY revistas_pdf_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'revistas-pdf' AND is_editor());


-- -----------------------------------------------------------------------------
-- 8. SEED
-- -----------------------------------------------------------------------------
-- Nota: portada_path es '/Revistas/7.png' (servido por Next desde /public).
-- Cuando subas portadas a Supabase Storage, vas a cambiar esto por el path
-- del bucket 'imagenes-publicas'.
INSERT INTO revistas (numero_edicion, titulo, descripcion, portada_path, precio, activa, fecha_lanzamiento)
VALUES (
  1,
  'Picnic — Edición 1',
  'Primer número. Periodismo de arte fino.',
  '/Revistas/7.png',
  500.00,
  true,
  CURRENT_DATE
)
ON CONFLICT (numero_edicion) DO NOTHING;

-- Artículo inicial.
INSERT INTO articulos (slug, categoria, titulo, subtitulo, contenido, imagen_path, orden)
VALUES (
  'entrevista-clara-osimani',
  'ENTREVISTAS',
  'CLARA OSIMANI:',
  'Yo escribo de alguna forma para eternizar',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  '/Articulos/entrevista-clara-osimani.png',
  1
)
ON CONFLICT (slug) DO NOTHING;

-- Integrantes iniciales (UUIDs fijos para hacerlo re-runnable).
INSERT INTO integrantes (id, nombre, rol, foto_path, bio, orden) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Juan', 'Rol de Juan', '/Integrantes/juan.jpg', 'Descripción de Juan.', 1),
  ('a0000002-0000-0000-0000-000000000002', 'Eva',  'Rol de Eva',  '/Integrantes/eva.jpg',  'Descripción de Eva.',  2),
  ('a0000003-0000-0000-0000-000000000003', 'Mey',  'Rol de Mey',  '/Integrantes/mey.jpg',  'Descripción de Mey.',  3),
  ('a0000004-0000-0000-0000-000000000004', 'Vic',  'Rol de Vic',  '/Integrantes/vic.jpg',  'Descripción de Vic.',  4)
ON CONFLICT (id) DO NOTHING;

-- Videos iniciales (los que estaban hardcodeados en data.js). Cuando corra el
-- cron, va a hacer UPSERT y actualizar el metadata (titulo/thumbnail/etc) sin
-- pisar visible/seccion/orden.
INSERT INTO videos (youtube_id, titulo, seccion) VALUES
  ('gKdnwWDJEDM', 'LOLA TABA | Gracias por la Intercomunicación #1', 'gracias'),
  ('L-POc5KiwPI', 'JERO JONES | Gracias por la Intercomunicación #2', 'gracias'),
  ('K3IoicFrKv8', 'LUCY PATANÉ en el SONIDO KONEX | Gracias por la Intercomunicación MINI', 'gracias'),
  ('CPx_9g0yqFA', 'DUM CHICA - SONIDO KONEX | Gracias por la Intercomunicación MINI', 'gracias'),
  ('r0OWf4eB92w', 'DOBLE FECHA LIVERPOOL-MARADENTRO 16/09/25 | Picnic en la Tierra #1', 'picnic'),
  ('hv16HuuGCfo', 'JAMMIN Y RAESVORIA EN MOSCÚ | Picnic en la Tierra', 'picnic'),
  ('2kVHDyyp-FA', 'LUCY PATANÉ Y DUM CHICA EN EL SONIDO KONEX | Picnic en la Tierra', 'picnic')
ON CONFLICT (youtube_id) DO NOTHING;
