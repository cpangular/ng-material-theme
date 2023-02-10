import { CssTransform } from "../CssTransform";

export const overlayTransformers: CssTransform[] = [];

const foregroundBase = (opacity: string) => `rgba(255, 0, 0, ${opacity})`;

const opacityBase = (opacity: string) => `rgba(255, 255, 255, ${opacity})`;

overlayTransformers.push((css) => {
  return css.replaceAll(foregroundBase("0.1"), `var(--theme-overlay-ripple)`);
});

overlayTransformers.push((css) => {
  return css.replaceAll(foregroundBase("0.12"), `var(--theme-overlay)`);
});

overlayTransformers.push((css) => {
  return css.replaceAll(foregroundBase("0.54"), `var(--theme-overlay-medium)`);
});

overlayTransformers.push((css) => {
  return css.replaceAll(foregroundBase("0.87"), `var(--theme-overlay-high)`);
});

overlayTransformers.push((css) => {
  return css.replaceAll(`#f10a0e`, `var(--theme-overlay)`);
});

overlayTransformers.push((css) => {
  return css.replaceAll(opacityBase("0.05"), `var(--theme-overlay-lower)`);
});

overlayTransformers.push((css) => {
  return css.replaceAll(opacityBase("0.2"), `var(--theme-overlay-low)`);
});

overlayTransformers.push((css) => {
  return css.replaceAll(opacityBase("0.54"), `var(--theme-overlay-medium)`);
});

overlayTransformers.push((css) => {
  return css.replaceAll(opacityBase("0.6"), `var(--theme-overlay-high)`);
});

overlayTransformers.push((css) => {
  return css.replaceAll(opacityBase("0.87"), `var(--theme-overlay-higher)`);
});

overlayTransformers.push((css) => {
  return css.replaceAll(opacityBase("0.1"), `var(--theme-overlay-ripple)`);
});

overlayTransformers.push((css) => {
  return css.replaceAll(opacityBase("0.08"), `var(--theme-overlay-ripple-hover)`);
});
