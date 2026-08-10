---
name: offline-sync-validator
description: Validates, debugs, and monitors the IndexedDB offline sync queue in ProFrio Industrial. Checks pending form count, sync status, and handles sync failures. Activate when the user reports forms not syncing or offline issues.
---

# Offline Sync Validator — ProFrio Industrial

## Architecture (`js/offline-sync.js`)
- **IndexedDB**: `ProFrioOfflineDB`, store: `pending_forms`
- **Auto-sync**: Triggered on `window online` event
- **Manual sync**: `window.OfflineSync.checkPendingAndSync()`

## Browser Console Diagnostics
```javascript
// Check how many forms are pending sync:
await window.OfflineSync.getPendingCount();

// Force manual sync now:
await window.OfflineSync.checkPendingAndSync();
```

## Testing Offline Mode
1. DevTools → Network → Set to **Offline**
2. Fill and submit a form → should queue in IndexedDB
3. `await window.OfflineSync.getPendingCount()` → should return `1`
4. Set network back to **Online**
5. `getPendingCount()` should return `0`, form visible in Supabase

## Sync Failure Handling
- If a form fails to sync, it stays in the queue for the next `online` event
- Failed items do NOT block other pending items from syncing
- Check `console.warn('[OfflineSync]')` messages in DevTools

## Storage Limits
| Metric | Estimate |
|---|---|
| IndexedDB quota per origin | ~500 MB – 1 GB |
| Average pending form size | ~50–100 KB (with photos) |
| Estimated capacity | ~5,000–10,000 pending forms |

## Preventing Duplicate Forms on Sync
If a user saves a form online AND offline, a duplicate may be created on sync.
**Fix**: Add a unique constraint in Supabase:
```sql
ALTER TABLE formularios_intervencion
  ADD CONSTRAINT unique_user_numero UNIQUE (usuario_id, numero);
```
The sync function will then fail gracefully on duplicate and remove from queue.

## Queue Cleanup (Optional Enhancement)
Auto-purge records older than 7 days that never synced:
```javascript
const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
// Delete IndexedDB records where timestamp < sevenDaysAgo
```
