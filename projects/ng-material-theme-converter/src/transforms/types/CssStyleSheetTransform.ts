import * as CssTree from "css-tree";
import { ThemeConfig } from "./ThemeConfig";
import { CssTransformation } from "./CssTransformation";
import { CssTransformCheckTheme } from "./CssTransformCheckTheme";

export interface CssStyleSheetTransform extends CssTransformation, CssTransformCheckTheme {
  readonly transforms: "stylesheet";
  transform(styleSheet: CssTree.StyleSheet, config: ThemeConfig): void;
}
