import { CssTransform } from "../css-transform";
import { replaceVariable } from "../replace-variable";

export const checkboxTransforms: CssTransform[] = [];

checkboxTransforms.push(replaceVariable("mdc-checkbox-unselected-focus-icon-color", "#eeeeee", "var(--theme-foreground-icon-low)"));
checkboxTransforms.push(replaceVariable("mdc-checkbox-unselected-hover-icon-color", "#eeeeee", "var(--theme-foreground-icon-low)"));
