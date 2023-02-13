import { CssTransform } from "../css-transform";
import { replaceVariable } from "../replace-variable";

export const chipTransforms: CssTransform[] = [];

// backgrounds
chipTransforms.push(replaceVariable("mdc-chip-elevated-container-color", "#f21f22", "var(--theme-background-high)"));
chipTransforms.push(replaceVariable("mdc-chip-elevated-disabled-container-color", "#f21f22", "var(--theme-background-high)"));

// foregrounds
chipTransforms.push(replaceVariable("mdc-chip-label-text-color", "#fafafa", "var(--theme-foreground-text-secondary)"));
chipTransforms.push(replaceVariable("mdc-chip-disabled-label-text-color", "#fafafa", "var(--theme-foreground-text-secondary)"));
chipTransforms.push(replaceVariable("mdc-chip-with-icon-icon-color", "#fafafa", "var(--theme-foreground-text-secondary)"));
chipTransforms.push(replaceVariable("mdc-chip-with-icon-disabled-icon-color", "#fafafa", "var(--theme-foreground-text-secondary)"));
chipTransforms.push(
  replaceVariable("mdc-chip-with-trailing-icon-disabled-trailing-icon-color", "#fafafa", "var(--theme-foreground-text-secondary)")
);
chipTransforms.push(
  replaceVariable("mdc-chip-with-trailing-icon-trailing-icon-color", "#fafafa", "var(--theme-foreground-text-secondary)")
);
chipTransforms.push(replaceVariable("mdc-chip-with-icon-selected-icon-color", "#fafafa", "var(--theme-foreground-text-secondary)"));
