import Enumerable from "linq";
import { ThemeDefinition } from "./models/ThemeDefinition";
import { camelCase } from "camel-case";

const cssRules = Enumerable.defer(findAccessibleCSSStyleRules);
const themeDefinitionRules = cssRules.where((r) => r.selectorText.trim() === "-theme-");
const themeDefinitions = themeDefinitionRules.select(
  (rule) =>
    Enumerable.from(rule.style).toObject(
      (propName) => camelCase(propName.slice(12)),
      (propName) => rule.style.getPropertyValue(propName).trim()
    ) as unknown as ThemeDefinition
);

function findAccessibleCSSStyleRules() {
  const rules: CSSStyleRule[] = [];
  for (let i = 0; i < document.styleSheets.length; i++) {
    const sheet = document.styleSheets.item(i);
    let hasRules = false;
    // this will throw a security error for sheets we do not have access to
    try {
      hasRules = (sheet?.cssRules.length ?? 0) > 0;
    } catch {}
    if (hasRules) {
      for (let j = 0; j < sheet!.cssRules.length; j++) {
        const rule = sheet!.cssRules.item(j);
        if (rule instanceof CSSStyleRule) {
          rules.push(rule);
        }
      }
    }
  }
  return Enumerable.from(rules);
}

export function scanForThemes() {
  return themeDefinitions.toArray();
}
