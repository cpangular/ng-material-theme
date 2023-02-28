import { options } from "./options";
import { writeScssFile } from "./lib/util/writeScssFile";

export function writeBuildBaseCoreThemeFile() {
  if (!options.write) return;

  const scss = `
    @use "../scss/theming/core";
    @include core.include();
  `;

  writeScssFile("./dist/base/core.scss", scss, false);
}
