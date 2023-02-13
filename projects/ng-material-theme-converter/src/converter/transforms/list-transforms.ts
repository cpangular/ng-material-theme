import { CssTransform } from "../css-transform";

export const listTransforms: CssTransform[] = [];

let cssToFind = `.mat-mdc-list-item-interactive::before {
  background: white;
}`;

let cssToReplace = `.mat-mdc-list-item-interactive::before {
  background: var(--theme-foreground-base);
}`;

listTransforms.push((css) => {
  return css.replaceAll(cssToFind, cssToReplace);
});

// opacity
const findOpacityRule = /^.*?.mat-mdc-list-item-interactive:.*?\{.*?\n.*?(opacity: .*?);.*?\n/gm;
const rippleOpacityMap = {
  "opacity: 0.08": "opacity: var(--theme-opacity-low)",
  "opacity: 0.24": "opacity: var(--theme-opacity-medium)",
  "opacity: 0.9": "opacity: var(--theme-opacity-high)",
};

listTransforms.push((css) => {
  const matches = css.matchAll(findOpacityRule);
  for (const match of matches) {
    const find = match[0];
    const replacementVar = find.replace(match[1], rippleOpacityMap[match[1]]);
    css = css.replaceAll(find, replacementVar);
  }
  return css;
});
