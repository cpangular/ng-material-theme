import * as CssTree from "css-tree";
import { mkdirSync, writeFileSync } from "fs";
import Path from "path";
import Prettier from "prettier";
import { applyTransformations } from "./applyTransformations";
import { generateReport } from "./report/generateReport";
import { CssRuleReport } from "./report/CssRuleReport";
import { TRANSFORMATIONS } from "./TRANSFORMATIONS";
import { ThemeConfig } from "./types/ThemeConfig";
import { loadThemeStyleSheet } from "./util/loadThemeStyleSheet";
import { styleSheetToProperties } from "./util/styleSheetToProperties";
import chalk from "chalk";
import { CssModeChangeReport, isCssModeChangeReport } from "./report/CssModeChangeReport";
import { isCssDensityChangeReport } from "./report/CssDensityChangeReport";
import Enumerable from "linq";

const OUT_DIR = "./dist/ng-material-theme/scss";

const SUB_THEMES = ["button-theme"];

function transformSubTheme(theme: string, reportOnly: boolean = false) {
  const configDark: ThemeConfig = { name: theme, darkMode: true, density: -2 };
  const configDense1: ThemeConfig = { name: theme, darkMode: true, density: -1 };
  const configDense0: ThemeConfig = { name: theme, darkMode: true, density: 0 };
  const configLight: ThemeConfig = { name: theme, darkMode: false, density: -2 };

  const themeDark = loadThemeStyleSheet(configDark);
  const themeDense1 = loadThemeStyleSheet(configDense1);
  const themeDense0 = loadThemeStyleSheet(configDense0);
  const themeLight = loadThemeStyleSheet(configLight);

  if (!reportOnly) {
    applyTransformations(configDark, themeDark, TRANSFORMATIONS);
    applyTransformations(configDense1, themeDense1, TRANSFORMATIONS);
    applyTransformations(configDense0, themeDense0, TRANSFORMATIONS);
    applyTransformations(configLight, themeLight, TRANSFORMATIONS);
  }

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

  return scss;
}

function printSubThemeReport(theme: string, report: CssRuleReport[]) {
  console.info(chalk.green(`Compiled ${theme}.`));

  const differences = report.filter((r) => !!r.properties.find((r2) => !!r2.change));
  if (!differences.length) {
    console.info(chalk.greenBright("No differences detected in theme variations"));
  }

  differences.forEach((d) => {
    console.info(`[${chalk.yellow("DIFFERENCE")}]`, theme);
    console.info(chalk.gray(d.selector));
    console.group();

    d.properties
      .filter((p) => !!p.change)
      .forEach((p) => {
        console.info();
        console.info(chalk.cyan(p.name));
        if (isCssDensityChangeReport(p.change)) {
          console.table({
            "density 0": p.change.values[0],
            "density -1": p.change.values["-1"],
            "density -2": p.change.values["-2"],
          });
        } else if (isCssModeChangeReport(p.change)) {
          console.table({
            light: p.change.lightModeValue,
            dark: p.change.darkModeValue,
          });
        } else {
          console.log(p);
        }
      });
    console.groupEnd();
    console.info();
  });
}

function writeSubThemeCss(name: string, scss: string) {
  writeFileSync(Path.join(OUT_DIR, `_${name}.scss`), Prettier.format(scss, { parser: "scss", tabWidth: 2 }), { encoding: "utf-8" });
}

export function transformTheme(reportOnly: boolean = false) {
  mkdirSync(OUT_DIR, { recursive: true });
  SUB_THEMES.forEach((t) => {
    const result = transformSubTheme(t, reportOnly);
    printSubThemeReport(t, result.report);
    if (!reportOnly) {
      writeSubThemeCss(t, result.css);
    }
  });
  if (!reportOnly) {
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
}
