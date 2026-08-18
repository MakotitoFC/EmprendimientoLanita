-- ============================================================
-- PATCH: Campo es_unica para productos cemento y MDF
-- Permite marcar si una pieza es única/irrepetible o no
-- ============================================================

ALTER TABLE productos
  ADD COLUMN IF NOT EXISTS es_unica BOOLEAN NOT NULL DEFAULT false;

-- Las piedras son siempre únicas por definición
UPDATE productos SET es_unica = true WHERE tipo = 'piedra';

-- Índice para filtrar rápido
CREATE INDEX IF NOT EXISTS idx_productos_es_unica ON productos(tipo, es_unica);

-- ============================================================
-- VERIFICAR:
-- SELECT nombre, tipo, es_unica, piedra_disponible FROM productos ORDER BY tipo;
-- ============================================================
