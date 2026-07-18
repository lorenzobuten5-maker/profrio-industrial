-- ════════════════════════════════════════════════════════
-- ProFrio Industrial — Supabase Row Level Security (RLS)
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ════════════════════════════════════════════════════════

-- ─────────────────────────────────────────
-- 1. TABLA: profiles
-- ─────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden leer su propio perfil
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- El jefe puede leer todos los perfiles
CREATE POLICY "profiles_select_jefe"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'jefe'
    )
  );

-- Solo el propio usuario puede actualizar su perfil
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- El usuario puede insertar su propio perfil (autocuidado en el registro/login)
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- El jefe puede actualizar cualquier perfil (banear, bloquear)
CREATE POLICY "profiles_update_jefe"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'jefe'
    )
  );

-- ─────────────────────────────────────────
-- 2. TABLA: presencia
-- ─────────────────────────────────────────
ALTER TABLE presencia ENABLE ROW LEVEL SECURITY;

-- El usuario solo puede leer/actualizar su propia presencia
CREATE POLICY "presencia_select_own"
  ON presencia FOR SELECT
  USING (auth.uid() = id);

-- El jefe puede leer todas las presencias
CREATE POLICY "presencia_select_jefe"
  ON presencia FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'jefe'
    )
  );

CREATE POLICY "presencia_insert_own"
  ON presencia FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "presencia_update_own"
  ON presencia FOR UPDATE
  USING (auth.uid() = id);

-- ─────────────────────────────────────────
-- 3. TABLA: formularios_intervencion
-- ─────────────────────────────────────────
ALTER TABLE formularios_intervencion ENABLE ROW LEVEL SECURITY;

-- El empleado solo ve sus propios formularios
CREATE POLICY "fi_select_own"
  ON formularios_intervencion FOR SELECT
  USING (auth.uid() = usuario_id);

-- El jefe ve todos
CREATE POLICY "fi_select_jefe"
  ON formularios_intervencion FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'jefe'
    )
  );

CREATE POLICY "fi_insert_own"
  ON formularios_intervencion FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "fi_update_own"
  ON formularios_intervencion FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "fi_delete_jefe"
  ON formularios_intervencion FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'jefe'
    )
  );

-- ─────────────────────────────────────────
-- 4. TABLA: formularios_materiales
-- ─────────────────────────────────────────
ALTER TABLE formularios_materiales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fm_select_own"
  ON formularios_materiales FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "fm_select_jefe"
  ON formularios_materiales FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'jefe'
    )
  );

CREATE POLICY "fm_insert_own"
  ON formularios_materiales FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "fm_update_own"
  ON formularios_materiales FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "fm_delete_jefe"
  ON formularios_materiales FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'jefe'
    )
  );
