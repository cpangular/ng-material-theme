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

Or use the built-in server:

```bash
pnpm serve
```

## Switching Modes

Edit the `<style>` section in `src/index.html` and change:

```css
:root {
  color-scheme: light; /* Change to 'dark' */
}
```

Then rebuild and all colors automatically update!
