# VoltScout Color System Guidelines

## Overview

This document defines the approved color tokens and patterns to ensure consistent theming across the application. **All colors must use CSS variables** to support light/dark mode switching.

## Core Principle

**NEVER use hardcoded colors** in components. Always use semantic tokens from the design system.

---

## ✅ Approved Color Tokens

### Semantic Colors (Primary Usage)

| Token | Usage |
|-------|-------|
| `text-foreground` | Primary text |
| `text-muted-foreground` | Secondary text, captions |
| `text-primary` | Accent text, links |
| `text-destructive` | Error text |
| `bg-background` | Page background |
| `bg-card` | Card surfaces |
| `bg-muted` | Muted surfaces |
| `bg-primary` | Primary buttons |
| `bg-secondary` | Secondary surfaces |
| `border-border` | Default borders |

### Data Visualization

| Token | Usage |
|-------|-------|
| `text-data-positive` / `bg-data-positive` | Positive values, gains |
| `text-data-negative` / `bg-data-negative` | Negative values, losses |
| `text-data-warning` / `bg-data-warning` | Warnings, caution |
| `text-data-neutral` / `bg-data-neutral` | Neutral data |

### Brand Colors (Watt)

| Token | Usage |
|-------|-------|
| `text-watt-bitcoin` / `bg-watt-bitcoin` | Bitcoin/orange accent |
| `text-watt-trust` / `bg-watt-trust` | Trust/teal accent |
| `text-watt-accent` / `bg-watt-accent` | Primary brand accent (teal) |
| `text-watt-purple` / `bg-watt-purple` | Purple accent |
| `text-watt-warning` / `bg-watt-warning` | Warning states |
| `text-watt-success` / `bg-watt-success` | Success states |
| `text-watt-blue` / `bg-watt-blue` | Professional blue |
| `text-watt-orange` / `bg-watt-orange` | Vibrant orange |

### Chart Colors

| Token | CSS Variable |
|-------|--------------|
| `chart-1` | `--chart-1` (Primary blue) |
| `chart-2` | `--chart-2` (Purple) |
| `chart-3` | `--chart-3` (Green) |
| `chart-4` | `--chart-4` (Amber) |
| `chart-5` | `--chart-5` (Red) |
| `chart-grid` | `--chart-grid` (Grid lines) |

---

## ❌ Forbidden Patterns

### Never Use These

```tsx
// ❌ BAD - Hardcoded colors
className="text-white"
className="text-black"
className="bg-white"
className="bg-black"
className="text-slate-500"
className="text-gray-600"
className="bg-gray-100"

// ❌ BAD - Light-mode only colors
className="bg-amber-50"
className="bg-cyan-50"
className="bg-violet-50"

// ❌ BAD - Invisible gradient text
className="from-white ... text-transparent"
```

### Use These Instead

```tsx
// ✅ GOOD - Semantic tokens
className="text-foreground"
className="text-muted-foreground"
className="bg-background"
className="bg-card"
className="bg-muted"

// ✅ GOOD - Opacity-based colors (work in both themes)
className="bg-amber-500/10"
className="bg-watt-accent/10"
className="bg-watt-purple/10"

// ✅ GOOD - Semantic gradient text
className="from-foreground via-watt-trust to-watt-bitcoin text-transparent"
```

---

## Gradient Text Guidelines

When using gradient text with `text-transparent`, ensure:

1. **Start color is visible**: Use `from-foreground` not `from-white`
2. **All gradient colors exist in Tailwind config**: Check `tailwind.config.ts`
3. **Fallback for no-support**: The gradient should degrade gracefully

```tsx
// ✅ GOOD - Theme-aware gradient
<span className="bg-gradient-to-r from-foreground via-watt-trust to-watt-bitcoin bg-clip-text text-transparent">
  Gradient Text
</span>

// ✅ ALSO GOOD - Using brand utility
<span className="text-gradient-watt">
  Gradient Text
</span>
```

---

## Adding New Colors

When you need a new color:

1. **Add CSS variable** to `src/index.css` (both `:root` and `.dark`)
2. **Add Tailwind token** to `tailwind.config.ts` under `extend.colors`
3. **Use HSL format** for all color values

Example:

```css
/* src/index.css */
:root {
  --my-new-color: 220 80% 50%;
}
.dark {
  --my-new-color: 220 80% 60%;
}
```

```typescript
// tailwind.config.ts
colors: {
  'my-new-color': 'hsl(var(--my-new-color))',
}
```

---

## Quick Reference

| Need | Use |
|------|-----|
| Primary text | `text-foreground` |
| Secondary text | `text-muted-foreground` |
| Error text | `text-destructive` |
| Success text | `text-data-positive` |
| Warning text | `text-data-warning` |
| Card background | `bg-card` |
| Page background | `bg-background` |
| Muted surface | `bg-muted` |
| Brand accent | `text-watt-accent` or `bg-watt-accent` |
| Brand gradient | `bg-watt-gradient` |
| Glow effect | `shadow-watt-brand` |

---

## Verification Checklist

Before committing, verify:

- [ ] No `text-white` on light backgrounds
- [ ] No `bg-white` or `bg-black` in components
- [ ] No `text-slate-*` or `text-gray-*` hardcoded colors
- [ ] All gradient text uses `from-foreground` or semantic start colors
- [ ] All custom colors are in both `index.css` and `tailwind.config.ts`
- [ ] Component works in both light and dark modes
