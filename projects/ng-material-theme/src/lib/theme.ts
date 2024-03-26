import {
  getBodyElement,
  getDocumentElement,
  getLocalStorage,
  getWindow,
} from "./util";

export enum ThemeMode {
  AUTO = "auto",
  LIGHT = "light",
  DARK = "dark",
}

const STORAGE_KEY_MODE = "cpngThemeMode";
const STORAGE_KEY_THEME = "cpngTheme";

export function getActiveTheme(
  elm: HTMLElement | undefined = getBodyElement(),
) {
  if (!elm) {
    return undefined;
  }
  return elm.getAttribute("theme")?.trim();
}

export function getPreferredMode(): ThemeMode.LIGHT | ThemeMode.DARK {
  return getWindow()?.matchMedia("(prefers-color-scheme: dark)").matches
    ? ThemeMode.DARK
    : ThemeMode.LIGHT;
}

export function getThemeMode() {
  const mode = getDocumentElement()?.getAttribute("theme-mode")?.trim();
  switch (mode) {
    case ThemeMode.LIGHT:
    case ThemeMode.DARK:
      return mode;
    default:
      return ThemeMode.AUTO;
  }
}

export function getActiveThemeMode() {
  const mode = getThemeMode();
  return mode === ThemeMode.AUTO ? getPreferredMode() : mode;
}

export function setThemeMode(mode: ThemeMode) {
  if (mode === ThemeMode.AUTO) {
    getDocumentElement()?.removeAttribute("theme-mode");
    getLocalStorage()?.removeItem(STORAGE_KEY_MODE);
  } else {
    getDocumentElement()?.setAttribute("theme-mode", mode);
    getLocalStorage()?.setItem(STORAGE_KEY_MODE, mode);
  }
}

export function setTheme(
  theme: string | undefined,
  elm: HTMLElement | undefined = getBodyElement(),
) {
  if (!elm) {
    return;
  }
  if (theme) {
    elm.setAttribute("theme", theme);
    getLocalStorage()?.setItem(STORAGE_KEY_THEME, theme);
  } else {
    elm.removeAttribute("theme");
    getLocalStorage()?.removeItem(STORAGE_KEY_THEME);
  }
}

setTheme(getLocalStorage()?.getItem(STORAGE_KEY_THEME) ?? undefined);
setThemeMode(
  (getLocalStorage()?.getItem(STORAGE_KEY_MODE) as ThemeMode) ?? ThemeMode.AUTO,
);
