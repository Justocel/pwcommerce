-- =============================================================================
-- 0004 — CONTRAPORTADA + COLOR DE MARGEN POR REVISTA
-- =============================================================================
-- Agrega dos campos opcionales a `revistas`:
--   contraportada_path — path en el bucket 'imagenes-publicas' (mismo formato
--                        que portada_path). Para mostrar la "tapa de atrás"
--                        en el lector y, opcionalmente, en el 3D.
--   color              — color asociado a la edición (HEX, ej '#A0263F'). Se
--                        usa como margen del visor PDF; sirve como identidad
--                        visual por número.
--
-- Aplicar en Supabase Dashboard → SQL Editor. Idempotente.
-- =============================================================================

ALTER TABLE revistas
  ADD COLUMN IF NOT EXISTS contraportada_path text,
  ADD COLUMN IF NOT EXISTS color              text;

-- CHECK simple para color: HEX de 3 o 6 dígitos. Permitimos NULL.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'revistas_color_hex_check'
  ) THEN
    ALTER TABLE revistas
      ADD CONSTRAINT revistas_color_hex_check
      CHECK (color IS NULL OR color ~ '^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$');
  END IF;
END $$;
