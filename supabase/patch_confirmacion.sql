-- PATCH: estados simplificados + columnas de confirmación
-- Ejecutar en Supabase SQL Editor DESPUÉS de migracion_v2_fixed.sql

-- 1. Columnas nuevas en orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS confirmation_token text UNIQUE,
  ADD COLUMN IF NOT EXISTS confirmation_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS review_comment text;

-- 2. Reemplazar el CHECK de status por solo 3 estados
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status = ANY (ARRAY['pending','validated','delivered']));

-- 3. Migrar estados viejos al nuevo esquema (si hubiera datos previos)
UPDATE public.orders SET status = 'pending'   WHERE status NOT IN ('pending','validated','delivered');

-- 4. Índice para buscar por token
CREATE INDEX IF NOT EXISTS idx_orders_confirmation_token ON public.orders(confirmation_token);

-- VERIFICACIÓN
-- SELECT id, status, confirmation_token FROM public.orders LIMIT 5;
