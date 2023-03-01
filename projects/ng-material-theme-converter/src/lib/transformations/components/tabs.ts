import { ColorTranslator } from "colortranslator";
import { ColorLookup } from "../../data/ColorLookup";
import { ThemeRegistry } from "../../ThemeRegistry";
import { CssDiffView } from "../../types/CssDiffView";
import { ThemeFileUtil } from "../../types/ThemeFileUtil";
import { TransformationFn } from "../../types/TransformationFn";
import CssTree from "../../util/CssTree";

const mdcVarRefRegExp = /^var\(--mdc-tab-(.*?)(,\s*(.*?))?\)/;

function matTabColors(themeFile: ThemeFileUtil): TransformationFn[] {
  if (themeFile.name !== "tabs") return [];

  return themeFile.database.colorDifferencesView
    .where((d) => mdcVarRefRegExp.test(d.lightMode.value) && mdcVarRefRegExp.test(d.darkMode.value))
    .select((d) => {
      const lightMatch = d.lightMode.value.match(mdcVarRefRegExp);
      const darkMatch = d.darkMode.value.match(mdcVarRefRegExp);
      const lightColor = new ColorTranslator(lightMatch[3]);
      const darkColor = new ColorTranslator(darkMatch[3]);
      return {
        diff: d as CssDiffView,
        replacement: ColorLookup.find(
          (c) => new ColorTranslator(c.light).HEXA === lightColor.HEXA && new ColorTranslator(c.dark).HEXA === darkColor.HEXA
        )?.name,
      };
    })
    .select((data) => {
      return () => {
        const value = `var(${ThemeRegistry.registerVariable(themeFile.name, data.replacement)})`;
        const node = CssTree.parse(value, { context: "value" }) as CssTree.Value;
        data.diff.lightMode.node.value = node;
        data.diff.darkMode.node.value = node;
        data.diff.density1.node.value = node;
        data.diff.density2.node.value = node;
        themeFile.markChanged();
      };
    })
    .toArray();
}

export const TABS_TRANSFORMS = [matTabColors];
