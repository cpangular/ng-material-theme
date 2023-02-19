import * as CssTree from "css-tree";
import { ThemeConfig } from "./ThemeConfig";
import { CssTransformBase } from "./CssTransformBase";
import { CssTransformCheckTheme } from "./CssTransformCheckTheme";

export interface CssStyleSheetTransform extends CssTransformBase, CssTransformCheckTheme {
  readonly transforms: "stylesheet";
  transform(property: CssTree.StyleSheet, config: ThemeConfig): void;
}
