import * as CssTree from "css-tree";
import { CssProperty } from "./CssProperty";
import { ThemeConfig } from "../../lib/types/ThemeConfig";
import { CssPropertyTransformCheckProperty } from "./CssPropertyTransformCheckProperty";
import { CssRuleTransformCheckSelector } from "./CssRuleTransformCheckSelector";
import { CssTransformation } from "./CssTransformation";
import { CssTransformCheckTheme } from "./CssTransformCheckTheme";

export interface CssPropertyTransform
  extends CssTransformation,
    CssTransformCheckTheme,
    CssRuleTransformCheckSelector,
    CssPropertyTransformCheckProperty {
  readonly transforms: "property";
  transform(property: CssProperty, config: ThemeConfig): undefined | string | number | CssTree.Raw | CssTree.Value;
}
