export interface ThemeProperties extends Record<string, string> {
  _mode: "shared" | "light" | "dark";
}

export interface SharedThemeProperties extends ThemeProperties {
  _mode: "shared";
}

export interface LightThemeProperties extends ThemeProperties {
  _mode: "light";
}

export interface DarkThemeProperties extends ThemeProperties {
  _mode: "dark";
}
