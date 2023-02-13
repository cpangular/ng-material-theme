import { ThemeTokens } from "../../data/theme-tokens";
import { CssTransform } from "../css-transform";

export const foregroundTransforms: CssTransform[] = [];

foregroundTransforms.push((css) => {
  return css.replaceAll(`${ThemeTokens.foreground.base}`, `var(--theme-foreground-base)`);
});

foregroundTransforms.push((css) => {
  return css.replaceAll(`${ThemeTokens.foreground.text}`, `var(--theme-foreground-text)`);
});

foregroundTransforms.push((css) => {
  return css.replaceAll(`${ThemeTokens.foreground["secondary-text"]}`, `var(--theme-foreground-text-secondary)`);
});

foregroundTransforms.push((css) => {
  return css.replaceAll(`${ThemeTokens.foreground["disabled-text"]}`, `var(--theme-foreground-text-disabled)`);
});

foregroundTransforms.push((css) => {
  return css.replaceAll(`rgba(255, 255, 255, 0.5)`, `var(--theme-foreground-text-disabled)`);
});

foregroundTransforms.push((css) => {
  return css.replaceAll(`${ThemeTokens.foreground["hint-text"]}`, `var(--theme-foreground-text-hint)`);
});

foregroundTransforms.push((css) => {
  return css.replaceAll(`${ThemeTokens.foreground.icon}`, `var(--theme-foreground-icon, var(--theme-foreground-text))`);
});

foregroundTransforms.push((css) => {
  return css.replaceAll(`${ThemeTokens.foreground.divider}`, `var(--theme-foreground-stroke)`);
});

foregroundTransforms.push((css) => {
  return css.replaceAll(`${ThemeTokens.foreground.disabled}`, `var(--theme-foreground--stroke-disabled)`);
});

foregroundTransforms.push((css) => {
  return css.replaceAll(`${ThemeTokens.foreground["disabled-button"]}`, `var(--theme-foreground-stroke-disabled-button)`);
});

foregroundTransforms.push((css) => {
  return css.replaceAll(`${ThemeTokens.foreground["slider-min"]}`, `var(--theme-foreground-slider-min, var(--theme-foreground-base))`);
});

foregroundTransforms.push((css) => {
  return css.replaceAll(
    `${ThemeTokens.foreground["slider-off"]}`,
    `var(--theme-foreground-slider-off, var(--theme-foreground-stroke-disabled-button))`
  );
});

foregroundTransforms.push((css) => {
  return css.replaceAll(
    `${ThemeTokens.foreground["slider-off-active"]}`,
    `var(--theme-foreground-slider-off-active, var(--theme-foreground-stroke-disabled-button))`
  );
});

foregroundTransforms.push((css) => {
  return css.replaceAll(`var(--mdc-theme-text-hint-on-background, rgba(255, 255, 255, 0.5))`, `var(--theme-foreground-text-hint)`);
});

foregroundTransforms.push((css) => {
  return css.replaceAll(`var(--mdc-theme-text-icon-on-background, rgba(255, 255, 255, 0.5))`, `var(--theme-foreground-text-hint)`);
});
