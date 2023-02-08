import { ThemeTokens } from "../ThemeTokens";
import { CssTransform } from "../CssTransform";

export const backgroundTransformers: CssTransform[] = [];

backgroundTransformers.push((css) => {
    return css.replaceAll(
        `${ThemeTokens.background['status-bar']}`,
        `var(--theme-background-base)`
    );
});

backgroundTransformers.push((css) => {
    return css.replaceAll(
        `${ThemeTokens.background.background}`,
        `var(--theme-background)`
    );
});

backgroundTransformers.push((css) => {
    return css.replaceAll(
        `${ThemeTokens.background['app-bar']}`,
        `var(--theme-background-low)`
    );
});

backgroundTransformers.push((css) => {
    return css.replaceAll(
        `${ThemeTokens.background['unselected-chip']}`,
        `var(--theme-background-high)`
    );
});

backgroundTransformers.push((css) => {
    return css.replaceAll(
        `${ThemeTokens.background.tooltip}`,
        `var(--theme-background-high)`
    );
});

backgroundTransformers.push((css) => {
    return css.replaceAll(
        `#616161`,
        `var(--theme-background-high)`
    );
});

backgroundTransformers.push((css) => {
    return css.replaceAll(
        `#686868`,
        `var(--theme-background-disabled)`
    );
});

backgroundTransformers.push((css) => {
    return css.replaceAll(
        `${ThemeTokens.background.hover}`,
        `var(--theme-background-hover)`
    );
});

backgroundTransformers.push((css) => {
    return css.replaceAll(
        `${ThemeTokens.background["disabled-button"]}`,
        `var(--theme-background-disabled)`
    );
});

backgroundTransformers.push((css) => {
    return css.replaceAll(
        `${ThemeTokens.background["focused-button"]}`,
        `var(--theme-background-disabled)`
    );
});

backgroundTransformers.push((css) => {
    return css.replaceAll(
        `${ThemeTokens.background["disabled-list-option"]}`,
        `var(--theme-background-disabled)`
    );
});
