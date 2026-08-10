---
name: sec-audit-xss-csrf
description: Security audit skill for ProFrio Industrial. Detects and fixes XSS vulnerabilities, exposed credentials, and insecure data handling. Activate when the user asks about security, vulnerabilities, or safe coding practices.
---

# Security Audit: XSS & CSRF — ProFrio Industrial

## XSS Prevention

### ❌ NEVER — Direct HTML from user data
```javascript
element.innerHTML = userInputData; // DANGER
```

### ✅ ALWAYS — Safe alternatives
```javascript
// Text content (safest)
element.textContent = userInputData;

// When HTML structure is needed, sanitize values first
function sanitize(val) {
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
element.innerHTML = `<span>${sanitize(userInputData)}</span>`;
```

## Credential Rules
- ✅ `js/supabase-config.js` → anon key is intentionally public (safe)
- ❌ NEVER put `SERVICE_ROLE_KEY` in any client-side file
- ❌ NEVER expose admin credentials in HTML comments or JS comments
- ❌ NEVER commit `.env` files to git

## Auth Security
- ✅ Supabase JWT tokens auto-managed by supabase-js v2
- ✅ RLS policies enforce row-level data isolation
- ✅ `guardRoute()` called in every protected page's DOMContentLoaded
- ✅ Auto-logout after 30 min inactivity via `initAutoLogout()`

## Content Security Policy (`_headers` file)
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' cdn.jsdelivr.net cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com fonts.gstatic.com; font-src fonts.gstatic.com; img-src 'self' data:;
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

## Audit Steps
1. Grep for `innerHTML =` in all JS files
2. Verify each usage uses only safe/static values
3. Confirm no `SERVICE_ROLE_KEY` anywhere in client files
4. Verify `guardRoute()` is called in every page's `DOMContentLoaded`
5. Check that `try/catch` wraps every Supabase call
