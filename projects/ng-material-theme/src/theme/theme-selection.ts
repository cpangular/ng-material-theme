import Enumerable from "linq";
import { ThemeDefinition } from "./models/ThemeDefinition";
import { scanForThemes } from "./theme-scanner";

export function getDefaultTheme(themes?: ThemeDefinition[]) {
  const q = Enumerable.from(themes ?? scanForThemes());
  return q.firstOrDefault((t) => t.isDefault === "true") ?? q.firstOrDefault();
}

export function isValidTheme(themeId: string, themes?: ThemeDefinition[]) {
  const q = Enumerable.from(themes ?? scanForThemes());
  return q.any((t) => t.id === themeId);
}

export function getThemeSetting(elm: HTMLElement = document.documentElement): string | undefined {
  return elm.getAttribute("theme")?.trim() || undefined;
}

export function setThemeSetting(value: string | undefined, elm: HTMLElement = document.documentElement) {
  if (value) {
    elm.setAttribute("theme", value);
  } else {
    elm.removeAttribute("theme");
  }
}

export function getActiveTheme(themes?: ThemeDefinition[], elm: HTMLElement = document.documentElement): string | undefined {
  let themeId = getThemeSetting(elm);
  if (!themeId) {
    themeId = getDefaultTheme(themes)?.id;
  }
  return themeId;
}
