import { ComponentThemes } from "./lib/data/componentThemes";
import { writeScssFile } from "./lib/util/writeScssFile";
import { options } from "./options";

export function writeThemeIndexFile() {
  if (!options.write) return;

  const forward = ComponentThemes.map((t) => `@forward './${t}' as ${t}-*;`);
  forward.push(`@forward './all-themes';`);
  const indexCss = forward.join("\n");
  writeScssFile("./dist/scss/components/_index.scss", indexCss, false);
}
