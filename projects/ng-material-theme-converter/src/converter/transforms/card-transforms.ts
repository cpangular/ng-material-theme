import { CssTransform } from "../css-transform";
import { replaceVariable } from "../replace-variable";

export const cardTransforms: CssTransform[] = [];

cardTransforms.push(replaceVariable("mdc-outlined-card-outline-color", "#f21f22", "var(--theme-foreground-stroke)"));
