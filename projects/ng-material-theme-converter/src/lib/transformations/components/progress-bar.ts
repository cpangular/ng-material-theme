import { ColorTranslator } from "colortranslator";
import { ColorLookup } from "../../data/ColorLookup";
import { TintLookup } from "../../data/TintLookup";
import { ThemeRegistry } from "../../ThemeRegistry";
import { CssDiffView } from "../../types/CssDiffView";
import { ThemeFileUtil } from "../../types/ThemeFileUtil";
import { TransformationFn } from "../../types/TransformationFn";
import CssTree from "../../util/CssTree";
import { tryGetColor } from "../../util/tryGetColor";

const matProgressBarSvgRegExp = /^url\((.*?)\)/;
const findRgbRegExp = /rgba\\\(.*?\)/gim;

function matProgressBarSvgColors(themeFile: ThemeFileUtil): TransformationFn[] {
  if (themeFile.name !== "progress-bar") return [];

  return themeFile.database.colorDifferencesView
    .where((d) => matProgressBarSvgRegExp.test(d.lightMode.value) && matProgressBarSvgRegExp.test(d.darkMode.value))
    .select((d) => {
      const matches = Array.from(d.lightMode.value.matchAll(findRgbRegExp));
      if (matches?.[0]?.[0]) {
        let propValue = d.lightMode.value;
        const register: string[] = [];

        for (const match of matches) {
          const found = match[0];
          const cleanFound = found.replaceAll("\\", "");
          const color = tryGetColor(cleanFound);

          let replacement = ColorLookup.find((c) => new ColorTranslator(c.light).HEXA === color.HEXA);
          if (!replacement) {
            replacement = TintLookup.find((c) => new ColorTranslator(c.light).HEX === color.HEX && c.alphas.includes(color.A));
          }
          if (replacement) {
            register.push(replacement.name);
            const val = `var\\(${replacement.name}\\)`;
            propValue = propValue.replaceAll(found, val);
          }
        }
        const diff = d as CssDiffView;
        return () => {
          register.forEach((p) => ThemeRegistry.registerVariable(themeFile.name, p));
          const node = CssTree.parse(propValue, { context: "value" }) as CssTree.Value;
          diff.lightMode.node.value = node;
          diff.darkMode.node.value = node;
          diff.density1.node.value = node;
          diff.density2.node.value = node;
          themeFile.markChanged();
        };
      }
      return undefined;
    })
    .where((v) => !!v)
    .toArray();
}

export const PROGRESS_BAR_TRANSFORMS = [matProgressBarSvgColors];
