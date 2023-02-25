import { ThemeRegistry } from "../../ThemeRegistry";
import { ThemeFileUtil } from "../../types/ThemeFileUtil";
import { TransformationFn } from "../../types/TransformationFn";
import { colorCssPropertyName } from "../../util/colorCssPropertyName";
import CssTree from "../../util/CssTree";

export function applyThemeBackground(themeFile: ThemeFileUtil): TransformationFn[] {
  if (themeFile.name !== "core") return [];

  return [
    () => {
      const bgValue = `var(${ThemeRegistry.registerVariable(themeFile.name, colorCssPropertyName("background"))})`;
      const fgValue = `var(${ThemeRegistry.registerVariable(themeFile.name, colorCssPropertyName("background", "contrast"))})`;

      themeFile.appendRule(
        CssTree.parse(
          `
      [theme]{
        background: ${bgValue};
        color: ${fgValue};
      }
    `.trim(),
          { context: "rule" }
        ) as CssTree.Rule
      );
    },
  ];
}
