import * as CssTree from "css-tree";
import { getPaletteFromSelector } from "./transforms/util/getPaletteFromSelector";
import { createTransform } from "./transforms/createTransform";
import { transformTheme } from "./transforms/transformTheme";
// import { transformNgMaterialTheme } from "./transforms/transform-ng-material-theme";

// function transformComponentBackgroundColors(prefix: string) {
//   return createTransform(
//     (tn) => true,
//     (sel) => true,
//     (prop) => prop.propertyName === `${prefix}-container-color` || prop.propertyName === `${prefix}-disabled-container-color`,
//     (p, c) => {
//       const palette = getPaletteFromSelector(p.selector);
//       switch (palette) {
//         case "primary":
//         case "secondary":
//         case "error":
//           return `var(--theme-color-${palette})`;
//         case "disabled":
//           return `var(--theme-color-overlay-disabled)`;
//         default:
//           return `var(--theme-color-surface)`;
//       }
//     }
//   );
// }

// function transformComponentForegroundColors(prefix: string) {
//   return createTransform(
//     (tn) => true,
//     (sel) => true,
//     (prop) => prop.propertyName === `${prefix}-label-text-color` || prop.propertyName === `${prefix}-disabled-label-text-color`,
//     (p, c) => {
//       const palette = getPaletteFromSelector(p.selector);
//       switch (palette) {
//         case "primary":
//         case "secondary":
//         case "error":
//           return `var(--theme-color-${palette}-contrast)`;
//         case "disabled":
//           return `var(--theme-color-overlay-disabled-contrast)`;
//         default:
//           return `var(--theme-color-surface-contrast)`;
//       }
//     }
//   );
// }

// transformNgMaterialTheme([
//   transformComponentBackgroundColors("--mdc-text-button"),
//   transformComponentForegroundColors("--mdc-text-button"),
//   transformComponentBackgroundColors("--mdc-filled-button"),
//   transformComponentForegroundColors("--mdc-filled-button"),
//   transformComponentBackgroundColors("--mdc-protected-button"),
//   transformComponentForegroundColors("--mdc-protected-button"),
//   transformComponentBackgroundColors("--mdc-outlined-button"),
//   transformComponentForegroundColors("--mdc-outlined-button"),
// ]);

transformTheme();
