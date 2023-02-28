import * as CssTree from "css-tree";
import { ThemeConfig } from "../types/ThemeConfig";
import { compileNgMaterialComponentTemplate } from "./compileNgMaterialComponentTemplate";

export function loadThemeStyleSheet(theme: ThemeConfig) {
  const result = compileNgMaterialComponentTemplate(theme.name, theme.darkMode, theme.density);
  return {
    styleSheet: CssTree.parse(result.css) as CssTree.StyleSheet,
    source: result.css,
  };
}
