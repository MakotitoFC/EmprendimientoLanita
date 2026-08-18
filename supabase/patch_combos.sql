-- ============================================================
-- PATCH: Combos (bundles con imagen propia y precio fijo)
-- Diferencia con promociones: precio fijo, pueden ser permanentes
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Tabla principal de combos
CREATE TABLE IF NOT EXISTS combos (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre         TEXT        NOT NULL,
  descripcion    TEXT,
  imagen         TEXT,                          -- URL de imagen propia del combo
  precio_combo   NUMERIC(10,2) NOT NULL,
  es_permanente  BOOLEAN     NOT NULL DEFAULT false,
  fecha_inicio   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_fin      TIMESTAMPTZ,                   -- NULL si es_permanente = true
  is_active      BOOLEAN     NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Ítems que componen cada combo
CREATE TABLE IF NOT EXISTS combo_items (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  combo_id         UUID    NOT NULL REFERENCES combos(id) ON DELETE CASCADE,
  producto_id      UUID    REFERENCES productos(id) ON DELETE SET NULL,
  cantidad         INTEGER NOT NULL DEFAULT 1,
  descripcion_item TEXT                          -- Ej: "Piedra a elección", "Marco MDF 20x30"
);

-- 3. RLS
ALTER TABLE combos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE combo_items ENABLE ROW LEVEL SECURITY;

-- Lectura pública (cualquiera puede ver combos activos)
CREATE POLICY "combos_public_read"      ON combos      FOR SELECT USING (true);
CREATE POLICY "combo_items_public_read" ON combo_items FOR SELECT USING (true);

-- Solo service_role puede insertar/modificar (desde dashboard o server actions)
CREATE POLICY "combos_service_write"      ON combos      FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "combo_items_service_write" ON combo_items FOR ALL USING (auth.role() = 'service_role');

-- 4. Combo de ejemplo (editar imagen URL después)
INSERT INTO combos (nombre, descripcion, imagen, precio_combo, es_permanente, fecha_fin, is_active)
VALUES
  (
    'Kit Regalo Especial',
    'Piedra con diseño + cuadro MDF personalizado. Ideal para regalar.',
    NULL,
    120.00,
    false,
    NOW() + INTERVAL '30 days',
    true
  ),
  (
    'Dúo Cemento',
    'Dos objetos de cemento a elección de color. Perfectos juntos.',
    NULL,
    95.00,
    true,   -- permanente
    NULL,
    true
  );

-- 5. Items de ejemplo (ajustar producto_id con IDs reales de tu BD)
-- INSERT INTO combo_items (combo_id, descripcion_item) VALUES (...)

-- ============================================================
-- VERIFICAR:
-- SELECT c.nombre, c.precio_combo, c.es_permanente, c.fecha_fin,
--        ci.descripcion_item
-- FROM combos c
-- LEFT JOIN combo_items ci ON ci.combo_id = c.id
-- WHERE c.is_active = true;
-- ============================================================
