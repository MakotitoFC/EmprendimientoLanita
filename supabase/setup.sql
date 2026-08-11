-- ============================================================
-- PASO 1: Crear las tablas (ya las tenés creadas en Supabase)
-- ============================================================
-- Este archivo asume que las tablas ya existen.
-- Acá configuramos RLS, políticas y el trigger de profiles.

-- ============================================================
-- PASO 2: Trigger para crear profile automáticamente al registrar
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'vendor')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PASO 3: Habilitar RLS en todas las tablas
-- ============================================================
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tamanos_mdf ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disenos_ejemplo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promociones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promociones_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PASO 4: Políticas RLS
-- ============================================================

-- PRODUCTOS: lectura pública solo activos, escritura solo autenticados
CREATE POLICY "productos_select_public" ON public.productos
  FOR SELECT USING (is_active = true);

CREATE POLICY "productos_select_auth" ON public.productos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "productos_insert_auth" ON public.productos
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "productos_update_auth" ON public.productos
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "productos_delete_auth" ON public.productos
  FOR DELETE TO authenticated USING (true);

-- TAMANOS MDF: lectura pública, escritura autenticados
CREATE POLICY "tamanos_select_public" ON public.tamanos_mdf
  FOR SELECT USING (true);

CREATE POLICY "tamanos_write_auth" ON public.tamanos_mdf
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- DISEÑOS EJEMPLO: lectura pública solo activos, escritura autenticados
CREATE POLICY "disenos_select_public" ON public.disenos_ejemplo
  FOR SELECT USING (is_active = true);

CREATE POLICY "disenos_select_auth" ON public.disenos_ejemplo
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "disenos_write_auth" ON public.disenos_ejemplo
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PROMOCIONES: lectura pública, escritura autenticados
CREATE POLICY "promociones_select_public" ON public.promociones
  FOR SELECT USING (true);

CREATE POLICY "promociones_write_auth" ON public.promociones
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PROMOCIONES_PRODUCTOS: lectura pública, escritura autenticados
CREATE POLICY "promo_prod_select" ON public.promociones_productos
  FOR SELECT USING (true);

CREATE POLICY "promo_prod_write_auth" ON public.promociones_productos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PROFILES: cada usuario ve su propio perfil, admin ve todos
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "profiles_insert_service" ON public.profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "profiles_update_auth" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- VENDOR_SETTINGS: lectura pública (para el número de WA), escritura solo el dueño
CREATE POLICY "vendor_settings_select_public" ON public.vendor_settings
  FOR SELECT USING (true);

CREATE POLICY "vendor_settings_write_own" ON public.vendor_settings
  FOR ALL TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- ============================================================
-- PASO 5: Storage bucket
-- ============================================================
-- Ejecutar en Supabase Dashboard > Storage o con la CLI:
-- supabase storage create-bucket imagenes --public

-- Política de lectura pública en storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('imagenes', 'imagenes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "storage_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'imagenes');

CREATE POLICY "storage_auth_write" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'imagenes');

CREATE POLICY "storage_auth_update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'imagenes');

CREATE POLICY "storage_auth_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'imagenes');
