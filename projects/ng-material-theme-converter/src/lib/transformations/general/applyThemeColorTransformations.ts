import { ColorTranslator } from "colortranslator";
import { ThemeVarsRegistry } from "../../../transforms/ThemeVarsRegistry";
import { ColorLookup } from "../../data/ColorLookup";
import { CssColorModeDiffView } from "../../types/CssColorModeDiffView";
import { CssDiffView } from "../../types/CssDiffView";
import { HeaderInsertionTransformation } from "../../types/HeaderInsertionTransformation";
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
          const value = `var(${ThemeVarsRegistry.register(themeFile.name, replacement.name)})`;
          v.node.value = CssTree.parse(value, { context: "value" }) as CssTree.Value;
          themeFile.markChanged();
        };
      }
    })
    .where((v) => !!v)
    .toArray();
}

interface ColorModeColorSwapTransformation {
  headers: HeaderInsertionTransformation[];
  properties: PropertyTransformation[];
}

export function applyColorModeColorSwaps(themeFile: ThemeFileUtil): ColorModeColorSwapTransformation {
  const ret: ColorModeColorSwapTransformation = {
    headers: [],
    properties: [],
  };

  let swapVarCount = 0;
  const result = themeFile.database.colorDifferencesView
    .where((v) => v.darkMode?.value !== undefined && v.lightMode?.value !== undefined)
    .groupBy(
      (v) => `${v.lightMode.value}<=>${v.darkMode.value}`,
      (v) => v,
      (_, group) => {
        const source = group.first().sourceFile;
        const lightValue = group.first().lightMode.value;
        const darkValue = group.first().darkMode.value;
        const rng = `${Math.round(Math.random() * 99999999)}`.padStart(8, "0");
        return {
          variable: `--_generated_mode-ref--${source}--${rng}-${swapVarCount++}`,
          lightValue,
          darkValue,
          replacements: group.toArray(),
        };
      }
    )
    // .selectMany(v => {
    //   return v.replacements.map(r => ({
    //     variable: v.variable,
    //     lightValue: v.lightValue,
    //     darkValue: v.darkValue,
    //     sourceFiles: r.sourceFile,
    //     selectors: r.selectors,
    //     name: r.name,
    //     lightMode: r.lightMode,
    //     darkMode: r.darkMode,
    //   }));
    // })
    .toArray();

  if (result.length) {
    ret.headers = buildHeaderTransforms(themeFile, result);
  }

  //return themeFile.database.colorDifferencesView

  return ret;
}

function buildHeaderTransforms(
  themeFile: ThemeFileUtil,
  result: {
    variable: string;
    lightValue: string;
    darkValue: string;
    replacements: CssColorModeDiffView[];
  }[]
) {
  const lightModeVars = result.map((r) => `${r.variable}: ${r.lightValue};`);
  const darkModeModeVars = result.map((r) => `${r.variable}: ${r.darkValue};`);
  const lightModeRule = `
      html{
        // Automatically generated variables to handle light-mode //
        // These should not be referenced outside this file. //
        ${lightModeVars.join("\n")}
      }
    `;
  const darkModeRule = `
      @include util.dark-mode-only(){
        // Automatically generated variables to handle dark-mode //
        // These should not be referenced outside this file. //
        ${darkModeModeVars.join("\n")}
      }
    `;

  const headers = [CssTree.parse(lightModeRule.trim(), { context: "rule" }), CssTree.parse(darkModeRule.trim(), { context: "rule" })];
  return headers.reverse().map((h) => {
    return () => {
      themeFile.prependHeader(h as CssTree.Rule);
    };
  });
}
