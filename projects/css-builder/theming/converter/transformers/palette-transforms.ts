import { ThemeTokens } from "../ThemeTokens";
import { CssTransform } from "../CssTransform";

export const paletteTransformers: CssTransform[] = [];

const palettes = ["primary", "accent", "warn"];

const paletteNameMap = {
  primary: "primary",
  accent: "secondary",
  secondary: "accent",
  warn: "error",
  error: "warn",
};

const paletteColorKeys = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "A100", "A200", "A400", "A700"];

const tints = ["0.05", "0.1", "0.2", "0.25", "0.3", "0.4", "0.87"];

const paletteTintMap = {
  primary: "2, 0, 0",
  accent: "18, 0, 0",
  warn: "34, 0, 0",
};

// palette refs
paletteTransformers.push((css) => {
  for (const palette of palettes) {
    var mdcName = paletteNameMap[palette];
    for (const colorKey of paletteColorKeys) {
      css = css.replaceAll(ThemeTokens[palette][colorKey], `var(--theme-${mdcName}-${colorKey})`);
      const contrastKey = `${colorKey}-contrast`;
      css = css.replaceAll(ThemeTokens[palette][contrastKey], `var(--theme-${mdcName}-${contrastKey})`);
    }
  }
  return css;
});

// palette tints
paletteTransformers.push((css) => {
  for (const palette of palettes) {
    var mdcName = paletteNameMap[palette];
    for (let i = 0; i < tints.length; i++) {
      const tintAmount = tints[i];
      var tintKey = paletteTintMap[palette];
      css = css.replaceAll(`rgba(${tintKey}, ${tintAmount})`, `var(--theme-${mdcName}-tint-${i})`);
    }
  }
  return css;
});

// Primary Palette defaults
paletteTransformers.push((css) => {
  return css.replaceAll(`var(--mdc-theme-primary, ${ThemeTokens.primary.default})`, `var(--theme-primary)`);
});

paletteTransformers.push((css) => {
  return css.replaceAll(`${ThemeTokens.primary.default}`, `var(--theme-primary)`);
});

paletteTransformers.push((css) => {
  return css.replaceAll(`${ThemeTokens.primary.text}`, `var(--theme-primary-text)`);
});

paletteTransformers.push((css) => {
  return css.replaceAll(`${ThemeTokens.primary["default-contrast"]}`, `var(--theme-primary-contrast)`);
});

paletteTransformers.push((css) => {
  return css.replaceAll(
    `var(--mdc-theme-text-primary-on-background, ${ThemeTokens.primary["default-contrast"]})`,
    `var(--theme-primary-contrast)`
  );
});

paletteTransformers.push((css) => {
  return css.replaceAll(`var(--mdc-theme-text-primary-on-background, white)`, `var(--theme-primary-contrast)`);
});

// Secondary Palette

paletteTransformers.push((css) => {
  return css.replaceAll(`var(--mdc-theme-secondary, ${ThemeTokens.accent.default})`, `var(--theme-secondary)`);
});

paletteTransformers.push((css) => {
  return css.replaceAll(`${ThemeTokens.accent.default}`, `var(--theme-secondary)`);
});

paletteTransformers.push((css) => {
  return css.replaceAll(`${ThemeTokens.accent.text}`, `var(--theme-secondary-text)`);
});

paletteTransformers.push((css) => {
  return css.replaceAll(`${ThemeTokens.accent["default-contrast"]}`, `var(--theme-secondary-contrast)`);
});

paletteTransformers.push((css) => {
  return css.replaceAll(
    `var(--mdc-theme-text-secondary-on-background, ${ThemeTokens.accent["default-contrast"]})`,
    `var(--theme-secondary-contrast)`
  );
});

paletteTransformers.push((css) => {
  return css.replaceAll(`var(--mdc-theme-text-secondary-on-background, rgba(255, 255, 255, 0.7))`, `var(--theme-secondary-contrast)`);
});

// Error Palette
paletteTransformers.push((css) => {
  return css.replaceAll(`var(--mdc-theme-error, ${ThemeTokens.warn.default})`, `var(--theme-error)`);
});

paletteTransformers.push((css) => {
  return css.replaceAll(`${ThemeTokens.warn.default}`, `var(--theme-error)`);
});

paletteTransformers.push((css) => {
  return css.replaceAll(`${ThemeTokens.warn.text}`, `var(--theme-error-text)`);
});

paletteTransformers.push((css) => {
  return css.replaceAll(`${ThemeTokens.warn["default-contrast"]}`, `var(--theme-error-contrast)`);
});

paletteTransformers.push((css) => {
  return css.replaceAll(
    `var(--mdc-theme-text-error-on-background, ${ThemeTokens.warn["default-contrast"]})`,
    `var(--theme-error-contrast)`
  );
});

paletteTransformers.push((css) => {
  return css.replaceAll(`var(--mdc-theme-text-error-on-background, rgba(255, 255, 255, 0.7))`, `var(--theme-error-contrast)`);
});
