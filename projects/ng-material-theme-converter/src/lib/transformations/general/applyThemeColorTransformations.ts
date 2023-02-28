import { ColorTranslator } from "colortranslator";
import { ColorLookup } from "../../data/ColorLookup";
import { ThemeRegistry } from "../../ThemeRegistry";
import { CssDiffView } from "../../types/CssDiffView";
import { PropertyTransformation } from "../../types/PropertyTransformation";
import { ThemeFileUtil } from "../../types/ThemeFileUtil";
import CssTree from "../../util/CssTree";

export function applyThemeColorTransformations(themeFile: ThemeFileUtil): PropertyTransformation[] {
  return themeFile.database.colorDifferencesView
    .where((v) => v.darkMode?.value !== undefined && v.lightMode?.value !== undefined)
    .selectMany((v) => {
      const diff = v as CssDiffView;
      return [
        ...diff.lightMode.valueColors.colors.map((color) => ({
          color,
          darkMode: false,
          node: diff.lightMode.node,
        })),
        ...diff.darkMode.valueColors.colors.map((color) => ({
          color,
          darkMode: true,
          node: diff.darkMode.node,
        })),
        ...diff.density1.valueColors.colors.map((color) => ({
          color,
          darkMode: false,
          node: diff.density1.node,
        })),
        ...diff.density2.valueColors.colors.map((color) => ({
          color,
          darkMode: false,
          node: diff.density2.node,
        })),
      ];
    })
    .select((v) => {
      const replacement = ColorLookup.map((c) => ({
        name: c.name,
        color: new ColorTranslator(v.darkMode ? c.dark : c.light),
      })).find((c) => v.color.HEXA === c.color.HEXA);

      if (replacement) {
        return () => {
          const value = `var(${ThemeRegistry.registerVariable(themeFile.name, replacement.name)})`;
          v.node.value = CssTree.parse(value, { context: "value" }) as CssTree.Value;
          themeFile.markChanged();
        };
      }
    })
    .where((v) => !!v)
    .toArray();
}
