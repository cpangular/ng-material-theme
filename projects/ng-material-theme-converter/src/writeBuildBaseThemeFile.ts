import { options } from "./options";
import { writeScssFile } from "./lib/util/writeScssFile";

export function writeBuildBaseThemeFile() {
  if (!options.write) return;

  const scss = `
    @use "../theming";
    @include theming.all-themes();
  `;

  writeScssFile("./dist/base/theme-all.scss", scss, false);
}
