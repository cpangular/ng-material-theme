import { compileNgMaterialTemplate } from "../../compiler/compile-ng-material-theme";
import { ThemeConfig } from "../types/ThemeConfig";
import * as CssTree from "css-tree";

export function loadThemeStyleSheet(theme: ThemeConfig) {
  const result = compileNgMaterialTemplate(theme.name, theme.darkMode, theme.density);
  return CssTree.parse(result.css) as CssTree.StyleSheet;
}