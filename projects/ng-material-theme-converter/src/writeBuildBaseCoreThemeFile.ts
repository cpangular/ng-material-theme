import { options } from "./options";
import { writeScssFile } from "./lib/util/writeScssFile";

export function writeBuildBaseCoreThemeFile() {
  if (!options.write) return;

  const scss = `
    @use "../scss/theming/core";
    @include core.theme();
  `;

  writeScssFile("./dist/base/core.scss", scss, false);
}
