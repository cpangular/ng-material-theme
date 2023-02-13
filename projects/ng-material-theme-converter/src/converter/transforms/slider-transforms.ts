import { CssTransform } from "../css-transform";
import { replaceVariable } from "../replace-variable";

export const sliderTransformers: CssTransform[] = [];

sliderTransformers.push(replaceVariable("mdc-slider-label-container-color", "white", "var(--theme-foreground-base)"));
sliderTransformers.push(replaceVariable("mdc-slider-label-label-text-color", "black", "var(--theme-background-base)"));
sliderTransformers.push(replaceVariable("mat-mdc-slider-value-indicator-opacity", "0.9", "var(--theme-opacity-high)"));
