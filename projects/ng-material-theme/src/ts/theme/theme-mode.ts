import { ThemeMode } from "./models/ThemeMode";

const STORAGE_KEY = "cpngThemeMode";

export function getPreferredMode(): ThemeMode.LIGHT | ThemeMode.DARK {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? ThemeMode.DARK : ThemeMode.LIGHT;
}

export function getModeSetting(): ThemeMode {
  const attr = document.documentElement.getAttribute("theme-mode")?.toLowerCase();
  switch (attr) {
    case ThemeMode.LIGHT:
    case ThemeMode.DARK:
      return attr;
    default:
      return ThemeMode.AUTO;
  }
}

export function setModeSetting(value: ThemeMode) {
  if (value === ThemeMode.AUTO) {
    document.documentElement.removeAttribute("theme-mode");
    localStorage.removeItem(STORAGE_KEY);
  } else {
    document.documentElement.setAttribute("theme-mode", value);
    localStorage.setItem(STORAGE_KEY, value);
  }
}

export function getMode(): ThemeMode.LIGHT | ThemeMode.DARK {
  const setting = getModeSetting();
  return setting === ThemeMode.AUTO ? getPreferredMode() : setting;
}

export function isDarkMode(): boolean {
  return getMode() === ThemeMode.DARK;
}

export function isLightMode(): boolean {
  return getMode() === ThemeMode.LIGHT;
}

export function applyDarkMode() {
  setModeSetting(ThemeMode.DARK);
}

export function applyLightMode() {
  setModeSetting(ThemeMode.LIGHT);
}

export function toggleMode() {
  if (isLightMode()) {
    applyDarkMode();
  } else {
    applyLightMode();
  }
}

if (typeof document !== "undefined") {
  const mode = (localStorage.getItem(STORAGE_KEY) as ThemeMode) ?? ThemeMode.AUTO;
  setModeSetting(mode);
}
