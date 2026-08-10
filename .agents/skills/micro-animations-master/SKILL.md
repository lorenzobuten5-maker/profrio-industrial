---
name: micro-animations-master
description: Implements smooth, hardware-accelerated CSS animations, keyframes, hover elevations, ripple effects, and transition curves for ProFrio Industrial. Activate when adding micro-interactions, button hover states, card animations, or smooth transitions.
---

# Micro-Animations Master — ProFrio Industrial

## Core Principles
1. **Hardware Accelerated**: Always use `transform` and `opacity` (never animate `width`, `height`, `top`, `left`).
2. **Cubic-Bezier Easing**: Use `cubic-bezier(0.4, 0, 0.2, 1)` for standard motion, `cubic-bezier(0.34, 1.56, 0.64, 1)` for spring/bounce effects.
3. **Short Durations**: Interaction feedback: `150ms–220ms`. Page transitions: `300ms–350ms`.

## Animation Library Snippets

### 1. Button Hover Elevation & Scale (Spring Effect)
```css
.btn {
  transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s ease;
}
.btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 28px rgba(37,99,235,0.35);
}
.btn:active {
  transform: translateY(0) scale(0.97);
  box-shadow: 0 4px 12px rgba(37,99,235,0.2);
}
```

### 2. Card Entrance Stagger Animation
```css
@keyframes fadeInUpStagger {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.history-card, .recent-card, .stat-mini {
  animation: fadeInUpStagger 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* Stagger delay for lists */
.history-card:nth-child(1) { animation-delay: 0.05s; }
.history-card:nth-child(2) { animation-delay: 0.10s; }
.history-card:nth-child(3) { animation-delay: 0.15s; }
.history-card:nth-child(4) { animation-delay: 0.20s; }
.history-card:nth-child(5) { animation-delay: 0.25s; }
```

### 3. Checkbox Bounce Check
```css
.chk-group input[type="checkbox"] {
  transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.chk-group input[type="checkbox"]:checked {
  transform: scale(1.2);
}
```

### 4. Floating Ambient Particle Effect
```css
@keyframes ambientFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50%      { transform: translateY(-8px) rotate(3deg); }
}

.hero-card::before {
  animation: ambientFloat 6s ease-in-out infinite;
}
```

### 5. Ripple Click Effect (JS Utility)
```javascript
function attachRippleEffect(element) {
  element.addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size/2}px`;
    ripple.style.top = `${e.clientY - rect.top - size/2}px`;
    ripple.className = 'ripple-effect';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
}
```
