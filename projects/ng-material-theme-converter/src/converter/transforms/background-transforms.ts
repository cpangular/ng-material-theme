import { ThemeTokens } from "../../data/theme-tokens";
import { CssTransform } from "../css-transform";

export const backgroundTransforms: CssTransform[] = [];

backgroundTransforms.push((css) => {
  return css.replaceAll(`${ThemeTokens.background["status-bar"]}`, `var(--theme-background-base)`);
});

backgroundTransforms.push((css) => {
  return css.replaceAll(`${ThemeTokens.background.background}`, `var(--theme-background)`);
});

backgroundTransforms.push((css) => {
  return css.replaceAll(`${ThemeTokens.background["app-bar"]}`, `var(--theme-background-lower)`);
});

backgroundTransforms.push((css) => {
  return css.replaceAll(`${ThemeTokens.background["selected-button"]}`, `var(--theme-background-low)`);
});

backgroundTransforms.push((css) => {
  return css.replaceAll(`${ThemeTokens.background["unselected-chip"]}`, `var(--theme-background-high)`);
});

backgroundTransforms.push((css) => {
  return css.replaceAll(`${ThemeTokens.background.tooltip}`, `var(--theme-background-high)`);
});

backgroundTransforms.push((css) => {
  return css.replaceAll(`#616161`, `var(--theme-background-high)`);
});

backgroundTransforms.push((css) => {
  return css.replaceAll(`#686868`, `var(--theme-background-disabled)`);
});

backgroundTransforms.push((css) => {
  return css.replaceAll(`${ThemeTokens.background.hover}`, `var(--theme-background-hover)`);
});

backgroundTransforms.push((css) => {
  return css.replaceAll(`${ThemeTokens.background["disabled-button"]}`, `var(--theme-background-disabled)`);
});

backgroundTransforms.push((css) => {
  return css.replaceAll(`${ThemeTokens.background["focused-button"]}`, `var(--theme-background-disabled)`);
});

backgroundTransforms.push((css) => {
  return css.replaceAll(`${ThemeTokens.background["disabled-list-option"]}`, `var(--theme-background-disabled)`);
});
