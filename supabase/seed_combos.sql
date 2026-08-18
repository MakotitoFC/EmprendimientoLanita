-- ============================================================
-- SEED: Combos permanentes de Artesanías de Lanita
-- Ejecutar DESPUÉS de patch_combos.sql
-- ============================================================

-- Insertar combos permanentes (siempre visibles)
INSERT INTO combos (nombre, descripcion, imagen, precio_combo, es_permanente, fecha_fin, is_active)
VALUES
  (
    'Kit Bienvenida',
    'Piedra artesanal + objeto de cemento a elección. El regalo perfecto para estrenar un hogar.',
    NULL,
    110.00,
    true,
    NULL,
    true
  ),
  (
    'Dúo Cemento',
    'Dos objetos de cemento en el mismo color base. Ideales para decorar juntos.',
    NULL,
    90.00,
    true,
    NULL,
    true
  ),
  (
    'Cuadro + Piedra',
    'Cuadro MDF personalizado y piedra con diseño a juego. Un set con identidad propia.',
    NULL,
    130.00,
    true,
    NULL,
    true
  )
ON CONFLICT DO NOTHING;

-- Ítems de cada combo (ajustar combo_id luego de insertar si es necesario)
-- Usamos subconsultas para obtener el id de cada combo por nombre

INSERT INTO combo_items (combo_id, descripcion_item, cantidad)
SELECT id, 'Piedra artesanal a elección', 1 FROM combos WHERE nombre = 'Kit Bienvenida'
UNION ALL
SELECT id, 'Objeto de cemento a elección', 1 FROM combos WHERE nombre = 'Kit Bienvenida';

INSERT INTO combo_items (combo_id, descripcion_item, cantidad)
SELECT id, 'Objeto de cemento (color a elección)', 2 FROM combos WHERE nombre = 'Dúo Cemento';

INSERT INTO combo_items (combo_id, descripcion_item, cantidad)
SELECT id, 'Cuadro MDF personalizado', 1 FROM combos WHERE nombre = 'Cuadro + Piedra'
UNION ALL
SELECT id, 'Piedra artesanal con diseño', 1 FROM combos WHERE nombre = 'Cuadro + Piedra';

-- ============================================================
-- VERIFICAR:
-- SELECT c.nombre, c.precio_combo, c.es_permanente,
--        array_agg(ci.descripcion_item) AS items
-- FROM combos c
-- LEFT JOIN combo_items ci ON ci.combo_id = c.id
-- WHERE c.is_active = true
-- GROUP BY c.id;
-- ============================================================
