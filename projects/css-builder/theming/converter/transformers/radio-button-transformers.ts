import { ThemeTokens } from "../ThemeTokens";
import { CssTransform } from "../CssTransform";
import { replaceVar } from "../replaceVar";

export const radioButtonTransformers: CssTransform[] = [];

radioButtonTransformers.push(replaceVar('mdc-radio-unselected-focus-icon-color', '#eeeeee', 'var(--theme-foreground-icon-low)'));
radioButtonTransformers.push(replaceVar('mdc-radio-unselected-hover-icon-color', '#eeeeee', 'var(--theme-foreground-icon-low)'));

