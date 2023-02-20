import { mkdirSync, writeFileSync } from "fs";
import { ThemeConfig } from "./types/ThemeConfig";
import * as CssTree from "css-tree";
import { applyTransformations } from "./applyTransformations";
import { CssRuleReport } from "./report/CssRuleReport";
import Prettier, { util } from "prettier";
import Path from "path";
import { loadThemeStyleSheet } from "./util/loadThemeStyleSheet";
import { styleSheetToProperties } from "./util/styleSheetToProperties";
import { generateReport } from "./generateReport";

const SUB_THEMES = ["button-theme"];

const TRANSFORMATIONS = [];

function transformSubTheme(theme: string) {
  const configDark: ThemeConfig = { name: theme, darkMode: true, density: -2 };
  const configDense1: ThemeConfig = { name: theme, darkMode: true, density: -1 };
  const configDense0: ThemeConfig = { name: theme, darkMode: true, density: 0 };
  const configLight: ThemeConfig = { name: theme, darkMode: false, density: -2 };

  const themeDark = loadThemeStyleSheet(configDark);
  const themeDense1 = loadThemeStyleSheet(configDense1);
  const themeDense0 = loadThemeStyleSheet(configDense0);
  const themeLight = loadThemeStyleSheet(configLight);

  applyTransformations(configDark, themeDark, TRANSFORMATIONS);
  applyTransformations(configDense1, themeDense1, TRANSFORMATIONS);
  applyTransformations(configDense0, themeDense0, TRANSFORMATIONS);
  applyTransformations(configLight, themeLight, TRANSFORMATIONS);

  // report
  const report = generateReport(
    [
      styleSheetToProperties(configDark, themeDark),
      styleSheetToProperties(configDense1, themeDense1),
      styleSheetToProperties(configDense0, themeDense0),
      styleSheetToProperties(configLight, themeLight),
    ].flat()
  );

  return {
    css: serializeTheme(theme, themeDark),
    report,
  };
}

function serializeTheme(themeName: string, theme: CssTree.StyleSheet) {
  const scss = `
    @mixin ${themeName} (){
      ${CssTree.generate(theme)}
    }
  `;

  return Prettier.format(scss, { parser: "scss", tabWidth: 2 });
}

function printSubThemeReport(report: CssRuleReport[]) {
  console.log(report);
}

function writeSubThemeCss(name: string, css: string) {
  writeFileSync(Path.join("./dist/theme", `_${name}.scss`), css, { encoding: "utf-8" });
}

export function transformTheme() {
  mkdirSync("./dist/theme", { recursive: true });
  SUB_THEMES.forEach((t) => {
    const result = transformSubTheme(t);
    printSubThemeReport(result.report);
    writeSubThemeCss(t, result.css);
  });

  const forward = SUB_THEMES.map((t) => `@forward './${t}';`);
  const use = SUB_THEMES.map((t) => `@use './${t}';`);
  const include = SUB_THEMES.map((t) => `@include ${t}.${t}();`);
  const indexScss = `
    ${forward.join("\n")}

    ${use.join("\n")}

    @mixin all-themes(){
      ${include.join("\n")}
    }
  `;
  writeSubThemeCss("index", indexScss);
}
