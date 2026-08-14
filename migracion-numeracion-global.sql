-- ════════════════════════════════════════════════════════
-- ProFrio Industrial — Migración v2: Numeración Global
-- EJECUTAR EN SUPABASE → SQL Editor
-- ════════════════════════════════════════════════════════

-- ══ PASO 1: Renumerar formularios_intervencion globalmente ══
-- Asigna números consecutivos ordenados por fecha de creación
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS new_numero
  FROM formularios_intervencion
)
UPDATE formularios_intervencion fi
SET numero = r.new_numero
FROM ranked r
WHERE fi.id = r.id;

-- ══ PASO 2: Eliminar constraint antiguo (por usuario+numero) ══
ALTER TABLE formularios_intervencion
  DROP CONSTRAINT IF EXISTS formularios_intervencion_usuario_id_numero_key;

-- ══ PASO 3: Agregar constraint global (solo por numero) ══
ALTER TABLE formularios_intervencion
  ADD CONSTRAINT formularios_intervencion_numero_key UNIQUE (numero);

-- ══ PASO 4: Renumerar formularios_materiales globalmente ══
WITH ranked2 AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS new_numero
  FROM formularios_materiales
)
UPDATE formularios_materiales fm
SET numero = r.new_numero
FROM ranked2 r
WHERE fm.id = r.id;

-- ══ PASO 5: Eliminar constraint antiguo de materiales ══
ALTER TABLE formularios_materiales
  DROP CONSTRAINT IF EXISTS formularios_materiales_usuario_id_numero_key;

-- ══ PASO 6: Agregar constraint global de materiales ══
ALTER TABLE formularios_materiales
  ADD CONSTRAINT formularios_materiales_numero_key UNIQUE (numero);

-- ══ PASO 7: Agregar columnas de firma y tipo de solicitud ══
ALTER TABLE formularios_materiales
  ADD COLUMN IF NOT EXISTS firma_interviniente TEXT,
  ADD COLUMN IF NOT EXISTS firma_cliente TEXT,
  ADD COLUMN IF NOT EXISTS tipo_solicitud TEXT DEFAULT 'pedido';

-- ══ PASO 8: Permitir lectura (SELECT) a todos los empleados para numeración global ══
DROP POLICY IF EXISTS "fi_select_authenticated" ON formularios_intervencion;
CREATE POLICY "fi_select_authenticated"
  ON formularios_intervencion FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "fm_select_authenticated" ON formularios_materiales;
CREATE POLICY "fm_select_authenticated"
  ON formularios_materiales FOR SELECT
  TO authenticated
  USING (true);

-- Verificar
SELECT 'Migración aplicada exitosamente ✅' AS resultado;
