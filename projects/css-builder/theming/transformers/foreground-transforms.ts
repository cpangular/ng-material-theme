import { ThemeTokens } from "../ThemeTokens";
import { CssTransform } from "./CssTransform";

export const foregroundTransformers: CssTransform[] = [];

foregroundTransformers.push((css) => {
    return css.replaceAll(
        `${ThemeTokens.foreground.base}`,
        `var(--theme-foreground-base)`
    );
});

foregroundTransformers.push((css) => {
    return css.replaceAll(
        `${ThemeTokens.foreground.text}`,
        `var(--theme-foreground-text)`
    );
});

foregroundTransformers.push((css) => {
    return css.replaceAll(
        `${ThemeTokens.foreground['secondary-text']}`,
        `var(--theme-foreground-text-secondary)`
    );
});

foregroundTransformers.push((css) => {
    return css.replaceAll(
        `${ThemeTokens.foreground['disabled-text']}`,
        `var(--theme-foreground-text-disabled)`
    );
});

foregroundTransformers.push((css) => {
    return css.replaceAll(
        `${ThemeTokens.foreground['hint-text']}`,
        `var(--theme-foreground-text-hint)`
    );
});

foregroundTransformers.push((css) => {
    return css.replaceAll(
        `${ThemeTokens.foreground.icon}`,
        `var(--theme-foreground-icon, var(--theme-foreground-text))`
    );
});

foregroundTransformers.push((css) => {
    return css.replaceAll(
        `${ThemeTokens.foreground.divider}`,
        `var(--theme-foreground-stroke)`
    );
});

foregroundTransformers.push((css) => {
    return css.replaceAll(
        `${ThemeTokens.foreground.disabled}`,
        `var(--theme-foreground--stroke-disabled)`
    );
});

foregroundTransformers.push((css) => {
    return css.replaceAll(
        `${ThemeTokens.foreground['disabled-button']}`,
        `var(--theme-foreground-stroke-disabled-button)`
    );
});

foregroundTransformers.push((css) => {
    return css.replaceAll(
        `${ThemeTokens.foreground["slider-min"]}`,
        `var(--theme-foreground-slider-min, var(--theme-foreground-base))`
    );
});

foregroundTransformers.push((css) => {
    return css.replaceAll(
        `${ThemeTokens.foreground["slider-off"]}`,
        `var(--theme-foreground-slider-off, var(--theme-foreground-stroke-disabled-button))`
    );
});

foregroundTransformers.push((css) => {
    return css.replaceAll(
        `${ThemeTokens.foreground["slider-off-active"]}`,
        `var(--theme-foreground-slider-off-active, var(--theme-foreground-stroke-disabled-button))`
    );
});



foregroundTransformers.push((css) => {
    return css.replaceAll(
        `var(--mdc-theme-text-hint-on-background, rgba(255, 255, 255, 0.5))`,
        `var(--theme-foreground-text-disabled)`
    );
});

foregroundTransformers.push((css) => {
    return css.replaceAll(
        `var(--mdc-theme-text-icon-on-background, rgba(255, 255, 255, 0.5))`,
        `var(--theme-foreground-text-disabled)`
    );
});




