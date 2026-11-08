# @cpangular/ng-material-theme

Framework-free CSS theming. A theme is a few input colours; everything else is derived in the browser with `light-dark()`, `oklch(from …)` and `color-mix()`. Any element can carry `theme="name"` to re-theme its subtree. Angular Material is supported through an optional adapter, not a dependency.

**Documentation:** https://cpangular.github.io/ng-material-theme/

## Install

```bash
npm install @cpangular/ng-material-theme
```

```html
<link
  rel="stylesheet"
  href="node_modules/@cpangular/ng-material-theme/css/dist/core.css"
/>
```

With a bundler, `import "@cpangular/ng-material-theme/core.css"` loads the same file.

## One token and its contrast

`core.css` gives every token a default, so this works with nothing set:

```html
<style>
  .box {
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    background: var(--color--primary);
    color: var(--color--primary--contrast);
  }
</style>

<div class="box">
  Background: --color--primary. Text: --color--primary--contrast.
</div>
```

`--color--primary--contrast` is black or white, whichever reads better on primary, and follows primary when it changes. The [docs](https://cpangular.github.io/ng-material-theme/) take it from here: light and dark, your own colours, variants, surfaces, nested themes, Sass, runtime switching and the Angular Material adapter.

## Package contents

| Import                                              | What it is                                                                   |
| --------------------------------------------------- | ---------------------------------------------------------------------------- |
| `@cpangular/ng-material-theme/core.css`             | the library: inputs, derived tokens, surfaces, elevation, sizes              |
| `@cpangular/ng-material-theme/material-adapter.css` | `--mat-sys-*` colour tokens for Angular Material 21, computed from the theme |
| `@cpangular/ng-material-theme/theme-switcher`       | runtime theme and colour-scheme switching, `defineTheme()`                   |
| `@cpangular/ng-material-theme/theming`              | Sass: `core()`, `createTheme()`, `tone()`, container helpers                 |

## Browser baseline

Chrome 123, Firefox 128, Safari 17.5 (mid 2024). There are no fallbacks for older browsers.

## Upgrading from 17.x

See [BREAKING-CHANGES.md](BREAKING-CHANGES.md) for the old → new variable table and the removed Angular service.

## Developing

```
projects/ng-material-theme/    the library (Sass source, built CSS, theme switcher)
projects/material-demo/        Angular Material app used by the docs' chapter 15
projects/docs/                 documentation site (static HTML built with the library)
```

```bash
pnpm install
pnpm build      # library first, then its consumers
pnpm test       # library verification (includes the docs chapter-order check)

cd projects/docs && pnpm serve   # view the built docs at http://localhost:8080
```

Releases are managed by [cpdevtools/git-flow](https://github.com/cpdevtools/git-flow): manifests carry `0.0.0-MAIN`, the real version lives in `.publish/versions.yml`. Merging a release PR publishes to npm and tags the release; the docs deploy to GitHub Pages from `release/main`.
