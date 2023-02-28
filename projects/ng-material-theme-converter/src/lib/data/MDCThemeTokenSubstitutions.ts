import { colorCssPropertyName } from "../util/colorCssPropertyName";

export const MDCThemeTokenSubstitutions = {
  primary: colorCssPropertyName("primary"),
  secondary: colorCssPropertyName("secondary"),
  error: colorCssPropertyName("error"),

  surface: colorCssPropertyName("surface"),
  "on-surface": colorCssPropertyName("surface", undefined, "contrast"),

  "text-primary-on-background": colorCssPropertyName("background", undefined, "contrast"),
  "text-secondary-on-background": colorCssPropertyName("background", undefined, "contrast-low"),
  "text-icon-on-background": colorCssPropertyName("background", undefined, "contrast"),
  "text-hint-on-background": colorCssPropertyName("background", undefined, "contrast-lower"),
};
