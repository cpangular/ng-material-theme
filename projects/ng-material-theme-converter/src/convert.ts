import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { ComponentThemes } from "./lib/data/componentThemes";
import { ConvertOptions } from "./lib/options/ConvertOptions";
import { ThemeFile } from "./lib/ThemeFile";
import { writeAllThemesFile } from "./writeAllThemesFile";
import { writeThemeIndexFile } from "./writeThemeIndexFile";

export const options: ConvertOptions = yargs(hideBin(process.argv))
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

(async () => {
  const componentThemes = ComponentThemes.filter((t) => !options.component || t === options.component);

  componentThemes.forEach((t) => {
    const themeFile = new ThemeFile(t, options);
    themeFile.convert();
  });

  writeAllThemesFile();
  writeThemeIndexFile();
})();
