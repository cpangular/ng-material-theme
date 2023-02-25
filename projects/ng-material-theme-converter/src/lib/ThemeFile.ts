import chalk from "chalk";
import { existsSync, mkdirSync, readFileSync } from "fs";
import Enumerable from "linq";
import Path from "path";
import { ConvertOptions } from "./options/ConvertOptions";
import { applyColorModeColorSwaps } from "./transformations/general/applyColorModeColorSwaps";
import { applyMdcThemeTokensTransformations } from "./transformations/general/applyMdcThemeTokensTransformations";
import { applyThemeColorTransformations } from "./transformations/general/applyThemeColorTransformations";
import { applyThemePairedColorTransformations } from "./transformations/general/applyThemePairedColorTransformations";
import { TRANSFORMS } from "./transformations/TRANSFORMS";
import { CssColorModeDiffView } from "./types/CssColorModeDiffView";
import { CssDensityDiffView } from "./types/CssDensityDiffView";
import { CssDiffView } from "./types/CssDiffView";
import { CssPropertyRecord } from "./types/CssPropertyRecord";
import { ThemeConfig } from "./types/ThemeConfig";
import { ThemeFileDatabase } from "./types/ThemeFileDatabase";
import { ThemeFileSnapShot } from "./types/ThemeFileSnapShot";
import { ThemeFileUtil } from "./types/ThemeFileUtil";
import { ColorizedProperty } from "./util/ColorizedProperty";
import CssTree from "./util/CssTree";
import { loadThemeStyleSheet } from "./util/loadThemeStyleSheet";
import { writeScssFile } from "./util/writeScssFile";

export class ThemeFile implements ThemeFileUtil {
  private readonly _outDir = "./dist/scss/components";
  private readonly _snapshotsDir = "./dist/.snapshots";
  private readonly _cacheDir = "./dist/.cache";
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
    this.writeCache();
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
      this.applyAutoColorTransformations();
      this.applyAutoDensityTransformations();
    }
    this.writeSnapshots();
    this.writeOutput();

    this.logInfo(chalk.greenBright("Conversion completed."));
    this.logInfo();
  }

  public applyComponentTransformations() {
    if (!this.options.transformations) return;
    let count = 0;
    TRANSFORMS.forEach((transformFactory) => {
      const result = transformFactory(this);
      if (result?.length) {
        count += result.length;
        result.forEach((transform) => transform());
        this.logInfo(
          `${chalk.cyanBright(transformFactory.name)} applied ${chalk.yellow(result.length)} transformation` +
            (result.length === 1 ? "" : "s")
        );
        this.snapshot();
      }
    });
    if (count > 0) {
      this.logInfo(`Applied ${chalk.yellow(count)} component transformation` + (count === 1 ? "" : "s"));
    }
  }

  public applyTokenTransformations() {
    if (!this.options.transformations) return;

    const mdcThemeVarReferences = applyMdcThemeTokensTransformations(this);
    if (mdcThemeVarReferences.length) {
      mdcThemeVarReferences.forEach((transform) => transform());
      const num = mdcThemeVarReferences.length / 4;
      this.logInfo(`Replaced ${chalk.yellow(num)} MDC theme reference variable` + (num === 1 ? "" : "s"));
      this.snapshot();
    }
  }

  public applyAutoColorTransformations() {
    if (!this.options.transformations) return;

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
        /* spell-checker:ignore propert */
        `Replaced ${chalk.yellow(modifiedCount)} propert${modifiedCount === 1 ? "y" : "ies"} with dynamic mode variable` +
          (modifiedCount === 1 ? "" : "s")
      );
      this.snapshot();
    }
  }

  public applyAutoDensityTransformations() {
    if (!this.options.transformations) return;
    this.snapshot();
  }

  public prependRule(rule: CssTree.Rule): void {
    this.prependRuleTo(rule, this.currentSnapshot.styleSheetLight);
    this.prependRuleTo(rule, this.currentSnapshot.styleSheetDark);
    this.prependRuleTo(rule, this.currentSnapshot.styleSheetDense1);
    this.prependRuleTo(rule, this.currentSnapshot.styleSheetDense2);
  }

  private prependRuleTo(rule: CssTree.Rule, styleSheet: CssTree.StyleSheet): void {
    if (rule) {
      const item = styleSheet.children.createItem(rule);
      styleSheet.children.prepend(item);
    }
  }

  public appendRule(rule: CssTree.Rule): void {
    this.appendRuleTo(rule, this.currentSnapshot.styleSheetLight);
    this.appendRuleTo(rule, this.currentSnapshot.styleSheetDark);
    this.appendRuleTo(rule, this.currentSnapshot.styleSheetDense1);
    this.appendRuleTo(rule, this.currentSnapshot.styleSheetDense2);
  }

  private appendRuleTo(rule: CssTree.Rule, styleSheet: CssTree.StyleSheet): void {
    if (rule) {
      const item = styleSheet.children.createItem(rule);
      styleSheet.children.append(item);
    }
  }

  public get changed() {
    return this._changed;
  }

  public markChanged(): void {
    this._changed = true;
  }

  public get snapshotsDir() {
    return Path.join(this._snapshotsDir, this.name);
  }

  public get cacheDir() {
    return Path.join(this._cacheDir, this.name);
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
    const filePath = Path.join(this.cacheDir, `_${this.name}`);

    let result: ReturnType<typeof loadThemeStyleSheet>;
    if (this.options.cache) {
      let cachePath = "";
      if (config.darkMode === false && config.density === 0) {
        cachePath = `${filePath}.mode-light.css`;
      } else if (config.darkMode === true && config.density === 0) {
        cachePath = `${filePath}.mode-dark.css`;
      } else if (config.darkMode === false && config.density === -1) {
        cachePath = `${filePath}.density-1.css`;
      } else if (config.darkMode === false && config.density === -2) {
        cachePath = `${filePath}.density-2.css`;
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

  private writeCache() {
    const cacheDir = this.cacheDir;
    mkdirSync(cacheDir, { recursive: true });
    const baseFileName = Path.join(cacheDir, `_${this.name}`);
    writeScssFile(baseFileName + ".mode-light.css", this._themeData.light.source, false);
    writeScssFile(baseFileName + ".mode-dark.css", this._themeData.dark.source, false);
    writeScssFile(baseFileName + ".density-1.css", this._themeData.dense1.source, false);
    writeScssFile(baseFileName + ".density-2.css", this._themeData.dense2.source, false);
  }

  private writeSnapshots() {
    if (!this.options.writeSnapshots) return;

    const snapshotsDir = this.snapshotsDir;
    this.logInfo("Writing snapshots.");

    mkdirSync(snapshotsDir, { recursive: true });
    this._snapshots.forEach((snap, i) => {
      if (i === this._snapshots.length - 1 && !this.changed) return;

      const filename = Path.join(snapshotsDir, `_${this.name}`);

      const lightFileName = `${filename}.mode-light__${i}.scss`;
      const darkFileName = `${filename}.mode-dark__${i}.scss`;
      const density1FileName = `${filename}.density-1__${i}.scss`;
      const density2FileName = `${filename}.density-2__${i}.scss`;

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
