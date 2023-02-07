import { ThemeTokens } from "../ThemeTokens";
import { CssTransform } from "../CssTransform";
import { replaceVar } from "../replaceVar";

export const cardTransformers: CssTransform[] = [];

 cardTransformers.push(replaceVar('mdc-outlined-card-outline-color', '#f21f22', 'var(--theme-foreground-stroke)'));


 