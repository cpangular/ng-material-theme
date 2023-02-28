import { colorCssPropertyName } from "../util/colorCssPropertyName";

export const MDCThemeTokenSubstitutions = {
  primary: colorCssPropertyName("primary"),
  "text-primary-on-background": colorCssPropertyName("primary", undefined, "contrast"),
  secondary: colorCssPropertyName("secondary"),
  "text-secondary-on-background": colorCssPropertyName("secondary", undefined, "contrast"),
  error: colorCssPropertyName("error"),
  "text-error-on-background": colorCssPropertyName("error", undefined, "contrast"),

  surface: colorCssPropertyName("surface"),
  "on-surface": colorCssPropertyName("surface", undefined, "contrast"),

  "text-icon-on-background": colorCssPropertyName("background", undefined, "contrast"),
  "text-hint-on-background": colorCssPropertyName("background", undefined, "contrast-lower"),
};
