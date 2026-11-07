# @cpangular/ng-material-theme

A framework-free theming library where the browser is the theme engine. A theme is a handful of input colours; everything else is derived in CSS with `light-dark()`, `oklch(from …)` and `color-mix()`. Any element can carry `theme="name"` to re-theme its subtree. Angular Material is supported through an optional adapter, not a dependency.

This branch (`feature/ng21`) is a rewrite in progress. See [PLAN.md](PLAN.md) for the plan and current state.

## Browser baseline

Chrome 123, Firefox 128, Safari 17.5 (mid 2024). The library needs `light-dark()`, relative colour syntax and `color-mix()`; there are no fallbacks for older browsers.

## Workspace

```
projects/ng-material-theme/    the library (Sass source, built CSS, theme switcher)
projects/docs/                 documentation site (static HTML built with the library)
```

```bash
pnpm install
pnpm build      # library first, then its consumers
pnpm test       # library verification (includes the docs chapter-order check)

cd projects/docs && pnpm serve   # view the built docs at http://localhost:8080
```

Releases are managed by [cpdevtools/git-flow](https://github.com/cpdevtools/git-flow): manifests carry `0.0.0-MAIN`, the real version lives in `.publish/versions.yml`.
