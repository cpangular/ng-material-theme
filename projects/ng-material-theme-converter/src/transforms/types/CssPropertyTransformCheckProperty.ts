import { CssProperty } from "./CssProperty";
import { CssRuleTransformCheckSelector } from "./CssRuleTransformCheckSelector";

export interface CssPropertyTransformCheckProperty extends CssRuleTransformCheckSelector {
  appliesToProperty: (property: CssProperty) => boolean;
}

export function hasPropertyCheck(obj: object): obj is CssPropertyTransformCheckProperty {
  return "appliesToProperty" in obj && typeof obj.appliesToProperty === "function";
}
