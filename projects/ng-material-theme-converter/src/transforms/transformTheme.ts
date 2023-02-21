import chalk from "chalk";
import * as CssTree from "css-tree";
import { mkdirSync, writeFileSync } from "fs";
import Path from "path";
import Prettier from "prettier";
import { applyTransformations } from "./applyTransformations";
import { isCssDensityChangeReport } from "./report/CssDensityChangeReport";
import { isCssModeChangeReport } from "./report/CssModeChangeReport";
import { CssRuleReport } from "./report/CssRuleReport";
import { generateReport } from "./report/generateReport";
import { TRANSFORMATIONS } from "./TRANSFORMATIONS";
import { ThemeConfig } from "./types/ThemeConfig";
import { loadThemeStyleSheet } from "./util/loadThemeStyleSheet";
import { styleSheetToProperties } from "./util/styleSheetToProperties";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { ThemeVarsRegistry } from "./ThemeVarsRegistry";

const options = yargs(hideBin(process.argv))
  .option("theme", {
    type: "string",
  })
  .option("theme-index", {
    type: "number",
    default: undefined,
  })
  .option("report", {
    type: "boolean",
    default: true,
  })
  .option("report-color-mode", {
    type: "boolean",
    default: true,
  })
  .option("report-density", {
    type: "boolean",
    default: true,
  })
  .option("write", {
    type: "boolean",
    default: true,
  })
  .option("transform", {
    type: "boolean",
    default: true,
  })
  .parseSync();

const OUT_DIR = "./dist/ng-material-theme/scss";

const SUB_THEMES = [
  "core",
  "card",
  "progress-bar",
  "tooltip",
  "form-field",
  "input",
  "select",
  "autocomplete",
  "dialog",
  "chips",
  "slide-toggle",
  "radio",
  "slider",
  "menu",
  "list",
  "paginator",
  "tabs",
  "checkbox",
  "button",
  "icon-button",
  "fab",
  "snack-bar",
  "table",
  "progress-spinner",
  "badge",
  "bottom-sheet",
  "button-toggle",
  "datepicker",
  "divider",
  "expansion",
  "grid-list",
  "icon",
  "sidenav",
  "stepper",
  "sort",
  "toolbar",
  "tree",
];

function transformSubTheme(theme: string) {
  const configDark: ThemeConfig = { name: theme, darkMode: true, density: -2 };
  const configDense1: ThemeConfig = { name: theme, darkMode: true, density: -1 };
  const configDense0: ThemeConfig = { name: theme, darkMode: true, density: 0 };
  const configLight: ThemeConfig = { name: theme, darkMode: false, density: -2 };

  const themeDark = loadThemeStyleSheet(configDark);
  const themeDense1 = loadThemeStyleSheet(configDense1);
  const themeDense0 = loadThemeStyleSheet(configDense0);
  const themeLight = loadThemeStyleSheet(configLight);

  if (options.transform) {
    applyTransformations(configDark, themeDark, TRANSFORMATIONS);
    applyTransformations(configDense1, themeDense1, TRANSFORMATIONS);
    applyTransformations(configDense0, themeDense0, TRANSFORMATIONS);
    applyTransformations(configLight, themeLight, TRANSFORMATIONS);
  }

  // report
  let report: CssRuleReport[] = [];
  if (options.report) {
    report = generateReport(
      [
        styleSheetToProperties(configDark, themeDark),
        styleSheetToProperties(configDense1, themeDense1),
        styleSheetToProperties(configDense0, themeDense0),
        styleSheetToProperties(configLight, themeLight),
      ].flat()
    );
  }

  return {
    css: serializeTheme(themeDark),
    report,
  };
}

function serializeTheme(theme: CssTree.StyleSheet) {
  const scss = `
    @mixin theme(){
      ${CssTree.generate(theme)}
    }
  `;
  return scss;
}

function printSubThemeReport(theme: string, report: CssRuleReport[]) {
  if (!options.report) return;

  console.info();
  console.info(chalk.yellow(`----- Compiled ${theme} -----`));
  console.info();
  console.group();

  const differences = report
    .filter((r) => !!r.properties.find((r2) => !!r2.change))
    .filter((r) => options.reportColorMode || !!r.properties.find((r2) => !isCssModeChangeReport(r2.change)))
    .filter((r) => options.reportDensity || !!r.properties.find((r2) => !isCssDensityChangeReport(r2.change)));

  if (!differences.length) {
    console.info(chalk.greenBright("No differences detected in theme variations"));
  }

  differences.forEach((d) => {
    console.info(`[${chalk.yellowBright("DIFFERENCE")}]`, theme);
    console.group();
    console.info(chalk.gray(d.selector.split(",").join(",\n")));
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
    console.groupEnd();
    console.info();
  });

  console.groupEnd();

  // console.log(ThemeVarsRegistry.registeredThemeVariables)
}

function writeSubThemeCss(name: string, scss: string, includeUtil: boolean = true) {
  if (options.write) {
    if (includeUtil) {
      scss = `
        @use './util';

        ${scss}
      `;
    }
    writeFileSync(Path.join(OUT_DIR, `_${name}.scss`), Prettier.format(scss, { parser: "scss", tabWidth: 2 }), { encoding: "utf-8" });
  }
}

export function transformTheme() {
  if (options.write) {
    mkdirSync(OUT_DIR, { recursive: true });
  }
  SUB_THEMES.filter((t) => !options.theme || options.theme === t)
    .filter((_, i) => options.themeIndex === undefined || options.themeIndex === i)
    .forEach((t) => {
      const result = transformSubTheme(t);
      printSubThemeReport(t, result.report);
      writeSubThemeCss(t, result.css);
    });

  if (options.write) {
    const use = SUB_THEMES.map((t) => `@use './${t}';`);
    const include = SUB_THEMES.map((t) => `@include ${t}.theme();`);
    const allThemesCss = `
      ${use.join("\n")}
      @mixin all-themes(){
        ${include.join("\n")}
      }
    `;
    writeSubThemeCss("all-themes", allThemesCss, false);

    const forward = SUB_THEMES.map((t) => `@forward './${t}' as ${t}-*;`);
    forward.push(`@forward './all-themes';`);
    const indexCss = forward.join("\n");
    writeSubThemeCss("index", indexCss, false);
  }
}
