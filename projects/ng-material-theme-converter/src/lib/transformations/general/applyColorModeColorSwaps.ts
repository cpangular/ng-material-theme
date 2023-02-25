import Enumerable from "linq";
import { CssColorModeDiffView } from "../../types/CssColorModeDiffView";
import { CssDiffView } from "../../types/CssDiffView";
import { ThemeFileUtil } from "../../types/ThemeFileUtil";
import CssTree from "../../util/CssTree";
import { ColorModeColorSwapTransformation } from "./types/ColorModeColorSwapTransformation";

export function applyColorModeColorSwaps(themeFile: ThemeFileUtil): ColorModeColorSwapTransformation {
  const ret: ColorModeColorSwapTransformation = {
    generatedCount: 0,
    modifiedCount: 0,
    headers: [],
    properties: [],
  };

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
          variable: `--_ref-mode_--${source}--${rng}-${ret.generatedCount++}`,
          lightValue,
          darkValue,
          replacements: group.toArray(),
        };
      }
    )
    .toArray();

  if (result.length) {
    ret.headers = buildHeaderTransforms(themeFile, result);
    ret.properties = buildPropertyTransforms(themeFile, result);
    ret.modifiedCount = ret.properties.length;
  }
  return ret;
}

function buildPropertyTransforms(
  themeFile: ThemeFileUtil,
  result: { variable: string; lightValue: string; darkValue: string; replacements: CssColorModeDiffView[] }[]
) {
  return Enumerable.from(result)
    .selectMany((v) =>
      (v.replacements as CssDiffView[]).map((r) => () => {
        const variable = v.variable;
        const replacementNode = CssTree.parse(`var(${variable})`, { context: "value" });
        r.lightMode.node.value = CssTree.clone(replacementNode) as CssTree.Value;
        r.darkMode.node.value = CssTree.clone(replacementNode) as CssTree.Value;
        r.density0.node.value = CssTree.clone(replacementNode) as CssTree.Value;
        r.density1.node.value = CssTree.clone(replacementNode) as CssTree.Value;
        r.density2.node.value = CssTree.clone(replacementNode) as CssTree.Value;
        themeFile.markChanged();
      })
    )
    .toArray();
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
      @include theme-mode.dark-mode(){
        // Automatically generated variables to handle dark-mode //
        // These should not be referenced outside this file. //
        ${darkModeModeVars.join("\n")}
      }
    `;

  const headers = [CssTree.parse(lightModeRule.trim(), { context: "rule" }), CssTree.parse(darkModeRule.trim(), { context: "rule" })];
  return headers.reverse().map((h) => {
    return () => {
      themeFile.prependRule(h as CssTree.Rule);
      themeFile.markChanged();
    };
  });
}
