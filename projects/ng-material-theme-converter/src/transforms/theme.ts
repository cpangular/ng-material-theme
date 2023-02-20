import { mkdirSync, writeFileSync } from "fs";
import { compileNgMaterialTemplate } from "../compiler/compile-ng-material-theme";
import { ThemeConfig } from "./types/ThemeConfig";
import * as CssTree from "css-tree";
import { applyTransformations } from "./applyTransformations";
import { CssPropertyReport } from "./report/CssPropertyReport";
import Enumerable from "linq";
import { CssChangeReport } from "./report/CssChangeReport";
import { CssModeChangeReport } from "./report/CssModeChangeReport";
import { CssDensityChangeReport } from "./report/CssDensityChangeReport";
import { CssPropertyModificationReport } from "./report/CssPropertyModificationReport";
import { CssRuleReport } from "./report/CssRuleReport";
import Prettier, { util } from "prettier";
import Path from "path";

const SUB_THEMES = ["button-theme"];

const TRANSFORMATIONS = [];

function loadThemeStyleSheet(theme: ThemeConfig) {
  const result = compileNgMaterialTemplate(theme.name, theme.darkMode, theme.density);
  return CssTree.parse(result.css) as CssTree.StyleSheet;
}

function styleSheetToProperties(theme: ThemeConfig, stylesheet: CssTree.StyleSheet) {
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

function generateReport(properties: CssPropertyReport[]) {
  return Enumerable.from(properties)
    .groupBy(
      (p) => p.selector,
      (p) => p,
      (selector, props) => {
        return {
          selector,
          source: props.first().source,
          properties: props
            .groupBy(
              (p) => p.name,
              (p) => p,
              (name, p) => {
                const currentValue = p
                  .where((i) => i.darkMode === true && i.density === -2)
                  .select((i) => i.value)
                  .firstOrDefault();
                const colorValue = p
                  .where((i) => i.darkMode === false && i.density === -2)
                  .select((i) => i.value)
                  .firstOrDefault();
                const dense1Value = p
                  .where((i) => i.darkMode === true && i.density === -1)
                  .select((i) => i.value)
                  .firstOrDefault();
                const dense0Value = p
                  .where((i) => i.darkMode === true && i.density === 0)
                  .select((i) => i.value)
                  .firstOrDefault();

                let change: CssChangeReport | undefined;
                if (currentValue !== colorValue) {
                  change = {
                    scope: "mode",
                    darkModeValue: currentValue,
                    lightModeValue: colorValue,
                  } as CssModeChangeReport;
                } else if (currentValue !== dense1Value || currentValue !== dense0Value) {
                  change = {
                    scope: "density",

                    values: {
                      "-1": dense1Value,
                      "-2": dense0Value,
                      "0": currentValue,
                    },
                  } as CssDensityChangeReport;
                }

                return {
                  name,
                  value: currentValue,
                  change,
                } as CssPropertyModificationReport;
              }
            )
            .toArray(),
        } as CssRuleReport;
      }
    )
    .toArray();
}

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
  // writeFileSync(Path.join("./dist/theme", `_${name}.import.scss`), `
  //   @use './${name}' as theme;
  //   @include theme.${name}();
  // `, { encoding: 'utf-8' });
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
