import { ConvertOptions } from "../lib/options/ConvertOptions";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { loadThemeStyleSheet } from "../transforms/util/loadThemeStyleSheet";
import { ThemeFile } from "../lib/ThemeFile";
import { ColorLookup } from "../lib/data/ColorLookup";

const options: ConvertOptions = yargs(hideBin(process.argv))
  .option("component", {
    type: "string",
  })
  .option("write", {
    type: "boolean",
    default: true,
  })
  .option("writeSnapshots", {
    type: "boolean",
    default: false,
  })
  .option("transformations", {
    type: "boolean",
    default: true,
  })
  .option("componentTransformations", {
    type: "boolean",
    default: true,
  })
  .option("colorTransformations", {
    type: "boolean",
    default: true,
  })
  .option("tokenTransformations", {
    type: "boolean",
    default: true,
  })
  .option("densityTransformations", {
    type: "boolean",
    default: true,
  })
  .option("autoColorTransformations", {
    type: "boolean",
    default: true,
  })
  .option("autoDensityTransformations", {
    type: "boolean",
    default: true,
  })
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
  .parseSync();

const THEMES_FILES = [
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

export async function runConvert() {
  THEMES_FILES.filter((t) => !options.component || t === options.component).map((tf) => {
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
