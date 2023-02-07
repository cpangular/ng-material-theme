import { ThemeTokens } from "../ThemeTokens";
import { CssTransform } from "../CssTransform";
import { replaceVar } from "../replaceVar";

export const opacityTransformers: CssTransform[] = [];


// for ripple

const findRippleOpacityRule = /^.*?-ripple.*?\{.*?\n.*?(opacity: .*?);.*?\n/gm;
const rippleOpacityMap = {
    'opacity: 0.08': 'opacity: var(--theme-opacity-low)',
    'opacity: 0.24': 'opacity: var(--theme-opacity-medium)',
    'opacity: 0.9': 'opacity: var(--theme-opacity-high)',
}

opacityTransformers.push((css) => {
    const matches = css.matchAll(findRippleOpacityRule);
    for (const match of matches) {
        const find = match[0];
        const replacementVar = find.replace(match[1], rippleOpacityMap[match[1]]);
        css = css.replaceAll(find, replacementVar);
    }
    return css;
});