-- ============================================================
-- MIGRACIÓN: ARTESANÍAS v2.0 (FIXED - sin recursión RLS)
-- Ejecutar en Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ALTER TABLE: vendor_settings (campos Telegram)
ALTER TABLE public.vendor_settings
  ADD COLUMN IF NOT EXISTS telegram_bot_token text,
  ADD COLUMN IF NOT EXISTS telegram_chat_id text,
  ADD COLUMN IF NOT EXISTS telegram_webhook_secret text;

-- 2. NUEVAS TABLAS
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text NOT NULL,
  phone text,
  telegram_username text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status = ANY (ARRAY[
      'pending','confirmed','paid','processing','shipped','delivered','cancelled'
    ])),
  total numeric NOT NULL CHECK (total >= 0),
  shipping_address text,
  notes text,
  telegram_chat_id text,
  source text DEFAULT 'web' CHECK (source = ANY (ARRAY['web','telegram'])),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.productos(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0),
  options jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id text NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['user','model','system'])),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 3. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_productos_tipo_active ON public.productos(tipo, is_active);
CREATE INDEX IF NOT EXISTS idx_productos_created ON public.productos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_disenos_producto ON public.disenos_ejemplo(producto_id, is_active);
CREATE INDEX IF NOT EXISTS idx_disenos_tipo ON public.disenos_ejemplo(tipo, is_active);
CREATE INDEX IF NOT EXISTS idx_promociones_vigentes ON public.promociones(fecha_inicio, fecha_fin, is_active);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON public.orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_chat ON public.chat_history(chat_id, created_at DESC);

-- 4. TRIGGER updated_at para orders
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. ACTIVAR RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tamanos_mdf ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disenos_ejemplo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promociones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promociones_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- 6. POLICIES: PROFILES
-- FIX: No referenciar profiles desde dentro de la policy de profiles (recursión infinita)
DROP POLICY IF EXISTS profiles_select ON public.profiles;
DROP POLICY IF EXISTS profiles_update ON public.profiles;
DROP POLICY IF EXISTS profiles_insert ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_all_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- SELECT: cualquier usuario autenticado puede leer perfiles (necesario para que los EXISTS funcionen)
CREATE POLICY profiles_select ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- UPDATE: solo el propio perfil
CREATE POLICY profiles_update ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

-- INSERT: usado por el trigger de auth
CREATE POLICY profiles_insert ON public.profiles
  FOR INSERT WITH CHECK (true);

-- 7. POLICIES: VENDOR_SETTINGS
DROP POLICY IF EXISTS vendor_settings_all ON public.vendor_settings;
-- Ahora profiles_select es USING(true) así que EXISTS funciona sin recursión
CREATE POLICY vendor_settings_all ON public.vendor_settings
  FOR ALL TO authenticated
  USING (
    profile_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 8. POLICIES: PRODUCTOS
DROP POLICY IF EXISTS productos_public_read ON public.productos;
DROP POLICY IF EXISTS productos_admin_write ON public.productos;

CREATE POLICY productos_public_read ON public.productos
  FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY productos_admin_write ON public.productos
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'vendor'))
  );

-- 9. POLICIES: TAMANOS_MDF
DROP POLICY IF EXISTS tamanos_public_read ON public.tamanos_mdf;
DROP POLICY IF EXISTS tamanos_admin_write ON public.tamanos_mdf;

CREATE POLICY tamanos_public_read ON public.tamanos_mdf
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY tamanos_admin_write ON public.tamanos_mdf
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'vendor')));

-- 10. POLICIES: DISENOS_EJEMPLO
DROP POLICY IF EXISTS disenos_public_read ON public.disenos_ejemplo;
DROP POLICY IF EXISTS disenos_admin_write ON public.disenos_ejemplo;

CREATE POLICY disenos_public_read ON public.disenos_ejemplo
  FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY disenos_admin_write ON public.disenos_ejemplo
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'vendor')));

-- 11. POLICIES: PROMOCIONES
DROP POLICY IF EXISTS promos_public_read ON public.promociones;
DROP POLICY IF EXISTS promos_admin_write ON public.promociones;

CREATE POLICY promos_public_read ON public.promociones
  FOR SELECT TO anon, authenticated
  USING (is_active = true AND fecha_fin >= now());

CREATE POLICY promos_admin_write ON public.promociones
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'vendor')));

-- 12. POLICIES: PROMOCIONES_PRODUCTOS
DROP POLICY IF EXISTS promos_prod_public_read ON public.promociones_productos;
DROP POLICY IF EXISTS promos_prod_admin_write ON public.promociones_productos;

CREATE POLICY promos_prod_public_read ON public.promociones_productos
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY promos_prod_admin_write ON public.promociones_productos
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'vendor')));

-- 13. POLICIES: CUSTOMERS
DROP POLICY IF EXISTS customers_insert_anon ON public.customers;
DROP POLICY IF EXISTS customers_insert_auth ON public.customers;
DROP POLICY IF EXISTS customers_select ON public.customers;
DROP POLICY IF EXISTS customers_admin_all ON public.customers;

CREATE POLICY customers_insert_anon ON public.customers
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY customers_insert_auth ON public.customers
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY customers_select ON public.customers
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'vendor')));

-- 14. POLICIES: ORDERS
DROP POLICY IF EXISTS orders_select_public ON public.orders;
DROP POLICY IF EXISTS orders_insert_anon ON public.orders;
DROP POLICY IF EXISTS orders_insert_auth ON public.orders;
DROP POLICY IF EXISTS orders_admin_all ON public.orders;

CREATE POLICY orders_select_public ON public.orders
  FOR SELECT USING (true);

CREATE POLICY orders_insert_anon ON public.orders
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY orders_insert_auth ON public.orders
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY orders_admin_all ON public.orders
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'vendor')));

-- 15. POLICIES: ORDER_ITEMS
DROP POLICY IF EXISTS order_items_select_public ON public.order_items;
DROP POLICY IF EXISTS order_items_insert_anon ON public.order_items;
DROP POLICY IF EXISTS order_items_insert_auth ON public.order_items;
DROP POLICY IF EXISTS order_items_admin_all ON public.order_items;

CREATE POLICY order_items_select_public ON public.order_items
  FOR SELECT USING (true);

CREATE POLICY order_items_insert_anon ON public.order_items
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY order_items_insert_auth ON public.order_items
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY order_items_admin_all ON public.order_items
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'vendor')));

-- 16. POLICIES: CHAT_HISTORY (solo service_role vía bot)
DROP POLICY IF EXISTS chat_history_service_only ON public.chat_history;
CREATE POLICY chat_history_service_only ON public.chat_history
  FOR ALL USING (false);

-- VERIFICACIÓN: ejecutar después
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
