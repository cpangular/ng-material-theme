import { ColorPaletteRefTransform, VarPropertySetTransform } from "../../colors/ColorPaletteTransform";

export const TABS_TRANSFORMS = [
  new ColorPaletteRefTransform("color-primary", "--mdc-tab-indicator-active-indicator-color", "primary", "default"),
  new ColorPaletteRefTransform("color-secondary", "--mdc-tab-indicator-active-indicator-color", "secondary", "default"),
  new ColorPaletteRefTransform("color-error", "--mdc-tab-indicator-active-indicator-color", "error", "default"),

  new VarPropertySetTransform(
    "--mat-mdc-tab-header-with-background-foreground-color",
    "color-primary-contrast",
    ".mat-mdc-tab-group.mat-background-primary,.mat-mdc-tab-nav-bar.mat-background-primary"
  ),
  new VarPropertySetTransform(
    "--mat-mdc-tab-header-with-background-foreground-color",
    "color-secondary-contrast",
    ".mat-mdc-tab-group.mat-background-accent,.mat-mdc-tab-nav-bar.mat-background-accent"
  ),
  new VarPropertySetTransform(
    "--mat-mdc-tab-header-with-background-foreground-color",
    "color-error-contrast",
    ".mat-mdc-tab-group.mat-background-warn,.mat-mdc-tab-nav-bar.mat-background-warn"
  ),
];
