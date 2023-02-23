import chalk from "chalk";
import * as CssTree from "css-tree";
import { mkdirSync, writeFileSync } from "fs";
import Path from "path";
import Prettier from "prettier";
import { applyTransformations } from "./applyTransformations";
import { CssDensityChangeReport, isCssDensityChangeReport } from "./report/CssDensityChangeReport";
import { CssModeChangeReport, isCssModeChangeReport } from "./report/CssModeChangeReport";
import { CssRuleReport } from "./report/CssRuleReport";
import { generateReport } from "./report/generateReport";
import { TRANSFORMATIONS } from "./TRANSFORMATIONS";
import { ThemeConfig } from "../lib/types/ThemeConfig";
import { loadThemeStyleSheet } from "../lib/util/loadThemeStyleSheet";
import { styleSheetToProperties } from "./util/styleSheetToProperties";

import Enumerable from "linq";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { CssChangeReport } from "./report/CssChangeReport";

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
  .option("gen-missing-mode-vars", {
    type: "boolean",
    default: true,
  })
  .option("gen-missing-density-vars", {
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

// {
//   source: string;
//   selector: string;
//   property: string;
//   change: CssChangeReport;
// }

interface CssChangeReportEntry<T extends CssChangeReport = CssChangeReport> {
  source: string;
  selector: string;
  property: string;
  change: T;
}

interface DeclarationLocation {
  source: string;
  selector: string;
  property: string;
}
interface DeclarationModificationRecord {
  source: string;
  index: number;
  variable: string;
  locations: DeclarationLocation[];
}
interface DeclarationModeModificationRecord extends DeclarationModificationRecord {
  lightModeValue: string;
  darkModeValue: string;
}

function applyHeaderReportedModeDifferencesToAst(
  styleSheet: CssTree.StyleSheet,
  modificationRecords: DeclarationModeModificationRecord[],
  config: ThemeConfig
) {
  if (!modificationRecords?.length) return;

  const lightModeVars = modificationRecords.map((r) => `${r.variable}: ${r.lightModeValue};`);
  const darkModeModeVars = modificationRecords.map((r) => `${r.variable}: ${r.darkModeValue};`);

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

  const lightNode = CssTree.parse(lightModeRule.trim(), { context: "rule" });
  const darkNode = CssTree.parse(darkModeRule.trim(), { context: "rule" });

  let item = styleSheet.children.createItem(darkNode);
  styleSheet.children.prepend(item);
  item = styleSheet.children.createItem(lightNode);
  styleSheet.children.prepend(item);
}

function applyVariablesReportedModeDifferencesToAst(
  styleSheet: CssTree.StyleSheet,
  modificationRecords: DeclarationModeModificationRecord[],
  config: ThemeConfig
) {
  if (!modificationRecords?.length) return;

  CssTree.walk(styleSheet, function (n, i, l) {
    if (n.type === "Declaration") {
      const selector = CssTree.generate(this.rule.prelude).trim();
      const prop = n.property;
      const modification = modificationRecords.find(
        (m) => m.source === config.name && !!m.locations.find((l) => l.selector === selector && l.property === prop)
      );
      if (modification) {
        const replacementValue = `var(${modification.variable})`;
        n.value = CssTree.parse(replacementValue, { context: "value" }) as CssTree.Value;
      }
    }
  });
}

function applyReportedModeDifferencesToAst(
  styleSheet: CssTree.StyleSheet,
  modificationRecords: DeclarationModeModificationRecord[],
  config: ThemeConfig
) {
  applyHeaderReportedModeDifferencesToAst(styleSheet, modificationRecords, config);
  applyVariablesReportedModeDifferencesToAst(styleSheet, modificationRecords, config);
}

function applyReportedModeDifferences(transformData: TransformData, modificationRecords: DeclarationModeModificationRecord[]) {
  applyReportedModeDifferencesToAst(transformData.themeDark, modificationRecords, transformData.configDark);
  applyReportedModeDifferencesToAst(transformData.themeDense1, modificationRecords, transformData.configDense1);
  applyReportedModeDifferencesToAst(transformData.themeDense0, modificationRecords, transformData.configDense0);
  applyReportedModeDifferencesToAst(transformData.themeLight, modificationRecords, transformData.configLight);
}

function transformReportedModeDifferences(
  report: Enumerable.IEnumerable<CssChangeReportEntry<CssChangeReport>>,
  transformData: TransformData
) {
  const modeChanges = report.where((p) => isCssModeChangeReport(p.change)).cast<CssChangeReportEntry<CssModeChangeReport>>();

  const byValuePairs = modeChanges.groupBy(
    (c) => `${c.change.lightModeValue}|^|${c.change.lightModeValue}`,
    (c) => c,
    (key, g) => {
      return {
        key,
        source: g.first().source,
        records: g.toArray(),
      };
    }
  );

  const modificationRecords: DeclarationModeModificationRecord[] = byValuePairs
    .select((p, i) => ({
      index: i,
      source: p.source,
      variable: `--theme--generated-mode-ref--${p.source}--${Math.round(Math.random() * 10000)}-${i}-${Math.round(Math.random() * 10000)}`,
      lightModeValue: p.records[0].change.lightModeValue,
      darkModeValue: p.records[0].change.darkModeValue,
      locations: p.records.map((r) => ({
        source: r.source,
        selector: r.selector,
        property: r.property,
      })),
    }))
    .where((i) => i.darkModeValue != undefined && i.lightModeValue != undefined)
    .toArray();
  applyReportedModeDifferences(transformData, modificationRecords);
}

function transformReportedDensityDifferences(
  report: Enumerable.IEnumerable<CssChangeReportEntry<CssChangeReport>>,
  transformData: TransformData
) {
  const densityChanges = report.where((p) => isCssDensityChangeReport(p.change)).cast<CssChangeReportEntry<CssDensityChangeReport>>();

  //console.log('there are', densityChanges.count(), 'density differences in', densityChanges.firstOrDefault()?.source)
}

function transformReportedDifferences(transformData: TransformData) {
  if (!options.transform) return;
  if (!options.genMissingModeVars && !options.genMissingDensityVars) return;

  const report: CssRuleReport[] = generateReport(
    [
      styleSheetToProperties(transformData.configDark, transformData.themeDark),
      styleSheetToProperties(transformData.configDense1, transformData.themeDense1),
      styleSheetToProperties(transformData.configDense0, transformData.themeDense0),
      styleSheetToProperties(transformData.configLight, transformData.themeLight),
    ].flat()
  );

  const propChanges = Enumerable.from(report).selectMany((r) =>
    r.properties.map(
      (p) =>
        ({
          source: r.source,
          selector: r.selector,
          property: p.name,
          change: p.change,
        } as CssChangeReportEntry)
    )
  );

  if (options.genMissingModeVars) {
    transformReportedModeDifferences(propChanges, transformData);
  }
  if (options.genMissingDensityVars) {
    transformReportedDensityDifferences(propChanges, transformData);
  }
}

interface TransformData {
  configDark: ThemeConfig;
  configDense1: ThemeConfig;
  configDense0: ThemeConfig;
  configLight: ThemeConfig;
  themeDark: CssTree.StyleSheet;
  themeDense1: CssTree.StyleSheet;
  themeDense0: CssTree.StyleSheet;
  themeLight: CssTree.StyleSheet;
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

  const transformData: TransformData = {
    configDark,
    configDense1,
    configDense0,
    configLight,
    themeDark,
    themeDense1,
    themeDense0,
    themeLight,
  };

  if (options.transform) {
    applyTransformations(configDark, themeDark, TRANSFORMATIONS);
    applyTransformations(configDense1, themeDense1, TRANSFORMATIONS);
    applyTransformations(configDense0, themeDense0, TRANSFORMATIONS);
    applyTransformations(configLight, themeLight, TRANSFORMATIONS);
  }

  transformReportedDifferences(transformData);

  // report
  let report: CssRuleReport[] = generateReport(
    [
      styleSheetToProperties(configDark, themeDark),
      styleSheetToProperties(configDense1, themeDense1),
      styleSheetToProperties(configDense0, themeDense0),
      styleSheetToProperties(configLight, themeLight),
    ].flat()
  );

  const propChanges = Enumerable.from(report).selectMany((r) =>
    r.properties.map((p) => ({
      source: r.source,
      selector: r.selector,
      property: p.name,
      change: p.change,
    }))
  );

  const modeChanges = propChanges.where((p) => isCssModeChangeReport(p.change));
  const densityChanges = propChanges.where((p) => isCssDensityChangeReport(p.change));

  CssTree.walk(themeDark, function (n, i, l) {
    if (n.type === "Declaration") {
      const selector = CssTree.generate(this.rule.prelude).trim();
      const property = n.property;
      const c = modeChanges.firstOrDefault((c) => c.selector === selector && c.property === property);
      if (c && isCssModeChangeReport(c.change)) {
        const node = CssTree.parse(
          `
            ${c.property}: ${c.change.lightModeValue};
            @include util.dark-mode-only(){
              ${c.property}: ${c.change.darkModeValue};
            }
          `.trim(),
          { context: "rule" }
        );

        const item = l.createItem(node);
        l.replace(i, item);
      }
    }
  });

  return {
    css: serializeTheme(themeDark),
    report,
  };
}

function serializeTheme(theme: CssTree.StyleSheet) {
  const scss = `
    @mixin theme(){
      ${CssTree.generate(theme).trim()}
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
          if (options.reportDensity) {
            console.table({
              "density 0": p.change.values[0]?.trim(),
              "density -1": p.change.values["-1"]?.trim(),
              "density -2": p.change.values["-2"]?.trim(),
            });
          }
        } else if (isCssModeChangeReport(p.change)) {
          if (options.reportColorMode) {
            console.table({
              light: p.change.lightModeValue?.trim(),
              dark: p.change.darkModeValue?.trim(),
            });
          }
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
