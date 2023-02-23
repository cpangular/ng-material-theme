import * as CssTree from "css-tree";
import { ThemeConfig } from "../types/ThemeConfig";
import { compileNgMaterialTemplate } from "./compileNgMaterialTemplate";

export function loadThemeStyleSheet(theme: ThemeConfig) {
  const result = compileNgMaterialTemplate(theme.name, theme.darkMode, theme.density);
  return {
    styleSheet: CssTree.parse(result.css) as CssTree.StyleSheet,
    source: result.css,
  };
}
