import { ThemeTokens } from "../ThemeTokens";
import { CssTransform } from "../CssTransform";

export const surfaceTransformers: CssTransform[] = [];

surfaceTransformers.push((css) => {
  return css.replaceAll(`var(--mdc-theme-surface, ${ThemeTokens.background.card})`, `var(--mdc-surface)`);
});

surfaceTransformers.push((css) => {
  return css.replaceAll(`var(--mdc-theme-surface, ${ThemeTokens.background.dialog})`, `var(--theme-surface)`);
});

surfaceTransformers.push((css) => {
  return css.replaceAll(`var(--mdc-theme-surface, ${ThemeTokens.background["raised-button"]})`, `var(--theme-surface)`);
});

surfaceTransformers.push((css) => {
  return css.replaceAll(`var(--mdc-theme-surface, ${ThemeTokens.background["selected-disabled-button"]})`, `var(--theme-surface)`);
});

surfaceTransformers.push((css) => {
  return css.replaceAll(`${ThemeTokens.background.card}`, `var(--theme-surface)`);
});

surfaceTransformers.push((css) => {
  return css.replaceAll(`${ThemeTokens.background.dialog}`, `var(--theme-surface)`);
});

surfaceTransformers.push((css) => {
  return css.replaceAll(`${ThemeTokens.background["raised-button"]}`, `var(--theme-surface)`);
});

surfaceTransformers.push((css) => {
  return css.replaceAll(`${ThemeTokens.background["selected-disabled-button"]}`, `var(--theme-surface)`);
});

surfaceTransformers.push((css) => {
  return css.replaceAll(`var(--mdc-theme-on-surface, #fff)`, `var(--theme-surface-text)`);
});
