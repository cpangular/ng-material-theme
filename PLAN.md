# ng-material-theme — Working Plan

_Supersedes REDESIGN_PLAN.md (see git history). The code is the source of truth for direction._

## What we are building

A framework-free theming library where the browser is the theme engine.

- A theme is a handful of input variables (a light and a dark primary, optionally more).
- Everything else is derived in CSS with `light-dark()`, `oklch(from …)` and `color-mix()`.
- Any element can carry `theme="name"` and re-derive the whole palette for its subtree (sub-theming).
- Theme data can come from anywhere (a stylesheet, a database row, user input) because it is just a few variables.
- Angular Material is a consumer, reached through an adapter computed at Sass build time from Material's own role tables. It is not a runtime dependency.
- Typography is left to the consumer (Material apps use `mat.theme()`). The library ships a size scale with a density multiplier; Material component density also comes from `mat.theme()`.

## Guiding rules

1. **KISS.** Plain CSS and Sass, one small TypeScript file, static HTML docs, one small Node build script. No frameworks in the library or the docs site.
2. **Teach in dependency order.** Every docs chapter uses only concepts taught in earlier chapters. The build enforces it.
3. **Docs run the real library.** Every example is a standalone page rendered live in the docs, and the source shown beside it is that same file, pulled in at build time so they cannot drift.
4. **Derive what Material owns.** The adapter reads Material's own role tables at build time; nothing role-by-role is hand-maintained.
5. **Keep animation, register little.** Only the theme inputs are registered with `@property` (the twelve `--theme--{light,dark}--color--<palette>` inputs and the theme-level tuning variables). Derived tokens stay unregistered, so a theme change crossfades because derived values are re-substituted from the animating inputs every frame.

## Package layout (target)

```
projects/ng-material-theme/
  theming/            Sass partials (public API: _index.scss)
  css/
    src/              core.scss, material-adapter.scss, theme-switcher.ts
    dist/             built output (ignored by git)
    tsconfig.json
  package.json        @cpangular/ng-material-theme: build, watch, test, exports
projects/docs/        static documentation site (sass + html + the library itself)
projects/material-demo/   minimal Angular Material app, iframed by the docs, verifies the adapter
```

---

## Phase 0 — Housekeeping (get the repo honest)

Goal: `pnpm build` at the root builds the library then its consumers, and nothing points at files that do not exist.

- [ ] Commit the in-flight ThemeSwitcher colour-scheme work and demo pod as they are.
- [ ] Delete `angular.json`, root `tsconfig.json`, `projects/ng-material-theme/old/`, `projects/test-theme/`, `REDESIGN_PLAN.md*` and the Angular dependencies of the root `package.json`. Rename the root package to `ng-material-theme-workspace` (private). History lives in git.
- [ ] Add `projects/ng-material-theme/package.json` as `@cpangular/ng-material-theme`:
  - `build`: `sass --style=compressed --load-path=node_modules css/src:css/dist && tsc -p css` (own `css/tsconfig.json`, ES2022, declarations); `watch`; `test` runs the Verification section.
  - `exports`: `./core.css`, `./material-adapter.css`, `./theme-switcher` (js + d.ts), `./theming` (`sass` condition pointing at `theming/_index.scss`).
  - `files`: `css/dist`, `theming`. `devDependencies`: `@angular/material` and `@angular/cdk` 20.x (needed only to build the adapter).
- [ ] Untrack `css/dist/` and `simple-theming-demo/dist/` and add them to `.gitignore`. Every consumer (demo, docs, material-demo) depends on `"@cpangular/ng-material-theme": "workspace:*"` so `pnpm -r build` builds the library first.
- [ ] Browser baseline in docs and README: Chrome 123, Firefox 128, Safari 17.5 (mid 2024). Safari confirmed by one manual check before release.

Done when: a clean clone runs `pnpm build` successfully and `git status` is clean afterwards.

## Phase 1 — Patch the holes in the colour system

Goal: sub-theming semantics are settled, every variable that is read is defined, and runtime colours are always readable.

- [ ] **Cascade and inheritance rules for `core()`.**
  (a) Everything `core()` emits sits under zero-specificity selectors (`:where(:root)`, `:where(:root, [theme])`), so any user, `createTheme` or `defineTheme` rule wins regardless of stylesheet order.
  (b) `core()` never declares the primary/error inputs or the tuning variables. Their defaults are the `@property` initial values, so a nested `[theme]` inherits every input it does not set.
  (c) The four derived palettes (secondary, tertiary, neutral, neutral-variant) are declared as `oklch(from var(--theme--…--primary) …)` in `:where(:root, [theme])`, so a nested theme re-derives them from its (possibly inherited) primary unless it sets them explicitly.
  (d) `core()` emits `:where(:root) { color-scheme: light dark; }`, so the OS preference applies with no JavaScript.
  (e) `--elevation-shadow-color` becomes a plain `#000`.
- [ ] **Surface roles via a tone function.** Add one Sass function `tone($input, $T)` returning `oklch(from <input> <L> calc(c * <k>) h)`, where L maps Material's tone T (CIELAB L*) to OKLab L, with L = (T+16)/116 for T > 8 else cbrt(T/903.3), and k = min(1, 4·L·(1−L)) keeps chroma in gamut (both precomputed in Sass). `core()` emits, per mode wrapped in `light-dark()`, Material's tone numbers (light / dark) from the neutral (n) or neutral-variant (nv) input:
  surface n98/n6, surface-dim n87/n6, surface-bright n98/n24, surface-container-lowest n100/n4, -low n96/n10, surface-container n94/n12, -high n92/n17, -highest n90/n22, on-surface n10/n90, surface-variant nv90/nv30, on-surface-variant nv30/nv90, outline nv50/nv60, outline-variant nv80/nv30. `--color--background` and `--color--on-background` alias surface and on-surface. These are emitted by `core()` in `:where(:root, [theme])`, not by the adapter, so `core.css` alone defines them.
- [ ] **Contrast from WCAG luminance.** The current step function thresholds OKLab L, which cannot guarantee AA for every hue. Change the contrast base to `color(from var(--c) srgb-linear S S S)` with `S = clamp(0, (0.179 - (0.2126 * r + 0.7152 * g + 0.0722 * b)) * 1e6, 1)`, which picks black or white at the exact luminance crossover (at least 4.58:1 against any colour). Contrast mixes use `color-mix(in oklab, …)`. Compute each variant's contrast per mode from the `--theme--light/dark--color--X-<variant>` intermediates and wrap the pair in `light-dark()`, so no joined token is ever a relative-colour origin. Delete `calculate-optimal-contrast`, `_contrast-utils.scss`, the Sass `contrast:` config key and the `--contrast--base` declarations in `createTheme`; Sass and CSS themes then pick the same on-colour. Guarantees, stated in the Variants chapter: `--contrast--high` ≥ 4.5:1, `--contrast` ≥ 3:1, `--contrast--low` decorative.
- [ ] **Single default.** One Sass map each for colour-input, blend, opacity, contrast-blend (100/90/80%) and disabled defaults, used only as `@property` initial values. Delete the `$palette-defaults` duplication and the literal fallbacks in `generate-theme-*-defaults` (which today emit 84%/72% while the registered values are 90%/80%). `createTheme` emits a theme-level or per-palette variable only for keys the user passed: no re-emitted defaults, no `apply-density(0)`, so nested themes inherit correctly.
- [ ] **Remove library-level Material aliases.** `--color--on-<palette>`, `--color--<palette>-container` and the other `generate-md3-role-aliases()` output leave the core; the demo and docs use `--color--<palette>--contrast` instead. Every Material-only role (X-container, fixed, inverse, scrim, shadow, surface-tint) comes only from the Phase 3 adapter, so there is one mapping, not two.
- [ ] **Delete dead code.** The seven uncalled `generate-*` mixins in `_color-variants.scss`; `density-selectors()` and its call; `_typography.scss` and `createTheme`'s `typography` key (`@error` pointing at `mat.theme()` if passed); `$set-material-vars` in `_palette-utils.scss`; unused `@use` lines. `apply-density` `@error`s outside 0..−3.

Done when: `pnpm test` passes and the demo shows the surface ladder in both modes with correct text on every surface.

## Phase 2 — Register inputs only

Goal: far fewer `@property` registrations, same features, theme crossfade intact.

Current numbers (minified): 542 KB, 23 KB gzipped, 1657 `@property` rules, 1662 root declarations.

- [ ] **Register inputs only.** Register exactly the twelve colour inputs (`<color>`) and the theme-level tuning variables (`--theme--blend--*`, `--theme--opacity--*`, `--theme--contrast-blend*`, `--theme--disabled-*`, `--theme--density-scale`), all `inherits: true`, with the library default as `initial-value`. Unregister everything else: per-mode intermediates, joined `--color--*` leaves, contrasts, disabled, per-palette percentages.
- [ ] `core()` emits `--theme--animatable: <comma list of the registered names>` so plain CSS can write `transition-property: var(--theme--animatable)`.
- [ ] Record the trade-offs in the Animating chapter: a light/dark flip does not crossfade (it is instant, as the OS flip is), and joined tokens are not animatable on their own.
- [ ] Gain to document in the Light and dark chapter: because unregistered `light-dark()` resolves where it is used, `color-scheme` on any element flips its subtree, with no `theme` attribute needed.

Done when: the `@property` count equals the twelve colour inputs plus the tuning variables (printed by Verification step 4), the before/after gzipped size and count are in the commit message, and a manual crossfade between two themes, including a nested `[theme]`, animates in Chrome, Firefox and Safari.

## Phase 3 — Material adapter computed from Material's tables

Goal: an adapter derived from Material's own role tables and verified against real components.

- [ ] **Adapter computed in Sass.** `material-adapter.scss` `@use`s `@angular/material/core/tokens/m3/md-sys-color` and calls `md-sys-color-values-light($palettes)` and `-dark($palettes)`, where `$palettes` maps palette → tone → `tone(var(--theme--<mode>--color--<palette>), T)` (the Phase 1 function). It zips the two results into `--mat-sys-<role>: light-dark(<light>, <dark>)`. Rules on top of the tables: a role `core()` already defines maps to `var(--color--<role>)`; `on-<palette>` maps to `var(--color--<palette>--contrast--high)`; `-fixed` roles use the light input in both modes. Also emit `--mat-sys-neutral10` and `--mat-sys-neutral-variant20`, which Material's `_system.scss` adds separately and form-field and sidenav read.
- [ ] The adapter is emitted under `:where(:root, [theme])`, the same selector as `core()`, never `:root` alone, so every themed element re-maps `--mat-sys-*` and Material sub-theming works.
- [ ] Non-colour: the adapter emits only `--mat-sys-level0..5: var(--elevation-0..5)`. `mat.theme()` without colour still emits shape and state-layer tokens and omits elevation, so the adapter emits no shape or state tokens. Typography and density come from `mat.theme((typography: …, density: …))`.
- [ ] **`material-demo` project.** A minimal Angular app with a page of common Material components (buttons, form fields, cards, menu, dialog, tabs, lists). It depends on the library via `workspace:*`, imports only through its exports, and lists styles in this order: `core.css`, `material-adapter.css`, then `styles.scss` containing `mat.theme((typography: …, density: …))`. It has a nested `theme` region whose menu and dialog put `theme="x"` on the panel (overlays render outside the subtree). `themeSwitcher` is used from `afterNextRender`. `docs/build.mjs` copies its `ng build` output to `dist/material/` for the Angular Material chapter's iframe.
- [ ] Bump Material to 21 (a rebuild picks up its tables).

Done when: `material-demo` looks right in light and dark across three themes plus the nested region, and the Angular Material chapter is written.

## Phase 4 — Runtime: switcher and data-driven themes

Goal: the smallest possible JavaScript surface for runtime theming. No colour maths in JavaScript, ever.

- [ ] Keep `ThemeSwitcher` with four changes: `setColorScheme('auto')` removes the inline style (core's `color-scheme: light dark` does the rest; delete the matchMedia listener); `restoreTheme` sets the saved attribute unconditionally (CSS picks it up when the rule arrives); `setTheme` drops its unknown-theme check; the `themeSwitcher` singleton is created only when `typeof document !== 'undefined'` (SSR-safe import).
- [ ] `defineTheme(name, vars)` takes a flat object whose keys are the documented input variables, e.g. `{"--theme--light--color--primary": "#3f51b5"}`: only `--theme--*` keys, the six standard palettes plus tuning. Custom palettes are Sass-only. Implementation: append one `<style data-theme=name>` to head, `sheet.insertRule('[theme="' + CSS.escape(name) + '"]{}')`, `rule.style.setProperty(k, v)` per entry (no string-built CSS); colour values failing `CSS.supports('color', v)` are skipped with `console.warn`; then call `discoverThemes()`. `removeTheme(name)` removes the element, clears the attribute if that theme is active, and calls `discoverThemes()`.
- [ ] A three-line head script, shown in the Runtime chapter, applies the stored theme and scheme before first paint (no flash of the wrong theme).
- [ ] Storage key migration from the old `cpngTheme` keys is not done; this is a breaking release.

Done when: the Data-driven chapter example loads themes from a JSON fixture (one row with an invalid colour that warns), nests one inside another, and restores it after reload; the Runtime switching and Animating chapters are written.

## Phase 5 — Documentation site

Goal: a static site, built with the library itself, where every page is a working example of what it teaches.

### Site mechanics (KISS)

- `projects/docs/src/` holds one HTML file per chapter, `chrome.css`, and `examples/`.
- Each example is a standalone page `examples/NN-name.html` plus its own optional `.css`, `.scss`, `.js` or `.json` files, rendered in an `<iframe>` with the escaped source of those files beneath it. `<!-- include: examples/<file> -->` works for any extension; a missing file, or a chapter with no example, fails the build. Sass compiles non-partial `examples/*.scss` to `dist/examples/*.css`.
- An example loads only `core.css` (and later the files of the chapter it belongs to). `theme-switcher.js` is loaded by the site chrome and by examples from Runtime switching on. Example styling never lives in `chrome.css`. Site chrome never shares a document with an example.
- Navigation is a plain list. No client-side framework. `simple-theming-demo` is deleted when the docs site builds.
- `build.mjs` also generates the Reference page from the compiled `core.css`.

### Chapter order and what each introduces

Each chapter may use only what the chapters above it taught.

| # | Chapter | Introduces | Live example |
|---|---------|-----------|--------------|
| 1 | Getting started | prerequisites (custom properties, `var()`); include `core.css` by its package path; a token `--color--primary`; its contrast `--color--primary--contrast` as "the text colour to use on primary" | A box, no configuration. |
| 2 | Light and dark | `color-scheme`: core defaults to `light dark` (follows the OS); `light` or `dark` forces a mode on any element and its subtree; every token has a light and a dark value | The box in three panels with `color-scheme` light, dark, light dark. No script. |
| 3 | Your colours | input variables `--theme--light--color--primary` and `--theme--dark--color--primary` set in a plain `:root` rule (order-independent); the six palettes: secondary, tertiary, neutral, neutral-variant derived from primary, error independent; overriding any; one colour for both modes is the same value in both inputs | Six palette boxes, one overridden. |
| 4 | Variants | lighter/darker (mix toward white/black); higher/lower (mode-relative, builds on 2); reverse-mode; tints 1–9; disabled; contrast with high/low emphasis and the guarantees; the name grammar `--color--{palette}[-{variant}][-reverse-mode][-disabled][--contrast[--high\|--low]]`; "the percentages are tunable, see Tuning" | Swatch grid for one palette. |
| 5 | Surfaces and elevation | the surface ladder (surface, dim, bright, container lowest…highest), on-surface, surface-variant, on-surface-variant, outline, outline-variant, background/on-background; elevation 0–5 | Page background, cards at each elevation, text on each; plain `rem` spacing. |
| 6 | Themes | `theme` attribute on any element; named themes as plain CSS `[theme="x"] { inputs }`; default theme (chapter 3's `:root` rule already was one); nesting; what a nested theme inherits (primary, error, tuning) versus re-derives (secondary, tertiary, neutral, neutral-variant from primary unless set); combining with chapter 2's `color-scheme` | Two sibling themed panels, a nested theme that sets only tertiary, a dark card inside a light theme. |
| 7 | Using Sass | `@use` path and load path for the installed package; `core()` replaces the `core.css` link (never both); `createTheme()` as the Sass form of chapter 6's rule; config shapes: single colour, light/dark pair | Chapter 6 rebuilt in Sass beside the CSS version, identical in both modes. |
| 8 | Custom palettes | adding a palette beyond the six with `createTheme` (Sass-only) | A "brand" palette with its full variant set. |
| 9 | Containers | `apply-container` / `apply-container-vars`: filled, text, normal, borders, elevation, disabled, reverse-mode (all from chapters 4–5) | Buttons and cards built only with the mixin. |
| 10 | Tuning | blends, opacities, contrast-blends, disabled saturation/opacity; theme-level variables versus per-palette `-override` variables and the fallback chain; overrides must sit on `:root` or a `[theme]` element; the Sass map config shape (value plus tuning keys) | Three themed panels each overriding one theme-level variable inline, one panel overriding `--color--primary--blend--darker-1-override`. |
| 11 | Sizes and density | `--theme--size--N`, `--theme--density-scale`, `createTheme` density key (0 to −3) | Spacing and controls at density 0 to −3. |
| 12 | Runtime switching | ThemeSwitcher (first JavaScript): discovery, `setTheme`, `setColorScheme` light/dark/auto (auto is chapter 2's `light dark`), persistence, the three-line head script against a flash of the wrong theme | A theme select and mode buttons; the site's own chrome explained. |
| 13 | Animating theme changes | registered inputs are why a theme change crossfades; `transition-property: var(--theme--animatable)` on `:root, [theme]`; `transition: all` does not cover custom properties; light/dark flips do not crossfade | `setTheme` crossfade with a gradient, a shadow and a nested `[theme]`. |
| 14 | Data-driven themes | `defineTheme(name, vars)` with a flat map of the input variables from chapters 3, 6 and 10; `removeTheme`; JSON fixtures; invalid colours warn; standard palettes only | Load from a fixture, add one from a form, nest it, reload to see it restored. |
| 15 | Angular Material | `material-adapter.css` after `core.css`; `mat.theme()` for typography, density, shape and state; Material density versus `--theme--density-scale`; Material-only roles come from the adapter; overlays need `theme` on the panel; use `themeSwitcher` from `afterNextRender` | The built `material-demo` in an iframe, including a nested theme region. |
| — | Reference | every token grouped by palette | Generated by `build.mjs` from compiled `core.css`; one live swatch per token, with a theme select. |

Writing rules: one concept per section, example first, prose second, source listing third. Examples use no Sass before chapter 7, no JavaScript of any kind before chapter 12, no Material before chapter 15, and plain `rem` spacing before chapter 11. The rules apply to example sources, not site chrome.

Done when: chapters 1–11 are written and `node build.mjs` passes the chapter-order check: a pattern table next to the chapter table (`theme=` → 6, `@use`/`.scss` → 7, `apply-container` → 9, `--theme--size`/`density` → 11, `<script`/`themeSwitcher` → 12, `--theme--animatable` → 13, `defineTheme` → 14, `mat-`/`--mat-sys` → 15), and any example of chapter N matching a pattern of a later chapter fails the build.

## Phase 6 — Release

- [ ] `README.md` becomes a short pointer: what it is, install, the chapter 1 example, link to the docs.
- [ ] A short "Breaking changes from 17.x" note: an old→new variable-name table, `theme` attribute on `<html>` not `<body>`, no Angular service, no `theme-mode` attribute, storage keys changed, and the removed `--color--on-<palette>` / `-container` library aliases (use `--contrast` or the adapter).
- [ ] CI runs `pnpm build && pnpm test`, publishes the package on tag and deploys `projects/docs/dist` to GitHub Pages on tag.

Done when: a clean clone builds, `pnpm test` passes, the package publishes, and the README docs link serves the tagged build.

---

## Order of work

Phase 0 → 1 → 2 → 5 (mechanics + chapters 1–11) → 4 (chapters 12–14) → 3 (chapter 15) → 6.

Phase 2 precedes the docs because chapter 2's per-element light/dark relies on unregistered leaves. Writing the basics right after the colour work is deliberate: documenting them in order is the cheapest test of whether they are actually simple.

## Verification (`pnpm test`)

1. Sass compiles all entries.
2. A Node script reads the compiled CSS and each docs example with the CSS it links: every `var(--x)` without a fallback is declared in that CSS, and no unregistered light-dark-valued property is used as a `from var(--x)` origin.
3. A Node contrast sweep (colorjs.io, no browser) implements the luminance step and oklab mix over hue 0–345 step 15, L 0.05–0.95 step 0.05, C {0, 0.1, 0.2}, both modes: `--contrast--high` ≥ 4.5, `--contrast` ≥ 3, on-surface versus surface ≥ 4.5.
4. Print gzipped size and `@property` count.
5. Docs chapter-order check.

## Decisions already made (so they are not reopened)

- Inputs-only `@property` registration; light/dark flips are instant, theme changes crossfade.
- Contrast is chosen by WCAG luminance in CSS; there is no contrast override hook until someone needs one.
- The adapter is Sass computed from Material's tables; no Node generator, no committed generated file.
- Surfaces use the `tone()` formula with Material's tone numbers; the same function feeds the adapter.
- No stress page or single-pass `light-dark()` experiment: with about 32 registrations, recalc cost is moot, and single-pass would raise the browser baseline.
- Custom palettes are Sass-only; `defineTheme` covers the six standard palettes plus tuning.
- Docs are deployed to GitHub Pages; the Gallery is replaced by the generated Reference page.
