//import { DarkThemeProperties, LightThemeProperties, SharedThemeProperties } from "./ThemeProperties";

export interface ThemeDefinition {
  id: string;
  isDefault?: "true" | "false";
  //sharedProperties?: SharedThemeProperties;
  //lightModeProperties?: LightThemeProperties;
  //darkModeProperties?: DarkThemeProperties;
}
