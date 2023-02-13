import { CssTransform } from "../css-transform";
import { replaceVariable } from "../replace-variable";

export const radioButtonTransformers: CssTransform[] = [];

radioButtonTransformers.push(replaceVariable("mdc-radio-unselected-focus-icon-color", "#eeeeee", "var(--theme-foreground-icon-low)"));
radioButtonTransformers.push(replaceVariable("mdc-radio-unselected-hover-icon-color", "#eeeeee", "var(--theme-foreground-icon-low)"));
