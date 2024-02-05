import Enumerable from "linq";
import { ThemeDefinition } from "./models/ThemeDefinition";
import { scanForThemes } from "./theme-scanner";

const STORAGE_KEY = "cpngTheme";

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
    localStorage.setItem(STORAGE_KEY, value);
  } else {
    elm.removeAttribute("theme");
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getActiveTheme(themes?: ThemeDefinition[], elm: HTMLElement = document.documentElement): string | undefined {
  let themeId = getThemeSetting(elm);
  if (!themeId) {
    themeId = getDefaultTheme(themes)?.id;
  }
  return themeId;
}

if (typeof document !== "undefined") {
  const theme = localStorage.getItem(STORAGE_KEY) ?? undefined;
  setThemeSetting(theme);
}
