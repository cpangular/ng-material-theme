export interface CssTransformCheckTheme {
  appliesToTheme: (themeName: string) => boolean;
}

export function hasThemeCheck(obj: object): obj is CssTransformCheckTheme {
  return "appliesToTheme" in obj && typeof obj.appliesToTheme === "function";
}
