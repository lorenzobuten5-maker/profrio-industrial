-- ════════════════════════════════════════════════════════
-- ProFrio Industrial — Supabase Row Level Security (RLS)
-- Ejecutar en Supabase Dashboard → SQL Editor
-- (Este script es idempotente: se puede ejecutar varias veces)
-- ════════════════════════════════════════════════════════

-- ─────────────────────────────────────────
-- 1. TABLA: profiles
-- ─────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Evita la recursión infinita en la misma tabla usando los metadatos del JWT
DROP POLICY IF EXISTS "profiles_select_jefe" ON profiles;
CREATE POLICY "profiles_select_jefe"
  ON profiles FOR SELECT
  USING ( (auth.jwt() -> 'user_metadata' ->> 'rol') = 'jefe' );

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_jefe" ON profiles;
CREATE POLICY "profiles_update_jefe"
  ON profiles FOR UPDATE
  USING ( (auth.jwt() -> 'user_metadata' ->> 'rol') = 'jefe' );

-- ─────────────────────────────────────────
-- 2. TABLA: presencia
-- ─────────────────────────────────────────
ALTER TABLE presencia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "presencia_select_own" ON presencia;
CREATE POLICY "presencia_select_own"
  ON presencia FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "presencia_select_jefe" ON presencia;
CREATE POLICY "presencia_select_jefe"
  ON presencia FOR SELECT
  USING ( (auth.jwt() -> 'user_metadata' ->> 'rol') = 'jefe' );

DROP POLICY IF EXISTS "presencia_insert_own" ON presencia;
CREATE POLICY "presencia_insert_own"
  ON presencia FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "presencia_update_own" ON presencia;
CREATE POLICY "presencia_update_own"
  ON presencia FOR UPDATE
  USING (auth.uid() = id);

-- ─────────────────────────────────────────
-- 3. TABLA: formularios_intervencion
-- ─────────────────────────────────────────
ALTER TABLE formularios_intervencion ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fi_select_own" ON formularios_intervencion;
CREATE POLICY "fi_select_own"
  ON formularios_intervencion FOR SELECT
  USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "fi_select_jefe" ON formularios_intervencion;
CREATE POLICY "fi_select_jefe"
  ON formularios_intervencion FOR SELECT
  USING ( (auth.jwt() -> 'user_metadata' ->> 'rol') = 'jefe' );

DROP POLICY IF EXISTS "fi_insert_own" ON formularios_intervencion;
CREATE POLICY "fi_insert_own"
  ON formularios_intervencion FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "fi_update_own" ON formularios_intervencion;
CREATE POLICY "fi_update_own"
  ON formularios_intervencion FOR UPDATE
  USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "fi_delete_jefe" ON formularios_intervencion;
CREATE POLICY "fi_delete_jefe"
  ON formularios_intervencion FOR DELETE
  USING ( (auth.jwt() -> 'user_metadata' ->> 'rol') = 'jefe' );

-- ─────────────────────────────────────────
-- 4. TABLA: formularios_materiales
-- ─────────────────────────────────────────
ALTER TABLE formularios_materiales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fm_select_own" ON formularios_materiales;
CREATE POLICY "fm_select_own"
  ON formularios_materiales FOR SELECT
  USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "fm_select_jefe" ON formularios_materiales;
CREATE POLICY "fm_select_jefe"
  ON formularios_materiales FOR SELECT
  USING ( (auth.jwt() -> 'user_metadata' ->> 'rol') = 'jefe' );

DROP POLICY IF EXISTS "fm_insert_own" ON formularios_materiales;
CREATE POLICY "fm_insert_own"
  ON formularios_materiales FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "fm_update_own" ON formularios_materiales;
CREATE POLICY "fm_update_own"
  ON formularios_materiales FOR UPDATE
  USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "fm_delete_jefe" ON formularios_materiales;
CREATE POLICY "fm_delete_jefe"
  ON formularios_materiales FOR DELETE
  USING ( (auth.jwt() -> 'user_metadata' ->> 'rol') = 'jefe' );
