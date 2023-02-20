import { CssProperty } from "../types/CssProperty";
import { CssPropertyTransformCheckProperty } from "../types/CssPropertyTransformCheckProperty";
import { CssRuleTransformCheckSelector } from "../types/CssRuleTransformCheckSelector";
import { CssTransformCheckTheme } from "../types/CssTransformCheckTheme";

export class CssTransformBase implements CssTransformCheckTheme, CssRuleTransformCheckSelector, CssPropertyTransformCheckProperty {
  public appliesToTheme(themeName: string) {
    return true;
  }
  public appliesToSelector(selector: string) {
    return true;
  }
  public appliesToProperty(property: CssProperty) {
    return true;
  }
}
