import { CssRule } from "./CssRule";
import { ThemeConfig } from "./ThemeConfig";
import { CssRuleTransformCheckSelector } from "./CssRuleTransformCheckSelector";
import { CssTransformBase } from "./CssTransformBase";
import { CssTransformCheckTheme } from "./CssTransformCheckTheme";

export interface CssRuleTransform extends CssTransformBase, CssTransformCheckTheme, CssRuleTransformCheckSelector {
  readonly transforms: "rule";
  transform(rule: CssRule, config: ThemeConfig): CssRule | undefined;
}
