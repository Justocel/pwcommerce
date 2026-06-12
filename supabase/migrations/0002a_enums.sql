-- =============================================================================
-- 0002a — ADD VALUE a los enums
-- =============================================================================
-- Postgres no deja usar un nuevo valor de enum en la misma transacción donde
-- se agregó (error 55P04). El SQL Editor de Supabase corre todo el script como
-- una transacción, así que los ALTER TYPE viven en su propio archivo y se
-- corren ANTES que el resto.
--
-- Orden de aplicación:
--   1) 0002a_enums.sql            ← este archivo (commit)
--   2) 0002_transactions_and_payment_prep.sql
--   3) 0003_mercadopago.sql
--
-- Es idempotente.
-- =============================================================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid='user_role'::regtype AND enumlabel='admin'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'admin';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid='purchase_estado'::regtype AND enumlabel='pagada'
  ) THEN
    ALTER TYPE purchase_estado ADD VALUE 'pagada';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid='purchase_estado'::regtype AND enumlabel='confirmada'
  ) THEN
    ALTER TYPE purchase_estado ADD VALUE 'confirmada';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid='purchase_estado'::regtype AND enumlabel='cancelada'
  ) THEN
    ALTER TYPE purchase_estado ADD VALUE 'cancelada';
  END IF;
END $$;
