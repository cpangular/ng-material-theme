import { CssTransform } from "../css-transform";
import { replaceVariable } from "../replace-variable";

export const snackBarTransformers: CssTransform[] = [];

snackBarTransformers.push(replaceVariable("mat-mdc-snack-bar-button-color", "rgba(0, 0, 0, 0.87)", "var(--theme-foreground-text)"));
snackBarTransformers.push(replaceVariable("mdc-snackbar-container-color", "#fccccd", "var(--theme-background-low)"));
snackBarTransformers.push(
  replaceVariable("mdc-snackbar-supporting-text-color", "rgba(240, 0, 4, 0.87)", "var(--theme-surface-transparent-high)")
);
