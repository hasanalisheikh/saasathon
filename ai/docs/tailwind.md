# Tailwind CSS v4

> A CSS-first engine for building modern websites.

## Core Features

- **Oxide Engine**: Rebuilt from the ground up in Rust for extreme performance.
- **CSS-First Configuration**: No more `tailwind.config.js`. Configuration happens directly in CSS using the `@theme` directive.
- **Zero-Config**: Automatic content detection scans your project for template files.
- **Native CSS Variables**: Design tokens are automatically exposed as native CSS variables.
- **Modern CSS Support**: Native support for container queries, `color-mix()`, and 3D transforms.

## Configuration

Import Tailwind in your main CSS file:

```css
@import "tailwindcss";

@theme {
  --color-brand-500: oklch(0.64 0.22 250.0);
  --font-display: "Satoshi", "sans-serif";
}
```

Defining variables in `@theme` automatically generates utility classes like `bg-brand-500`.

## Installation

```bash
npm install tailwindcss @tailwindcss/postcss
```

## Migration from v3

- `tailwind.config.js` is no longer used.
- Use `npx @tailwindcss/upgrade` to automate the transition.
- Some utility names have changed (e.g., `bg-gradient-to-*` -> `bg-linear-to-*`).
