import { colorKey } from "../util/colorKey";

export const MDCThemeTokenSubstitutions = {
  primary: colorKey("primary"),
  "text-primary-on-background": colorKey("primary", undefined, "contrast"),
  secondary: colorKey("secondary"),
  "text-secondary-on-background": colorKey("secondary", undefined, "contrast"),
  error: colorKey("error"),
  "text-error-on-background": colorKey("error", undefined, "contrast"),

  surface: colorKey("surface"),
  "on-surface": colorKey("surface", undefined, "contrast"),

  "text-icon-on-background": colorKey("background", undefined, "contrast"),
  "text-hint-on-background": colorKey("background", undefined, "contrast-lower"),
};
