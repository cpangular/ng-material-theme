import { ThemeTokens } from "../ThemeTokens";
import { CssTransform } from "../CssTransform";
import { replaceVar } from "../replaceVar";

export const checkboxTransformers: CssTransform[] = [];

checkboxTransformers.push(replaceVar('mdc-checkbox-unselected-focus-icon-color', '#eeeeee', 'var(--theme-foreground-icon-low)'));
checkboxTransformers.push(replaceVar('mdc-checkbox-unselected-hover-icon-color', '#eeeeee', 'var(--theme-foreground-icon-low)'));

