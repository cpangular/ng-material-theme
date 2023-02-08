import { CssTransform } from "../CssTransform";

export const overlayTransformers: CssTransform[] = [];

const foregroundBase = (opacity: string) => `rgba(255, 0, 0, ${opacity})`;

overlayTransformers.push((css) => {
  return css.replaceAll(foregroundBase("0.1"), `var(--theme-foreground-transparent-ripple)`);
});

overlayTransformers.push((css) => {
  return css.replaceAll(foregroundBase("0.12"), `var(--theme-foreground-transparent)`);
});

overlayTransformers.push((css) => {
  return css.replaceAll(foregroundBase("0.54"), `var(--theme-foreground-transparent-medium)`);
});

overlayTransformers.push((css) => {
  return css.replaceAll(foregroundBase("0.87"), `var(--theme-foreground-transparent-high)`);
});

overlayTransformers.push((css) => {
  return css.replaceAll(`#f10a0e`, `var(--theme-foreground-transparent)`);
});
