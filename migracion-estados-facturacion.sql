-- ════════════════════════════════════════════════════════
-- ProFrio Industrial — Migración v3: Estados de Facturación y Envío
-- Permite marcar formularios como 'pendiente' o 'facturado' (Enviado ya)
-- EJECUTAR EN SUPABASE → SQL Editor
-- ════════════════════════════════════════════════════════

-- 1. Agregar columna de estado a intervenciones
ALTER TABLE formularios_intervencion
  ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'pendiente';

-- 2. Agregar columna de estado a materiales
ALTER TABLE formularios_materiales
  ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'pendiente';

-- 3. Crear índices para acelerar consultas y filtros por estado
CREATE INDEX IF NOT EXISTS idx_fi_estado ON formularios_intervencion(estado);
CREATE INDEX IF NOT EXISTS idx_fm_estado ON formularios_materiales(estado);

-- 4. Actualizar políticas para asegurar que los jefes y creadores puedan actualizar el estado
-- (Las políticas existentes en RLS ya cubren UPDATE con auth.uid() = usuario_id OR public.es_jefe())

SELECT 'Migración de estados aplicada exitosamente ✅' AS resultado;
