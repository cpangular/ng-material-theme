import { ThemeConfig } from "../types/ThemeConfig";
import * as CssTree from "css-tree";
import { CssPropertyReport } from "../report/CssPropertyReport";

export function styleSheetToProperties(theme: ThemeConfig, stylesheet: CssTree.StyleSheet) {
  const props: CssPropertyReport[] = [];
  CssTree.walk(stylesheet, function (node) {
    if (node.type === "Declaration") {
      const selector = CssTree.generate(this.rule.prelude);
      props.push({
        source: theme.name,
        darkMode: theme.darkMode,
        density: theme.density,
        selector,
        name: node.property,
        value: CssTree.generate(node.value),
        important: !!node.important,
      });
    }
  });
  return props;
}
