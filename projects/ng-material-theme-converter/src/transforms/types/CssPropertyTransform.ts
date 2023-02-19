import * as CssTree from "css-tree";
import { CssProperty } from "./CssProperty";
import { ThemeConfig } from "./ThemeConfig";
import { CssPropertyTransformCheckProperty } from "./CssPropertyTransformCheckProperty";
import { CssRuleTransformCheckSelector } from "./CssRuleTransformCheckSelector";
import { CssTransformBase } from "./CssTransformBase";
import { CssTransformCheckTheme } from "./CssTransformCheckTheme";

export interface CssPropertyTransform
  extends CssTransformBase,
    CssTransformCheckTheme,
    CssRuleTransformCheckSelector,
    CssPropertyTransformCheckProperty {
  readonly transforms: "property";
  transform(property: CssProperty, config: ThemeConfig): undefined | string | number | CssTree.Raw | CssTree.Value;
}
