import chalk from "chalk";
import { ColorTranslator } from "colortranslator";

import { mkdirSync } from "fs";
import Enumerable from "linq";
import Path from "path";
import { ThemeVarsRegistry } from "../transforms/ThemeVarsRegistry";
import { ThemeConfig } from "../transforms/types/ThemeConfig";
import { loadThemeStyleSheet } from "../transforms/util/loadThemeStyleSheet";
import { ColorLookup } from "./data/ColorLookup";
import { ConvertOptions } from "./options/ConvertOptions";
import { CssColorModeDiffVariable } from "./types/CssColorModeDiffVariable";
import { CssColorModeDiffView } from "./types/CssColorModeDiffView";
import { CssDensityDiffView } from "./types/CssDensityDiffView";
import { CssDiffView } from "./types/CssDiffView";
import { CssPropertyRecord } from "./types/CssPropertyRecord";
import { ThemeFileSnapShot } from "./types/ThemeFileSnapShot";
import { ColorizedProperty } from "./util/ColorizedProperty";
import { colorKey } from "./util/colorKey";
import CssTree from "./util/CssTree";
import { writeScssFile } from "./util/writeScssFile";

const MDCThemeTokenSubstitutions = {
  primary: colorKey("primary"),
  "text-primary-on-background": colorKey("primary", undefined, "contrast"),
  secondary: colorKey("secondary"),
  "text-secondary-on-background": colorKey("secondary", undefined, "contrast"),
  error: colorKey("error"),
  "text-error-on-background": colorKey("error", undefined, "contrast"),

  surface: colorKey("surface"),
  "on-surface": colorKey("surface", undefined, "contrast"),

  "text-icon-on-background": colorKey("background", undefined, "contrast"),
  "text-hint-on-background": colorKey("background", undefined, "contrast-lower"),
};

export class ThemeFile {
  public readonly _snapshotsDir = "./dist/snapshots";
  public get snapshotsDir() {
    return Path.join(this._snapshotsDir, this.name);
  }
  public readonly outDir = "./dist";

  private readonly configLight: ThemeConfig = { name: this.name, darkMode: false, density: 0 };
  private readonly configDark: ThemeConfig = { name: this.name, darkMode: true, density: 0 };
  private readonly configDense1: ThemeConfig = { name: this.name, darkMode: false, density: -1 };
  private readonly configDense2: ThemeConfig = { name: this.name, darkMode: false, density: -2 };

  private readonly _themeData = {
    light: loadThemeStyleSheet(this.configLight),
    dark: loadThemeStyleSheet(this.configDark),
    dense1: loadThemeStyleSheet(this.configDense1),
    dense2: loadThemeStyleSheet(this.configDense2),
  };

  private readonly _snapshots: ThemeFileSnapShot[] = [
    {
      styleSheetLight: this._themeData.light.styleSheet,
      styleSheetDark: this._themeData.dark.styleSheet,
      styleSheetDense1: this._themeData.dense1.styleSheet,
      styleSheetDense2: this._themeData.dense2.styleSheet,
    },
  ];

  private readonly _snapshotDbs: CssPropertyRecord[][] = [];
  private db: Enumerable.IEnumerable<CssPropertyRecord>;

  private get diffView() {
    return this.db?.groupBy(
      (r) => `${r.sourceFile}|${r.selectors.join(",")}|${r.name}`,
      (r) => r,
      (k, group) => {
        const first = group.first();

        const lightMode = group.firstOrDefault((i) => !i.darkMode && i.density === 0);
        const darkMode = group.firstOrDefault((i) => i.darkMode && i.density === 0);
        const density0 = group.firstOrDefault((i) => !i.darkMode && i.density === 0);
        const density1 = group.firstOrDefault((i) => !i.darkMode && i.density === -1);
        const density2 = group.firstOrDefault((i) => !i.darkMode && i.density === -2);

        const view: CssDiffView = {
          sourceFile: first.sourceFile,
          selectors: first.selectors,
          name: first.name,
          lightMode,
          darkMode,
          density0,
          density1,
          density2,
        };

        return view;
      }
    );
  }

  private get colorDiffView() {
    return this.diffView?.where((r) => r.lightMode?.value !== r.darkMode?.value).cast<CssColorModeDiffView>();
  }

  private get densityDiffView() {
    return this.diffView
      ?.where((r) => r.density0?.value !== r.density1?.value || r.density0?.value !== r.density2?.value)
      .cast<CssDensityDiffView>();
  }

  constructor(public readonly name: string, public readonly options: ConvertOptions) {
    this.logInfo("Loaded theme.");
    this.snapshot();
  }

  private get currentSnapshot() {
    return this._snapshots[this._snapshots.length - 1];
  }

  private logInfo(message?: any) {
    if (message === undefined) {
      console.info();
    } else {
      console.info(chalk.gray(`[${chalk.cyan(this.name)}]:`), message);
    }
  }

  private snapshot() {
    this.logInfo("Creating new snapshot...");
    const current = this.currentSnapshot;
    const newSnap: ThemeFileSnapShot = {
      styleSheetLight: CssTree.clone(current.styleSheetLight) as CssTree.StyleSheet,
      styleSheetDark: CssTree.clone(current.styleSheetDark) as CssTree.StyleSheet,
      styleSheetDense1: CssTree.clone(current.styleSheetDense1) as CssTree.StyleSheet,
      styleSheetDense2: CssTree.clone(current.styleSheetDense2) as CssTree.StyleSheet,
    };

    this._snapshots.push(newSnap);
    const db = this.buildDb(newSnap);
    this._snapshotDbs.push(db);
    this.db = Enumerable.from(db);
    this.logInfo("Created snapshot.");
  }

  private buildDb(snapshot: ThemeFileSnapShot) {
    const newDb: CssPropertyRecord[] = [];
    this.buildDbFor(newDb, snapshot.styleSheetLight, this.configLight);
    this.buildDbFor(newDb, snapshot.styleSheetDark, this.configDark);
    this.buildDbFor(newDb, snapshot.styleSheetDense1, this.configDense1);
    this.buildDbFor(newDb, snapshot.styleSheetDense2, this.configDense2);
    return newDb;
  }

  private buildDbFor(db: CssPropertyRecord[], styleSheet: CssTree.StyleSheet, config: ThemeConfig) {
    CssTree.walk(styleSheet, function (node) {
      if (node.type === "Declaration" && this.rule.prelude.type === "SelectorList") {
        const record: CssPropertyRecord = {
          node,
          sourceFile: config.name,
          density: config.density,
          darkMode: config.darkMode,
          selectors: this.rule.prelude.children.map((s) => CssTree.generate(s).trim()).toArray(),
          name: node.property,
          value: CssTree.generate(node.value).trim(),
          important: !!node.important,
          valueColors: new ColorizedProperty(node.property, node.value),
        };
        db.push(record);
      }
    });
  }

  public convert() {
    if (this.options.transformations) {
      this.logInfo("Starting conversion...");
      this.applyComponentTransformations();
      this.applyTokenTransformations();
      this.applyColorTransformations();
      this.applyDensityTransformations();
      this.applyAutoColorTransformations();
      this.applyAutoDensityTransformations();
    }
    this.writeSnapshots();
    this.writeOutput();

    this.logInfo(chalk.greenBright("Conversion completed."));
    this.logInfo();
  }

  public applyComponentTransformations() {
    if (!this.options.componentTransformations) return;

    this.snapshot();
  }
  public applyTokenTransformations() {
    if (!this.options.tokenTransformations) return;

    const mdcThemeVarReferences = this.db
      .where((r) => r.value.startsWith("var(--mdc-theme-"))
      .select((record) => {
        const m = record.value.match(/^var\(--mdc-theme-(.*?),\s*(.*?)\)$/);
        const variable = m[1];
        const replacement = MDCThemeTokenSubstitutions[variable];
        if (replacement) {
          return {
            record,
            variable,
            replacement,
          };
        } else {
          console.log(variable);
        }
      })
      .where((r) => !!r)
      .forEach((r) => {
        const value = `var(${ThemeVarsRegistry.register(this.name, r.replacement)})`;
        r.record.node.value = CssTree.parse(value, { context: "value" }) as CssTree.Value;
      });

    this.snapshot();
  }

  public applyColorTransformations() {
    if (!this.options.colorTransformations) return;

    this.snapshot();
  }

  public applyDensityTransformations() {
    if (!this.options.densityTransformations) return;

    this.snapshot();
  }

  public applyAutoColorTransformations() {
    if (!this.options.autoColorTransformations) return;

    const transformableColors = this.colorDiffView
      .where((v) => v.darkMode?.value !== undefined && v.lightMode?.value !== undefined)
      .selectMany((v) =>
        v.lightMode.valueColors.colors
          .map((c, i) => {
            const diff = v as CssDiffView;
            const lightColor = c;
            const darkColor = diff.darkMode.valueColors.colors[i];
            const density1Color = diff.density1.valueColors.colors[i];
            const density2Color = diff.density2.valueColors.colors[i];

            const match = ColorLookup.find(
              (l) => new ColorTranslator(l.light).HEXA === lightColor.HEXA && new ColorTranslator(l.dark).HEXA === darkColor.HEXA
            );
            if (match) {
              return {
                diff: v as CssDiffView,
                match,
                replace: (val: string) => {
                  diff.lightMode.valueColors.replaceColor(lightColor, val);
                  diff.darkMode.valueColors.replaceColor(darkColor, val);
                  diff.density1.valueColors.replaceColor(density1Color, val);
                  diff.density2.valueColors.replaceColor(density2Color, val);

                  diff.lightMode.node.value = CssTree.parse(diff.lightMode.valueColors.toString(), { context: "value" }) as CssTree.Value;
                  diff.darkMode.node.value = CssTree.parse(diff.darkMode.valueColors.toString(), { context: "value" }) as CssTree.Value;
                  diff.density1.node.value = CssTree.parse(diff.density1.valueColors.toString(), { context: "value" }) as CssTree.Value;
                  diff.density2.node.value = CssTree.parse(diff.density2.valueColors.toString(), { context: "value" }) as CssTree.Value;
                },
              };
            }
          })
          .filter((v) => !!v)
      );

    transformableColors.forEach((v) => {
      const value = `var(${ThemeVarsRegistry.register(v.diff.sourceFile, v.match.name)})`;
      v.replace(value);
    });

    this.snapshot();

    this.colorDiffView
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
      .forEach((v) => {
        const replacementColor = ColorLookup.map((c) => ({
          name: c.name,
          color: new ColorTranslator(v.darkMode ? c.dark : c.light),
        })).find((c) => v.color.HEXA === c.color.HEXA);
        if (replacementColor) {
          const value = `var(${ThemeVarsRegistry.register(this.name, replacementColor.name)})`;
          v.node.value = CssTree.parse(value, { context: "value" }) as CssTree.Value;
        }
      });

    this.snapshot();

    const diffs = this.colorDiffView
      .where((v) => v.darkMode?.value !== undefined && v.lightMode?.value !== undefined)
      .select(
        (v, i) =>
          ({
            ...v,
            variable: `--theme--generated-mode-ref--${v.sourceFile}--${Math.round(Math.random() * 10000)}-${i}-${Math.round(
              Math.random() * 10000
            )}`,
          } as CssColorModeDiffVariable)
      )
      .toArray();

    let headers: CssTree.CssNode[] = [];

    if (diffs.length) {
      const lightModeVars = diffs.map((r) => `${r.variable}: ${r.lightMode.value};`);
      const darkModeModeVars = diffs.map((r) => `${r.variable}: ${r.darkMode.value};`);

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
      headers = [lightNode, darkNode];
    }

    this.applyAutoColorTransformationsToAst(this.currentSnapshot.styleSheetLight, diffs, headers);
    this.applyAutoColorTransformationsToAst(this.currentSnapshot.styleSheetDark, diffs, headers);
    this.applyAutoColorTransformationsToAst(this.currentSnapshot.styleSheetDense1, diffs, headers);
    this.applyAutoColorTransformationsToAst(this.currentSnapshot.styleSheetDense2, diffs, headers);

    this.snapshot();
  }

  private applyAutoColorTransformationsToAst(styleSheet: CssTree.StyleSheet, vars: CssColorModeDiffVariable[], headers: CssTree.CssNode[]) {
    for (var i = headers.length - 1; i >= 0; i--) {
      if (headers[i]) {
        const item = styleSheet.children.createItem(headers[i]);
        styleSheet.children.prepend(item);
      }
    }
    CssTree.walk(styleSheet, function (n, i, l) {
      if (n.type === "Declaration") {
        const selector = CssTree.generate(this.rule.prelude).trim();
        const diff = vars.find((d) => d.name === n.property && d.selectors.join(",") === selector);
        if (diff) {
          const replacementValue = `var(${diff.variable})`;
          n.value = CssTree.parse(replacementValue, { context: "value" }) as CssTree.Value;
        }
      }
    });
  }

  public applyAutoDensityTransformations() {
    if (!this.options.autoDensityTransformations) return;

    this.snapshot();
  }

  private writeSnapshots() {
    this.logInfo("Writing snapshots...");
    const snapshotsDir = this.snapshotsDir;
    mkdirSync(snapshotsDir, { recursive: true });

    const baseFileName = Path.join(snapshotsDir, `_${this.name}`);
    writeScssFile(baseFileName + ".light_0.scss", this._themeData.light.source, false);
    writeScssFile(baseFileName + ".dark_0.scss", this._themeData.light.source, false);
    writeScssFile(baseFileName + ".density-1_0.scss", this._themeData.light.source, false);
    writeScssFile(baseFileName + ".density-2_0.scss", this._themeData.light.source, false);

    this._snapshots.forEach((snap, i) => {
      const filename = Path.join(snapshotsDir, `_${this.name}`);

      const lightFileName = `${filename}.light_${i + 1}.scss`;
      const darkFileName = `${filename}.dark_${i + 1}.scss`;
      const density1FileName = `${filename}.density-1_${i + 1}.scss`;
      const density2FileName = `${filename}.density-2_${i + 1}.scss`;

      writeScssFile(lightFileName, this.serializeTheme(snap.styleSheetLight));
      writeScssFile(darkFileName, this.serializeTheme(snap.styleSheetDark));
      writeScssFile(density1FileName, this.serializeTheme(snap.styleSheetDense1));
      writeScssFile(density2FileName, this.serializeTheme(snap.styleSheetDense2));
    });
    this.logInfo("Writing snapshots complete.");
  }

  private writeOutput() {
    this.logInfo("Writing output...");
    const outputDir = this.outDir;
    mkdirSync(outputDir, { recursive: true });
    writeScssFile(Path.join(outputDir, `_${this.name}.scss`), this.serializeTheme(this.currentSnapshot.styleSheetLight));
    this.logInfo("Writing output complete.");
  }

  private serializeTheme(theme: CssTree.StyleSheet) {
    const scss = `
      @mixin theme(){
        ${CssTree.generate(theme).trim()}
      }
    `;
    return scss;
  }
}
