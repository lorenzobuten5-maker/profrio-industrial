---
name: mcp-cloudflare-deployer
description: Guides deployment of ProFrio Industrial to Cloudflare Workers from within Antigravity. Provides deploy commands, cache-busting strategy, and post-deploy verification steps.
---

# MCP Cloudflare Deployer — ProFrio Industrial

## Live Site
🌐 https://profrio-industrial.lorenzobuten5.workers.dev/

## Primary Deploy: Git Push (Auto-Deploy)
```bash
# 1. Bump version in all 7 HTML files: ?v=25 → ?v=26
# 2. Commit and push:
git add -A
git commit -m "feat: descripcion del cambio (v26)"
git push origin main
# ⚡ Cloudflare auto-deploys in ~30 seconds
```

## Manual Deploy via Wrangler (Fallback)
```bash
# Install wrangler if needed:
npm install -g wrangler

# Login to Cloudflare:
wrangler login

# Deploy:
wrangler deploy
```

## Version Bump Checklist
Before every deploy, update `?v=N` to `?v=N+1` in **all 7 HTML files**:
1. `index.html`
2. `dashboard-empleado.html`
3. `dashboard-jefe.html`
4. `formulario-intervencion.html`
5. `formulario-materiales.html`
6. `historial-formularios.html`
7. `perfil.html`

## Static Asset Cache Headers (`_headers` file)
```
/js/*
  Cache-Control: public, max-age=31536000, immutable
/css/*
  Cache-Control: public, max-age=31536000, immutable
/icon-*.png
  Cache-Control: public, max-age=2592000
```

## Post-Deploy Verification
- [ ] Visit https://profrio-industrial.lorenzobuten5.workers.dev/
- [ ] Login with test credentials
- [ ] Check bottom navigation works on all pages
- [ ] Test form submission end-to-end
- [ ] Open DevTools Network → confirm new `?v=N` CSS/JS files loaded (not cached)

## Cloudflare Dashboard
- Workers: https://dash.cloudflare.com/workers
- Logs: Real-time logs in Workers → your worker → Logs tab
