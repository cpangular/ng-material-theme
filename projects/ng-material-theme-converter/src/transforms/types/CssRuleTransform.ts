import { CssRule } from "./CssRule";
import { ThemeConfig } from "../../lib/types/ThemeConfig";
import { CssRuleTransformCheckSelector } from "./CssRuleTransformCheckSelector";
import { CssTransformation } from "./CssTransformation";
import { CssTransformCheckTheme } from "./CssTransformCheckTheme";
import * as CssTree from "css-tree";
export interface CssRuleTransform extends CssTransformation, CssTransformCheckTheme, CssRuleTransformCheckSelector {
  readonly transforms: "rule";
  transform(rule: CssRule, config: ThemeConfig): CssTree.Rule | undefined;
}
