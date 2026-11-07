# Simple Theming Demo

Static HTML demonstration of the ng-material-theme system with CSS `light-dark()` support.

## Features

- Single theme definition works for both light and dark modes
- Demonstrates color variants (lighter, darker, tints)
- Shows automatic contrast color calculation
- Modern CSS using `color-mix()` in OKLab color space

## Building

```bash
pnpm install
pnpm build
```

## Viewing

Open `dist/index.html` in a browser from mid 2024 or later: Chrome 123, Firefox 128, Safari 17.5. The library relies on `light-dark()`, relative colour syntax (`oklch(from …)`) and `color-mix()`.

`dist/crossfade.html` is a self-contained page (core.css inlined, built by `build.ts`) for checking the theme crossfade by hand: two page themes, a gradient, a coloured shadow, a nested theme that switches itself, a nested theme that only inherits, and a `color-scheme: dark` panel with no theme attribute. Copy that one file anywhere and open it in Chrome, Firefox and Safari.

Or use the built-in server:

```bash
pnpm serve
```

## Browser check

`pnpm check:browser` (TypeScript, run directly by Node 24) renders the built demo in headless Chromium (Playwright) in light and dark mode, writes screenshots to `test/out/`, and measures the painted contrast of every surface tile, sub-theme button and palette swatch. It fails if text on a surface or a non-disabled swatch's `--contrast--high` is below 4.5:1, or `--contrast` below 3:1. It is not part of CI; run `npx playwright install chromium` once first.

## Switching Modes

`core.css` sets `color-scheme: light dark` on the root, so the page follows the OS preference. The mode toggle in the page overrides it by setting `color-scheme` on the root element; to force a mode in CSS, set it on any element:

```css
.dark-card {
  color-scheme: dark;
}
```
