-- ============================================================
-- PATCH: campos de personalización en productos
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Opciones de personalización por producto
ALTER TABLE productos
  ADD COLUMN IF NOT EXISTS colores_disponibles   TEXT[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS acabados_disponibles  TEXT[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS accesorios_disponibles TEXT[]  DEFAULT '{}';

-- 2. Ejemplos: valores predeterminados para cemento
UPDATE productos
SET
  colores_disponibles  = ARRAY['Blanco', 'Negro', 'Gris', 'Terracota', 'Beige', 'Verde salvia', 'Azul petroleo'],
  acabados_disponibles = ARRAY['Mate', 'Satinado', 'Brillante'],
  accesorios_disponibles = ARRAY['Sin accesorios', 'Cordón yute', 'Cinta de tela', 'Caja regalo']
WHERE tipo = 'cemento';

-- 3. Ejemplos: valores predeterminados para MDF
UPDATE productos
SET
  colores_disponibles  = ARRAY['Natural madera', 'Negro', 'Blanco', 'Dorado', 'Plateado'],
  acabados_disponibles = ARRAY['Sin barniz', 'Barniz mate', 'Barniz brillante', 'Con resina'],
  accesorios_disponibles = ARRAY['Sin accesorios', 'Marco de madera', 'Colgador incluido', 'Caja regalo']
WHERE tipo = 'mdf';

-- 4. La dedicatoria se almacena en order_items.options como clave 'dedicatoria'
--    No requiere columna nueva — options ya es jsonb/Record<string,string>

-- 5. RLS: heredar las políticas existentes de productos (sin cambios necesarios)

-- ============================================================
-- VERIFICAR:
-- SELECT id, nombre, tipo, colores_disponibles, acabados_disponibles, accesorios_disponibles
-- FROM productos WHERE tipo IN ('cemento','mdf');
-- ============================================================
