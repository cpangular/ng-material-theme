import { ComponentThemes } from "./lib/data/componentThemes";
import { writeScssFile } from "./lib/util/writeScssFile";
import { options } from "./options";

export function writeAllThemesFile() {
  if (!options.write) return;

  const use = ComponentThemes.map((t) => `@use './${t}';`);
  const include = ComponentThemes.map((t) => `@include ${t}.theme();`);
  const allThemesCss = `
    ${use.join("\n")}
    @mixin all-themes(){
      ${include.join("\n")}
    }
  `;
  writeScssFile("./dist/scss/_all-themes.scss", allThemesCss, false);
}
