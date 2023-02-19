export interface CssRuleTransformCheckSelector {
  appliesToSelector: (selector: string) => boolean;
}

export function hasRuleCheck(obj: object): obj is CssRuleTransformCheckSelector {
  return "appliesToSelector" in obj && typeof obj.appliesToSelector === "function";
}
