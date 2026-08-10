---
name: mcp-supabase-manager
description: Configures and uses the Supabase MCP Server with Google Antigravity to run SQL queries and manage schema without leaving chat. Activate when the user wants to run database queries or inspect Supabase data from within Antigravity.
---

# MCP Supabase Manager — ProFrio Industrial

## Setup Steps

### Step 1: Get Your Access Token
1. Go to: https://supabase.com/dashboard/account/tokens
2. Click **Generate new token** → give it a name like "Antigravity"
3. Copy the token

### Step 2: Update the Config
Edit `.agents/mcp_config.json` and replace `YOUR_SUPABASE_ACCESS_TOKEN_HERE` with your real token.

### Step 3: Reload Antigravity
Restart the Antigravity IDE so it picks up the new MCP server config.

## What You Can Do Once Configured
- Run SQL queries directly in Antigravity chat
- List all tables and schema definitions
- Create and apply migrations
- Inspect RLS policies
- View table row counts
- Query specific users or forms

## Example Queries
```sql
-- Count all intervention forms this month
SELECT COUNT(*) FROM formularios_intervencion
WHERE created_at >= DATE_TRUNC('month', NOW());

-- Find all forms by a specific employee
SELECT f.numero, f.cliente, f.created_at, p.nombre
FROM formularios_intervencion f
JOIN profiles p ON p.id = f.usuario_id
WHERE p.email = 'empleado@example.com'
ORDER BY f.created_at DESC;

-- Check pending biometric registrations
SELECT id, nombre, email FROM profiles
WHERE estado = 'activo' ORDER BY nombre;
```

## Without MCP (Manual Alternative)
Go to: https://supabase.com/dashboard/project/[your-project-id]/editor
And run SQL queries directly in the Supabase dashboard.
