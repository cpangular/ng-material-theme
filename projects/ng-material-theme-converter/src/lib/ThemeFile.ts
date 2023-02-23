import chalk from "chalk";

import { existsSync, mkdirSync, readFileSync } from "fs";
import Enumerable from "linq";
import Path from "path";
import { ThemeConfig } from "../transforms/types/ThemeConfig";
import { loadThemeStyleSheet } from "../transforms/util/loadThemeStyleSheet";
import { ConvertOptions } from "./options/ConvertOptions";
import { applyColorModeColorSwaps } from "./transformations/general/applyColorModeColorSwaps";
import { applyMdcThemeTokensTransformations } from "./transformations/general/applyMdcThemeTokensTransformations";
import { applyThemeColorTransformations } from "./transformations/general/applyThemeColorTransformations";
import { applyThemePairedColorTransformations } from "./transformations/general/applyThemePairedColorTransformations";
import { CssColorModeDiffView } from "./types/CssColorModeDiffView";
import { CssDensityDiffView } from "./types/CssDensityDiffView";
import { CssDiffView } from "./types/CssDiffView";
import { CssPropertyRecord } from "./types/CssPropertyRecord";
import { ModeSwapView } from "./types/ModeSwapView";
import { ThemeFileDatabase } from "./types/ThemeFileDatabase";
import { ThemeFileSnapShot } from "./types/ThemeFileSnapShot";
import { ThemeFileUtil } from "./types/ThemeFileUtil";
import { ColorizedProperty } from "./util/ColorizedProperty";
import CssTree from "./util/CssTree";
import { writeScssFile } from "./util/writeScssFile";

export class ThemeFile implements ThemeFileUtil {
  private readonly _outDir = "./dist";
  private readonly _snapshotsDir = "./dist/snapshots";
  private readonly _configLight: ThemeConfig = { name: this.name, darkMode: false, density: 0 };
  private readonly _configDark: ThemeConfig = { name: this.name, darkMode: true, density: 0 };
  private readonly _configDense1: ThemeConfig = { name: this.name, darkMode: false, density: -1 };
  private readonly _configDense2: ThemeConfig = { name: this.name, darkMode: false, density: -2 };
  private _changed: boolean = true;

  private readonly _themeData = {
    light: this.loadThemeStyleSheetFromCache(this._configLight),
    dark: this.loadThemeStyleSheetFromCache(this._configDark),
    dense1: this.loadThemeStyleSheetFromCache(this._configDense1),
    dense2: this.loadThemeStyleSheetFromCache(this._configDense2),
  };

  private readonly _snapshots: ThemeFileSnapShot[] = [
    {
      styleSheetLight: this._themeData.light.styleSheet,
      styleSheetDark: this._themeData.dark.styleSheet,
      styleSheetDense1: this._themeData.dense1.styleSheet,
      styleSheetDense2: this._themeData.dense2.styleSheet,
    },
  ];

  private _db: Enumerable.IEnumerable<CssPropertyRecord>;

  public get database(): ThemeFileDatabase {
    return {
      cssProperties: this._db,
      differencesView: this.diffView,
      colorDifferencesView: this.colorDiffView,
      densityDifferencesView: this.densityDiffView,
    };
  }

  constructor(public readonly name: string, public readonly options: ConvertOptions) {
    this.logInfo("Loaded theme.");
    this.snapshot();
  }

  private get diffView() {
    return this._db?.groupBy(
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

  public convert() {
    if (this.options.transformations) {
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

    const mdcThemeVarReferences = applyMdcThemeTokensTransformations(this);
    if (mdcThemeVarReferences.length) {
      mdcThemeVarReferences.forEach((transform) => transform());
      const num = mdcThemeVarReferences.length / 4;
      this.logInfo(`Replaced ${chalk.yellow(num)} MDC theme reference variable` + (num === 1 ? "" : "s"));
      this.snapshot();
    }
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

    const transformableColorPairs = applyThemePairedColorTransformations(this);
    if (transformableColorPairs.length) {
      transformableColorPairs.forEach((transform) => transform());
      const num = transformableColorPairs.length;
      this.logInfo(`Replaced ${chalk.yellow(num)} material theme color pair` + (num === 1 ? "" : "s"));
      this.snapshot();
    }

    const transformableColors = applyThemeColorTransformations(this);
    if (transformableColors.length) {
      transformableColors.forEach((transform) => transform());
      const num = transformableColors.length;
      this.logInfo(`Replaced ${chalk.yellow(num)} material theme color` + (num === 1 ? "" : "s"));
      this.snapshot();
    }

    const colorModeColorSwaps = applyColorModeColorSwaps(this);
    if (colorModeColorSwaps.headers.length) {
      colorModeColorSwaps.headers.forEach((add) => add());
      colorModeColorSwaps.properties.forEach((transform) => transform());

      const generatedCount = colorModeColorSwaps.generatedCount;
      const modifiedCount = colorModeColorSwaps.modifiedCount;
      this.logInfo(`Generated ${chalk.yellow(generatedCount)} dynamic mode variables` + (generatedCount === 1 ? "" : "s"));
      this.logInfo(
        `Replaced ${chalk.yellow(modifiedCount)} propert${modifiedCount === 1 ? "y" : "ies"} with dynamic mode variable` +
          (modifiedCount === 1 ? "" : "s")
      );
      this.snapshot();
    }
  }

  public applyAutoDensityTransformations() {
    if (!this.options.autoDensityTransformations) return;
    this.snapshot();
  }

  public prependHeader(header: CssTree.Rule): void {
    this.prependHeaderTo(header, this.currentSnapshot.styleSheetLight);
    this.prependHeaderTo(header, this.currentSnapshot.styleSheetDark);
    this.prependHeaderTo(header, this.currentSnapshot.styleSheetDense1);
    this.prependHeaderTo(header, this.currentSnapshot.styleSheetDense2);
  }

  private prependHeaderTo(header: CssTree.Rule, styleSheet: CssTree.StyleSheet): void {
    if (header) {
      const item = styleSheet.children.createItem(header);
      styleSheet.children.prepend(item);
    }
  }

  public get changed() {
    return this._changed;
  }

  public markChanged(): void {
    this._changed = true;
  }

  private get snapshotsDir() {
    return Path.join(this._snapshotsDir, this.name);
  }

  private snapshot() {
    if (!this.changed) return;
    this._changed = false;
    if (this._snapshots.length > 1) {
      this.logInfo(chalk.gray("Style was modified. Created snapshot."));
    }
    const current = this.currentSnapshot;
    const newSnap: ThemeFileSnapShot = {
      styleSheetLight: CssTree.clone(current.styleSheetLight) as CssTree.StyleSheet,
      styleSheetDark: CssTree.clone(current.styleSheetDark) as CssTree.StyleSheet,
      styleSheetDense1: CssTree.clone(current.styleSheetDense1) as CssTree.StyleSheet,
      styleSheetDense2: CssTree.clone(current.styleSheetDense2) as CssTree.StyleSheet,
    };

    this._snapshots.push(newSnap);
    const db = this.buildDb(newSnap);
    this._db = Enumerable.from(db);
  }

  private get currentSnapshot() {
    return this._snapshots[this._snapshots.length - 1];
  }

  public logInfo(message?: any) {
    if (message === undefined) {
      console.info();
    } else {
      console.info(chalk.gray(`[${chalk.cyan(this.name)}]:`), message);
    }
  }

  private buildDb(snapshot: ThemeFileSnapShot) {
    const newDb: CssPropertyRecord[] = [];
    this.buildDbFor(newDb, snapshot.styleSheetLight, this._configLight);
    this.buildDbFor(newDb, snapshot.styleSheetDark, this._configDark);
    this.buildDbFor(newDb, snapshot.styleSheetDense1, this._configDense1);
    this.buildDbFor(newDb, snapshot.styleSheetDense2, this._configDense2);
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

  private loadThemeStyleSheetFromCache(config: ThemeConfig): ReturnType<typeof loadThemeStyleSheet> {
    const filePath = Path.join(this.snapshotsDir, `_${this.name}`);

    let result: ReturnType<typeof loadThemeStyleSheet>;
    if (this.options.cache) {
      let cachePath = "";
      if (config.darkMode === false && config.density === 0) {
        cachePath = `${filePath}.light_0.scss`;
      } else if (config.darkMode === true && config.density === 0) {
        cachePath = `${filePath}.dark_0.scss`;
      } else if (config.darkMode === false && config.density === -1) {
        cachePath = `${filePath}.density-1_0.scss`;
      } else if (config.darkMode === false && config.density === -2) {
        cachePath = `${filePath}.density-2_0.scss`;
      }
      if (cachePath && existsSync(cachePath)) {
        const source = readFileSync(cachePath, { encoding: "utf-8" });
        const styleSheet = CssTree.parse(source) as CssTree.StyleSheet;
        result = {
          source,
          styleSheet,
        };
      }
    }
    if (!result) {
      result = loadThemeStyleSheet(config);
    }
    return result;
  }

  private writeSnapshots() {
    // cache files
    const snapshotsDir = this.snapshotsDir;
    mkdirSync(snapshotsDir, { recursive: true });

    const baseFileName = Path.join(snapshotsDir, `_${this.name}`);
    writeScssFile(baseFileName + ".light_0.scss", this._themeData.light.source, false);
    writeScssFile(baseFileName + ".dark_0.scss", this._themeData.dark.source, false);
    writeScssFile(baseFileName + ".density-1_0.scss", this._themeData.dense1.source, false);
    writeScssFile(baseFileName + ".density-2_0.scss", this._themeData.dense2.source, false);

    if (!this.options.writeSnapshots) return;

    this.logInfo("Writing snapshots.");

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
  }

  private writeOutput() {
    if (!this.options.write) return;

    this.logInfo("Writing output.");
    const outputDir = this._outDir;
    mkdirSync(outputDir, { recursive: true });
    writeScssFile(Path.join(outputDir, `_${this.name}.scss`), this.serializeTheme(this.currentSnapshot.styleSheetLight));
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
