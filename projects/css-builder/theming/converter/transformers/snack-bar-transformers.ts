import { ThemeTokens } from "../ThemeTokens";
import { CssTransform } from "../CssTransform";
import { replaceVar } from "../replaceVar";

export const snackBarTransformers: CssTransform[] = [];

 snackBarTransformers.push(replaceVar('mat-mdc-snack-bar-button-color', 'rgba(0, 0, 0, 0.87)', 'var(--theme-foreground-text)'));
 snackBarTransformers.push(replaceVar('mdc-snackbar-container-color', '#fccccd', 'var(--theme-background-low)'));
 snackBarTransformers.push(replaceVar('mdc-snackbar-supporting-text-color', 'rgba(240, 0, 4, 0.87)', 'var(--theme-surface-transparent-high)'));

 
 