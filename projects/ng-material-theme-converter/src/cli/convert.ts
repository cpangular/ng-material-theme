import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { ComponentThemes } from "../lib/data/componentThemes";
import { ConvertOptions } from "../lib/options/ConvertOptions";
import { ThemeFile } from "../lib/ThemeFile";

const options: ConvertOptions = yargs(hideBin(process.argv))
  .option("component", {
    type: "string",
  })
  .option("write", {
    type: "boolean",
    default: false,
  })
  .option("cache", {
    type: "boolean",
    default: true,
  })
  .option("writeSnapshots", {
    type: "boolean",
    default: false,
  })
  // reports
  .option("report", {
    type: "boolean",
    default: true,
  })
  .option("reportColorMode", {
    type: "boolean",
    default: true,
  })
  .option("reportDensity", {
    type: "boolean",
    default: true,
  })
  // transforms
  .option("transformations", {
    type: "boolean",
    default: true,
  })
  .parseSync();

export async function runConvert() {
  ComponentThemes.filter((t) => !options.component || t === options.component).map((tf) => {
    const themeFile = new ThemeFile(tf, options);
    themeFile.convert();
    return themeFile;
  });

  // THEMES_FILES
  //   .filter((t) => !options.component || t === options.component)
  //   .map(t => new ThemeFile(t, options))
  //   .forEach((themeFile) => {
  //     themeFile.convert();
  //   });
}
