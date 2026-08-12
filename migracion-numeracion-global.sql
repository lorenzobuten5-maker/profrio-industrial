-- ════════════════════════════════════════════════════════
-- ProFrio Industrial — Migración: Numeración Global de Formularios
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ════════════════════════════════════════════════════════

-- ── 1. formularios_intervencion: cambiar UNIQUE a solo número ──
ALTER TABLE formularios_intervencion
  DROP CONSTRAINT IF EXISTS formularios_intervencion_usuario_id_numero_key;

ALTER TABLE formularios_intervencion
  ADD CONSTRAINT formularios_intervencion_numero_key UNIQUE (numero);

-- ── 2. formularios_materiales: cambiar UNIQUE a solo número ──
ALTER TABLE formularios_materiales
  DROP CONSTRAINT IF EXISTS formularios_materiales_usuario_id_numero_key;

ALTER TABLE formularios_materiales
  ADD CONSTRAINT formularios_materiales_numero_key UNIQUE (numero);

-- ── 3. Agregar columnas de firma si no existen ──
ALTER TABLE formularios_materiales
  ADD COLUMN IF NOT EXISTS firma_interviniente TEXT,
  ADD COLUMN IF NOT EXISTS firma_cliente TEXT;

-- Verificar resultado
SELECT 'Migración aplicada exitosamente ✅' AS resultado;
