---
name: fuzzy-search-optimizer
description: Implements and tunes the fuzzy search engine in ProFrio Industrial using Levenshtein distance. Use when improving search, adding typo tolerance, or extending search to new data fields.
---

# Fuzzy Search Optimizer — ProFrio Industrial

## Current Implementation (`js/fuzzy-search.js`)
Provides three global functions:
- `window.fuzzyMatch(query, text)` → `boolean`
- `window.filterArrayFuzzy(items, query, keys)` → `array`
- `window.calcLevenshteinDistance(a, b)` → `number`

## Algorithm Rules
```javascript
// Words ≥ 4 chars: allows up to 2 typos (Levenshtein ≤ 2)
// Words < 4 chars: must be an exact substring
// Multi-word queries: ALL words must match at least one token in the text

fuzzyMatch('Aprezio', 'Aprecio SA');     // ✅ true (1 edit)
fuzzyMatch('Juan', 'Juna Carlos');        // ✅ true (transposition)
fuzzyMatch('xyz', 'ProFrio Industrial'); // ❌ false (no match)
```

## Integration Pattern
```javascript
// In search input event listener (debounced 300ms):
const query = searchInput.value.toLowerCase().trim();
const filtered = allItems.filter(item => {
  if (!query) return true;
  const text = `${item.cliente || ''} ${item.nombre || ''} ${String(item.numero || '')}`;
  return window.fuzzyMatch ? window.fuzzyMatch(query, text) : text.includes(query);
});
renderList(filtered);
```

## Active Integration Points
| File | Status |
|---|---|
| `js/historial-formularios.js` | ✅ Integrated in v25 |
| `js/perfil.js` | ⚠️ Uses simple `.includes()` — upgrade here |
| `js/dashboard.js` | N/A — no search in dashboard |

## Extending to Perfil
```javascript
// Replace in js/perfil.js search handler:
const textContent = `${f.cliente || ''} ${f._tipo || ''} ${String(f.numero || '')}`;
const coincide = window.fuzzyMatch
  ? window.fuzzyMatch(query, textContent)
  : textContent.toLowerCase().includes(query);
```

## Performance Notes
- Levenshtein is O(n×m) — fine for arrays up to ~1000 items
- Debounce at 300ms prevents excessive calls ✅
- For datasets > 1000, limit search scope to last 500 most recent items
