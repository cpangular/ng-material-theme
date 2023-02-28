import CssTree from "../util/CssTree";

export interface ThemeFileSnapShot {
  readonly styleSheetLight: CssTree.StyleSheet;
  readonly styleSheetDark: CssTree.StyleSheet;
  readonly styleSheetDense1: CssTree.StyleSheet;
  readonly styleSheetDense2: CssTree.StyleSheet;
}
