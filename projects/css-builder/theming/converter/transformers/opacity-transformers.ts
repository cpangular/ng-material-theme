import { CssTransform } from "../CssTransform";

export const opacityTransformers: CssTransform[] = [];

// for ripple
const findRippleOpacityRule = /^.*?-ripple.*?\{.*?\n.*?(opacity: .*?);.*?\n/gm;
const rippleOpacityMap = {
    'opacity: 0.08': 'opacity: var(--theme-opacity-low)',
    'opacity: var(--mdc-ripple-hover-opacity, 0.08)': 'opacity: var(--theme-opacity-low)',
    'opacity: 0.24': 'opacity: var(--theme-opacity-medium)',
    'opacity: var(--mdc-ripple-focus-opacity, 0.24)': 'opacity: var(--theme-opacity-medium)',
    'opacity: 0.9': 'opacity: var(--theme-opacity-high)',
}

opacityTransformers.push((css) => {
    const matches = css.matchAll(findRippleOpacityRule);
    for (const match of matches) {
        const replacementValue = rippleOpacityMap[match[1]];
        if (replacementValue) {
            const find = match[0];
            const replacement = find.replace(match[1], replacementValue);
            css = css.replaceAll(find, replacement);
        }
    }
    return css;
});
