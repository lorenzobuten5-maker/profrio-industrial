---
name: skeleton-shimmer-builder
description: Builds smooth shimmer loading states and skeleton cards for ProFrio Industrial. Replaces jarring blank spaces while fetching data from Supabase. Activate when creating or updating list views, stats, or dashboard cards.
---

# Skeleton Shimmer Builder — ProFrio Industrial

## Core Principles
1. Never leave a card or list empty during asynchronous Supabase fetch calls.
2. Match skeleton dimensions 1:1 with the loaded content layout.
3. Use linear animated shimmer gradients for a premium feel.

## Skeleton Shimmer CSS

```css
@keyframes shimmerPulse {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-box {
  background: linear-gradient(
    90deg,
    rgba(226, 232, 240, 0.6) 25%,
    rgba(241, 245, 249, 0.9) 50%,
    rgba(226, 232, 240, 0.6) 75%
  );
  background-size: 200% 100%;
  animation: shimmerPulse 1.6s infinite ease-in-out;
  border-radius: var(--radius-md);
}

.skeleton-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-xl);
  padding: 1.25rem 1.5rem;
  box-shadow: var(--clay-shadow-white);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.skeleton-line {
  height: 14px;
  border-radius: 6px;
}
.skeleton-line.w-30 { width: 30%; }
.skeleton-line.w-50 { width: 50%; }
.skeleton-line.w-80 { width: 80%; }
.skeleton-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
}
```

## JS Utility Pattern (`utils.js`)

```javascript
window.renderSkeletonCards = function(containerId, count = 3) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = Array.from({ length: count }, () => `
    <div class="skeleton-card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div class="skeleton-box skeleton-line w-50" style="height:18px;"></div>
        <div class="skeleton-box skeleton-line w-30" style="height:14px; border-radius:12px;"></div>
      </div>
      <div class="skeleton-box skeleton-line w-80"></div>
      <div class="skeleton-box skeleton-line w-30" style="margin-top:0.25rem;"></div>
    </div>
  `).join('');
};
```
