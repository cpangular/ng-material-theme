# Simple Theming Demo

Static HTML demonstration of the ng-material-theme system with CSS `light-dark()` support.

## Features

- Single theme definition works for both light and dark modes
- Demonstrates color variants (lighter, darker, tints)
- Shows automatic contrast color calculation
- Modern CSS using `color-mix()` in OKLab color space

## Building

```bash
npm install
npm run build
```

## Viewing

Open `dist/index.html` in a modern browser (Chrome 111+, Firefox 113+, Safari 16.4+)

Or use the built-in server:

```bash
npm run serve
```

## Switching Modes

Edit the `<style>` section in `src/index.html` and change:

```css
:root {
  color-scheme: light; /* Change to 'dark' */
}
```

Then rebuild and all colors automatically update!
