---
name: glassmorphism-clay-designer
description: Expert guide for styling Cryo-Blue Claymorphism & Glassmorphism UI components in ProFrio Industrial. Use when creating modern cards, floating headers, blurred bottom nav bars, dynamic gradient borders, and 3D clay depth.
---

# Glassmorphism & Claymorphism Designer — ProFrio Industrial

## Design System Aesthetics

### 1. Modern Claymorphic Card Token
Combines soft dual inset/outset shadows with light blue tint for a tactile 3D feel.

```css
.clay-card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: var(--radius-xl);
  border: 2px solid rgba(255, 255, 255, 0.95);
  box-shadow:
    8px 10px 22px rgba(37,99,235,0.14),
    -4px -4px 12px rgba(255,255,255,1),
    inset -4px -4px 10px rgba(255,255,255,0.8),
    inset 4px 4px 10px rgba(37,99,235,0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
```

### 2. Sapphire Blue Hero Card (3D Gradient + Ambient Lighting)
```css
.hero-card-sapphire {
  background: linear-gradient(145deg, #0F172A 0%, #1E3A8A 55%, #2563EB 100%);
  border-radius: var(--radius-xl);
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    14px 18px 40px rgba(30,58,138,0.38),
    inset -6px -6px 16px rgba(15,23,42,0.5),
    inset 6px 6px 16px rgba(255,255,255,0.25);
  color: #FFFFFF;
  position: relative;
  overflow: hidden;
}
```

### 3. Glassmorphic Sticky Header / Floating Bar
```css
.glass-bar {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1.5px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 20px rgba(37,99,235,0.08);
}
```

### 4. Clay Input Inset Field
```css
.form-input {
  background: #F8FAFC;
  border: 2px solid var(--clay-blue-200);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  box-shadow: inset 3px 3px 8px rgba(37,99,235,0.08), inset -3px -3px 8px rgba(255,255,255,0.9);
  transition: all 0.2s ease;
}
.form-input:focus {
  outline: none;
  border-color: var(--clay-blue-600);
  background: #FFFFFF;
  box-shadow: 0 0 0 4px rgba(37,99,235,0.18), inset 2px 2px 5px rgba(37,99,235,0.05);
}
```

### 5. Gradient Pill Badges
```css
.pill-badge {
  background: linear-gradient(135deg, var(--clay-blue-100), #E0F2FE);
  color: var(--clay-blue-800);
  border: 1.5px solid var(--clay-blue-200);
  border-radius: var(--radius-full);
  padding: 0.3rem 0.85rem;
  font-size: 0.78rem;
  font-weight: 700;
  box-shadow: 3px 3px 8px rgba(37,99,235,0.1);
}
```
