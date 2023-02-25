import { ComponentThemes } from "./lib/data/componentThemes";
import { ThemeFile } from "./lib/ThemeFile";
import { options } from "./options";
import { witeRegisteredVariablesReport } from "./witeRegisteredVariablesReport";
import { writeAllThemesFile } from "./writeAllThemesFile";
import { writeBuildBaseComponentFiles } from "./writeBuildBaseComponentFiles";
import { writeBuildBaseThemeFile } from "./writeBuildBaseThemeFile";
import { writeThemeIndexFile } from "./writeThemeIndexFile";

(async () => {
  const componentThemes = ComponentThemes.filter((t) => !options.component || t === options.component);

  componentThemes.forEach((t) => {
    const themeFile = new ThemeFile(t, options);
    themeFile.convert();
  });

  writeAllThemesFile();
  writeThemeIndexFile();
  writeBuildBaseThemeFile();
  writeBuildBaseComponentFiles();
  witeRegisteredVariablesReport();
})();
