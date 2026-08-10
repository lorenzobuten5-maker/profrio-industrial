---
name: code-refactor-pro
description: Analyzes ProFrio Industrial code to remove dead code, deduplicate functions, and improve readability. Activate when the user asks to clean up, optimize, or refactor code files.
---

# Code Refactor Pro — ProFrio Industrial

## Refactoring Checklist

### 1. Dead Code Removal
- Functions defined but never called → remove them
- Commented-out blocks → remove if older than 1 version
- `console.log` debug statements → remove (keep `console.warn`/`console.error`)

### 2. Deduplication Rules
- Utility functions (debounce, timeAgo, etc.) belong **only** in `js/utils.js`
- If the same function exists in 2+ files → move to `utils.js`, export as `window.*`
- Duplicate CSS selectors → merge into one rule block

### 3. JSDoc for Complex Functions
```javascript
/**
 * @param {string} userId - Supabase user UUID
 * @param {string} tabla - Supabase table name
 * @returns {Promise<boolean>}
 */
async function syncFormToSupabase(userId, tabla) { ... }
```

### 4. CSS Cleanup
- Remove unused CSS classes (grep for the class in all HTML files first)
- Consolidate `@media` queries into `css/responsive.css`
- Replace hardcoded hex colors with design token vars: `var(--clay-blue-600)`

### 5. HTML Cleanup
- Remove `type="text/javascript"` from `<script>` tags (deprecated)
- Add `alt=""` to decorative `<img>` tags
- Remove duplicate inline `style` that copies existing CSS classes

## Process
1. Read the file fully first
2. Identify items from the checklist
3. Apply all fixes in a **single** `multi_replace_file_content` call
4. Report: files cleaned, lines removed, duplicates merged
