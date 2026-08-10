---
name: git-release-helper
description: Generates semantic git commit messages and release commands for ProFrio Industrial. Activate when the user wants to commit changes, deploy, or create a new version.
---

# Git Release Helper — ProFrio Industrial

## Commit Format (Conventional Commits)
```
<type>: <description> (v<version>)
```

### Types
| Type | When to Use |
|---|---|
| `feat:` | New feature or page |
| `fix:` | Bug fix |
| `style:` | UI/CSS change, no logic change |
| `refactor:` | Code restructure, same behavior |
| `perf:` | Performance improvement |
| `docs:` | Documentation only |
| `chore:` | Maintenance — version bumps, cleanup |

## Version Bump Strategy
- **Patch** (v25.1 → v25.2): Bug fixes, small UI tweaks
- **Minor** (v25 → v26): New features, new modules, new pages
- **Major** (v1 → v2): Architecture overhaul, DB schema redesign

## ProFrio Release Checklist
1. Bump CSS/JS version strings in all 7 HTML files (`?v=25` → `?v=26`)
2. Run `git add -A`
3. Write semantic commit with type + description + version
4. Run `git push origin main`
5. ⚡ Cloudflare auto-deploys within ~30 seconds

## Standard Deploy Commands
```bash
git add -A
git commit -m "feat: Descripcion del cambio (v26)"
git push origin main
```

## Live URL
🌐 https://profrio-industrial.lorenzobuten5.workers.dev/
