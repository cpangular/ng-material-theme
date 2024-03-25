export function findAccessibleCSSStyleRules() {
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
  return rules;
}

export interface ThemeDef {
  name: string;
  description?: string;
  [key: string]: string | undefined;
}

export function scanForThemes() {
  return findAccessibleCSSStyleRules()
    .filter((rule) => rule.selectorText?.trim() === "-theme-")
    .map((rule) => {
      rule.style.getPropertyValue("--theme");
      const themeDef = {} as ThemeDef;

      rule.styleMap.forEach((_value, key) => {
        const k = key.trim();
        if (k === "--theme") {
          themeDef.name = rule.style.getPropertyValue(k);
        } else if (k.startsWith("--theme-")) {
          themeDef[k.slice(8)] = rule.style.getPropertyValue(k);
        }
      });
      return themeDef;
    });
}

export function getWindow() {
  return typeof window !== "undefined" ? window : undefined;
}

export function getDocument() {
  return typeof document !== "undefined" ? document : undefined;
}

export function getDocumentElement() {
  return getDocument()?.documentElement;
}

export function getBodyElement() {
  return getDocument()?.body;
}

export function getLocalStorage() {
  return typeof localStorage !== "undefined" ? localStorage : undefined;
}
