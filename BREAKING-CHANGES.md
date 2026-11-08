# Breaking changes from 17.x

Version 21 is a rewrite. The 17.x package was an Angular library: an injectable service, Material 18 component themes prebuilt into CSS, and a tonal palette (`--palette-ref--primary-40` …) generated with `color-mix()`. Version 21 is plain CSS with no Angular dependency. The browser derives every token from a handful of inputs with `light-dark()`, relative colour syntax and `color-mix()`.

The old names below come from the 17.x `theming/` Sass and `src/lib/theme.ts`.

## Where a theme is set

| 17.x                                                      | 21                                                                                                                                                                    |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `theme="name"` on `<body>`                                | `theme="name"` on `<html>`. Any element may also carry it to re-theme its subtree.                                                                                    |
| Default theme selected by `body:not([theme])`             | Inputs set on `:root`, or `createTheme(…, $is-default: true)`.                                                                                                        |
| `theme-mode="light\|dark"` on `<html>`; absent means auto | Removed. Set `color-scheme: light` or `dark` on `<html>` (or any element) to force a mode; leave it as `light dark` to follow the OS. The switcher does this for you. |
| `theme-density="0…5"` attribute and `density-N.css` files | Removed. Set `--theme--density-scale` (default 1) on `:root` or a `[theme]`.                                                                                          |
| `legacyThemeColors` attribute                             | Removed.                                                                                                                                                              |

## Variables

Old names that still exist keep their name but may have a new meaning; those are marked.

| 17.x                                                           | 21                                                                                                                                                                              |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--palette-ref--<palette>` (one input)                         | `--theme--light--color--<palette>` and `--theme--dark--color--<palette>` (one per mode; set either or both)                                                                     |
| `--palette-ref--<palette>-<tone>` (0 … 100)                    | Removed. Use the variants (`--color--<palette>-lighter-1`, `-lighter-2`, `-darker-1`, `-darker-2`, `-higher-N`, `-lower-N`, `-tint-N`) or the Sass `tone($input, $T)` function. |
| `--color--<palette>`                                           | Same name.                                                                                                                                                                      |
| `--color--<palette>--contrast`                                 | Same name, new meaning: a contrast mix guaranteed ≥ 3:1. For text use `--color--<palette>--contrast--high` (≥ 4.5:1); `--contrast--low` is decorative.                          |
| `--color--<palette>-container`                                 | Removed. Material's container roles come from the adapter as `--mat-sys-<palette>-container`; without Material use a variant such as `--color--<palette>-lighter-2`.            |
| `--color--<palette>-container--contrast`                       | Removed. Adapter: `--mat-sys-on-<palette>-container`. Without Material: the variant's own `--contrast--high`.                                                                   |
| `--color--background`                                          | Same name (alias of `--color--surface`).                                                                                                                                        |
| `--color--background--contrast`                                | `--color--on-background`                                                                                                                                                        |
| `--color--background-variant`                                  | Removed. Nearest: `--color--surface-container-high`.                                                                                                                            |
| `--color--background-variant--contrast`                        | `--color--on-surface-variant`                                                                                                                                                   |
| `--color--surface`                                             | Same name. New siblings: `--color--surface-dim`, `-bright`, `-container-lowest`, `-container-low`, `-container`, `-container-high`, `-container-highest`.                       |
| `--color--surface--contrast`                                   | `--color--on-surface`                                                                                                                                                           |
| `--color--surface-variant`                                     | Same name.                                                                                                                                                                      |
| `--color--surface-variant--contrast`                           | `--color--on-surface-variant`                                                                                                                                                   |
| `--color--outline`                                             | Same name. New: `--color--outline-variant`.                                                                                                                                     |
| `--color--scrim`, `--color--shadow`                            | Removed. Adapter: `--mat-sys-scrim`, `--mat-sys-shadow`. Shadows use `--elevation-shadow-color` (default `#000`) and `--elevation-0` … `--elevation-5`.                         |
| `--color--black`, `--color--white`                             | Removed. Write `black` and `white`.                                                                                                                                             |
| `--color--lower`, `--color--higher`                            | Removed. Nearest: `light-dark(white, black)` and `light-dark(black, white)`. (`--color--<palette>-lower-N` / `-higher-N` are per-palette variants, not the same thing.)         |
| `--typography--<key>`                                          | Removed. Typography belongs to the consumer; Material apps use `mat.theme((typography: …))`.                                                                                    |
| `--theme`, `--theme-default`                                   | Removed. The theme name is the `theme` attribute; the switcher's `getThemes()` lists discovered themes.                                                                         |
| `--background-color`, `--color`, `--size--scrollbar` on `body` | Removed. `core.css` emits tokens only and styles nothing. Set `body { background: var(--color--surface); color: var(--color--on-surface); }` yourself.                          |

New token families with no 17.x counterpart: `--theme--size--1` … `--theme--size--11` (an em scale times `--theme--density-scale`), the per-palette tuning variables (`--theme--blend--*`, `--theme--opacity--*`, `--theme--contrast-blend*`, `--theme--disabled-*`), and `--theme--animatable` for crossfading theme changes. See the Reference page of the docs for the full list.

## Sass

| 17.x                                                             | 21                                                                                                      |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `@use "@cpangular/ng-material-theme/theming"`                    | Same path. Also exported as the `sass` condition of the `./theming` package export.                     |
| `@include theming.core()`                                        | Same. Emits exactly what `core.css` contains; use one or the other, not both.                           |
| `@include theming.default-theme($name, (primary: #hex, …))`      | `@include theming.createTheme($name, (colors: (primary: (#light, #dark))), $is-default: true)`          |
| `@include theming.theme($name, (primary: #hex, …))`              | `@include theming.createTheme($name, (colors: (primary: (#light, #dark))))`                             |
| Config keys `typography`, `density`, `includeLegacyColorClasses` | Removed. `typography` is an error; density is `--theme--density-scale`.                                 |
| Theme output included Material's `all-component-themes`          | No. Load `material-adapter.css` after `core.css` and call `mat.theme()` yourself without a `color` key. |

A palette value may be one colour (used in both modes) or a `(light, dark)` pair. Any of the six palettes (`primary`, `secondary`, `tertiary`, `neutral`, `neutral-variant`, `error`) may be omitted; it is then inherited or re-derived from primary.

## Angular

| 17.x                                                                                            | 21                                                                                                                                                                                                                       |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NgMaterialThemeService` (`theme`, `mode`, `modeSetting`, `prefersColorMode` signals)           | Removed. `import { themeSwitcher } from "@cpangular/ng-material-theme/theme-switcher"`: `getCurrentTheme()`, `getCurrentColorScheme()`, `onChange()`, `onColorSchemeChange()`. Wrap in `toSignal()` if you want signals. |
| `service.setTheme(name)`                                                                        | `themeSwitcher.setTheme(name)` (sets `theme` on `<html>`)                                                                                                                                                                |
| `service.setMode(ThemeMode.LIGHT \| DARK \| AUTO)`                                              | `themeSwitcher.setColorScheme("light" \| "dark" \| "auto")`; also `cycleColorScheme()`                                                                                                                                   |
| `ThemeMode` enum                                                                                | `ColorSchemeMode` string union                                                                                                                                                                                           |
| Themes discovered from a `-theme-` selector (`scanForThemes`)                                   | Discovered from `[theme="name"]` selectors in readable stylesheets; `defineTheme(name, vars)` and `removeTheme(name)` add and remove themes at runtime.                                                                  |
| `ThemeVisComponent`                                                                             | Removed.                                                                                                                                                                                                                 |
| Peer dependencies on `@angular/core`, `@angular/common`, `@angular/cdk`, `@angular/material` 18 | None. The adapter targets Angular Material 21 but the package does not depend on it.                                                                                                                                     |

## Storage keys

The switcher persists its state in `localStorage` under new keys. A user upgrading loses their stored choice once; nothing migrates.

| 17.x            | 21                                           | Values                                                  |
| --------------- | -------------------------------------------- | ------------------------------------------------------- |
| `cpngTheme`     | `@cpangular/ng-material-theme.selectedTheme` | theme name                                              |
| `cpngThemeMode` | `@cpangular/ng-material-theme.colorScheme`   | `light`, `dark`, `auto` (17.x removed the key for auto) |

To avoid a flash of the default theme, read the two keys in a `<script>` in `<head>` before the stylesheets (docs, chapter 12).

## Prebuilt CSS

| 17.x                                             | 21                                                                             |
| ------------------------------------------------ | ------------------------------------------------------------------------------ |
| `css/core.css`, `css/colors.css`, `css/base.css` | `css/dist/core.css` (export `./core.css`)                                      |
| `css/density-0.css` … `css/density-5.css`        | Removed; `--theme--density-scale`                                              |
| Material component themes baked in               | `css/dist/material-adapter.css` (export `./material-adapter.css`), colour only |

## Browser baseline

Chrome 123, Firefox 128, Safari 17.5. The library uses `light-dark()`, relative colour syntax and `color-mix()` and has no fallbacks for older browsers. 17.x worked in any browser with `color-mix()`.
