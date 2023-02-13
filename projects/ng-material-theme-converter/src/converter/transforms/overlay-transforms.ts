import { CssTransform } from "../css-transform";

export const overlayTransforms: CssTransform[] = [];

const foregroundBase = (opacity: string) => `rgba(255, 0, 0, ${opacity})`;

const opacityBase = (opacity: string) => `rgba(255, 255, 255, ${opacity})`;

overlayTransforms.push((css) => {
  return css.replaceAll(foregroundBase("0.1"), `var(--theme-overlay-ripple)`);
});

overlayTransforms.push((css) => {
  return css.replaceAll(foregroundBase("0.12"), `var(--theme-overlay)`);
});

overlayTransforms.push((css) => {
  return css.replaceAll(foregroundBase("0.54"), `var(--theme-overlay-medium)`);
});

overlayTransforms.push((css) => {
  return css.replaceAll(foregroundBase("0.87"), `var(--theme-overlay-high)`);
});

overlayTransforms.push((css) => {
  return css.replaceAll(`#f10a0e`, `var(--theme-overlay)`);
});

overlayTransforms.push((css) => {
  return css.replaceAll(opacityBase("0.05"), `var(--theme-overlay-lower)`);
});

overlayTransforms.push((css) => {
  return css.replaceAll(opacityBase("0.2"), `var(--theme-overlay-low)`);
});

overlayTransforms.push((css) => {
  return css.replaceAll(opacityBase("0.54"), `var(--theme-overlay-medium)`);
});

overlayTransforms.push((css) => {
  return css.replaceAll(opacityBase("0.6"), `var(--theme-overlay-high)`);
});

overlayTransforms.push((css) => {
  return css.replaceAll(opacityBase("0.87"), `var(--theme-overlay-higher)`);
});

overlayTransforms.push((css) => {
  return css.replaceAll(opacityBase("0.1"), `var(--theme-overlay-ripple)`);
});

overlayTransforms.push((css) => {
  return css.replaceAll(opacityBase("0.08"), `var(--theme-overlay-ripple-hover)`);
});
