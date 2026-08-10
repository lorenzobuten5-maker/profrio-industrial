---
name: supabase-schema-architect
description: Expert skill for designing, auditing, and optimizing the Supabase database schema, RLS policies, and indexes for ProFrio Industrial. Activate when the user asks about database structure, query performance, or security policies.
---

# Supabase Schema Architect — ProFrio Industrial

## Current Schema Overview

### `profiles` — User Accounts
```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  nombre      TEXT,
  email       TEXT UNIQUE,
  rol         TEXT CHECK (rol IN ('empleado', 'jefe')),
  estado      TEXT DEFAULT 'activo',
  baneado_hasta TIMESTAMPTZ,
  is_online   BOOLEAN DEFAULT false,
  last_seen   TIMESTAMPTZ
);
```

### `formularios_intervencion` — Intervention Reports
```sql
CREATE TABLE formularios_intervencion (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  UUID REFERENCES profiles(id),
  numero      INTEGER,
  cliente     TEXT,
  direccion   TEXT,
  firma_interviniente TEXT,  -- base64 WebP
  firma_cliente       TEXT,  -- base64 WebP
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### `formularios_materiales` — Materials Requests
```sql
CREATE TABLE formularios_materiales (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES profiles(id),
  numero     INTEGER,
  cliente    TEXT,
  items      JSONB,          -- array of {descripcion, cantidad, precio}
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Query Best Practices
```javascript
// ✅ Use count: 'exact' for stats
const { count } = await supabase
  .from('formularios_intervencion')
  .select('id', { count: 'exact' })
  .eq('usuario_id', userId);

// ✅ Select only needed fields (not '*')
const { data } = await supabase
  .from('profiles')
  .select('id, nombre, email, rol');

// ✅ Always order by created_at DESC
.order('created_at', { ascending: false })
```

## Recommended Indexes
```sql
CREATE INDEX idx_intervencion_usuario ON formularios_intervencion(usuario_id);
CREATE INDEX idx_intervencion_fecha   ON formularios_intervencion(created_at DESC);
CREATE INDEX idx_materiales_usuario   ON formularios_materiales(usuario_id);
CREATE INDEX idx_materiales_fecha     ON formularios_materiales(created_at DESC);
```

## RLS Policy Pattern
```sql
-- Employees see only their own forms
CREATE POLICY "empleado_own" ON formularios_intervencion
  FOR ALL USING (auth.uid() = usuario_id);

-- Jefes see everything
CREATE POLICY "jefe_all" ON formularios_intervencion
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'jefe')
  );
```
