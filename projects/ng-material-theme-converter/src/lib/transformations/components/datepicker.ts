import { ColorTranslator } from "colortranslator";
import { ColorLookup } from "../../data/ColorLookup";
import { TintLookup } from "../../data/TintLookup";
import { ThemeRegistry } from "../../ThemeRegistry";
import { CssColorModeDiffView } from "../../types/CssColorModeDiffView";
import { CssDiffView } from "../../types/CssDiffView";
import { ThemeFileUtil } from "../../types/ThemeFileUtil";
import { TransformationFn } from "../../types/TransformationFn";
import CssTree from "../../util/CssTree";
import { tryGetColor } from "../../util/tryGetColor";

const linearGradientRegExp = /^linear-gradient\((.*?)\)$/;

function _replaceLinearGrad(themeFile: ThemeFileUtil, n: CssTree.Value, props: (string | CssTree.CssNode)[]) {
  const node = n.children.first;
  if (node.type === "Function" && node.name === "linear-gradient") {
    node.children.clear();
    props.forEach((p) => {
      if (typeof p === "string") {
        const value = `var(${ThemeRegistry.registerVariable(themeFile.name, p)})`;
        p = CssTree.parse(value, { context: "value" });
        themeFile.markChanged();
      }
      node.children.append(node.children.createItem(p));
    });
  }
}

function _parseLinearGradNodeForColors(node: CssTree.Value | CssTree.Raw, diff: CssColorModeDiffView) {
  if (node.type === "Value" && node.children.first.type === "Function" && node.children.first.name === "linear-gradient") {
    const grad = node.children.first;
    let foundColor = false;
    const props = grad.children.toArray().map((prop, i) => {
      const color = tryGetColor(prop);
      if (color) {
        let replacement = ColorLookup.find((c) => new ColorTranslator(diff.darkMode ? c.dark : c.light).HEXA === color.HEXA);
        if (!replacement) {
          replacement = TintLookup.find(
            (c) => new ColorTranslator(diff.darkMode ? c.dark : c.light).HEX === color.HEX && c.alphas.includes(color.A)
          );
        }
        if (replacement) {
          foundColor = true;
          return replacement.name;
        }
      }
      return prop;
    });
    if (foundColor) {
      return props;
    }
  }
  return undefined;
}

function matDatePickerGradientsColors(themeFile: ThemeFileUtil): TransformationFn[] {
  if (themeFile.name !== "datepicker") return [];

  return themeFile.database.colorDifferencesView
    .where((d) => linearGradientRegExp.test(d.lightMode.value) && linearGradientRegExp.test(d.darkMode.value))
    .select((diff) => {
      const lightProps = _parseLinearGradNodeForColors(diff.lightMode.node.value, diff);
      const darkProps = _parseLinearGradNodeForColors(diff.darkMode.node.value, diff);
      if (lightProps || darkProps) {
        const d = diff as CssDiffView;
        return () => {
          if (lightProps) {
            _replaceLinearGrad(themeFile, d.lightMode.node.value as CssTree.Value, lightProps);
            _replaceLinearGrad(themeFile, d.density1.node.value as CssTree.Value, lightProps);
            _replaceLinearGrad(themeFile, d.density2.node.value as CssTree.Value, lightProps);
          }
          if (darkProps) {
            _replaceLinearGrad(themeFile, d.darkMode.node.value as CssTree.Value, darkProps);
          }
        };
      }
      return undefined;
    })
    .where((v) => !!v)
    .toArray();
}

export const DATE_PICKER_TRANSFORMS = [matDatePickerGradientsColors];
