import { CssTransform } from "../CssTransform";
import { replaceVar } from "../replaceVar";

export const sliderTransformers: CssTransform[] = [];

sliderTransformers.push(replaceVar("mdc-slider-label-container-color", "white", "var(--theme-foreground-base)"));
sliderTransformers.push(replaceVar("mdc-slider-label-label-text-color", "black", "var(--theme-background-base)"));
sliderTransformers.push(replaceVar("mat-mdc-slider-value-indicator-opacity", "0.9", "var(--theme-opacity-high)"));
