import { ColorPaletteTransform, VarValueReplaceTransform } from "./ColorPaletteTransform";

export const COLOR_TRANSFORMS = [
  new ColorPaletteTransform("color-primary", "primary", "default"),

  new ColorPaletteTransform("color-primary-contrast", "primary", "default-contrast"),
  new ColorPaletteTransform("color-secondary", "secondary", "default"),

  new ColorPaletteTransform("color-secondary-contrast", "secondary", "default-contrast"),
  new ColorPaletteTransform("color-error", "error", "default"),

  new ColorPaletteTransform("color-error-contrast", "error", "default-contrast"),

  new ColorPaletteTransform("color-primary-tint-low", "primary", "default", (c) => c.setA(0.1)),
  new ColorPaletteTransform("color-primary-tint", "primary", "default", (c) => c.setA(0.25)),
  new ColorPaletteTransform("color-primary-tint-highest", "primary", "default", (c) => c.setA(0.87)),

  new ColorPaletteTransform("color-secondary-tint-low", "secondary", "default", (c) => c.setA(0.1)),
  new ColorPaletteTransform("color-secondary-tint", "secondary", "default", (c) => c.setA(0.25)),
  new ColorPaletteTransform("color-secondary-tint-highest", "secondary", "default", (c) => c.setA(0.87)),

  new ColorPaletteTransform("color-error-tint-low", "error", "default", (c) => c.setA(0.1)),
  new ColorPaletteTransform("color-error-tint", "error", "default", (c) => c.setA(0.25)),
  new ColorPaletteTransform("color-error-tint-highest", "error", "default", (c) => c.setA(0.87)),

  new ColorPaletteTransform("color-overlay-low", "foreground", "disabled-button"),
  new ColorPaletteTransform("color-overlay-higher", "foreground", "disabled-text"),
  new ColorPaletteTransform("color-overlay-higher", "foreground", "disabled"),
  new ColorPaletteTransform("color-overlay", "background", "disabled"),

  new ColorPaletteTransform("color-surface", "background", "card"),
  new ColorPaletteTransform("color-surface", "background", "raised-button"),
  new ColorPaletteTransform("color-background", "background", "background"),
  new ColorPaletteTransform("color-dialog", "background", "dialog"),

  new ColorPaletteTransform("color-background-contrast", "foreground", "text"),
  new ColorPaletteTransform("color-background-contrast-low", "foreground", "secondary-text"),

  new ColorPaletteTransform("color-overlay-base", "foreground", "base"),
  new ColorPaletteTransform("color-overlay-low", "foreground", "base", (c) => c.setA(0.1)),
  new ColorPaletteTransform("color-overlay-low", "foreground", "base", (c) => c.setA(0.12)),
  new ColorPaletteTransform("color-overlay-higher", "foreground", "base", (c) => c.setA(0.54)),
  new ColorPaletteTransform("color-overlay-highest", "foreground", "base", (c) => c.setA(0.87)),

  new VarValueReplaceTransform("--mdc-theme-primary", "color-primary"),
  new VarValueReplaceTransform("--mdc-theme-secondary", "color-secondary"),
  new VarValueReplaceTransform("--mdc-theme-error", "color-error"),
  new VarValueReplaceTransform("--mdc-theme-surface", "color-surface"),
];
