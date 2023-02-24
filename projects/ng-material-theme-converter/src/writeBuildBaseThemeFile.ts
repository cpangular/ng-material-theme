import { options } from "./convert";
import { writeScssFile } from "./lib/util/writeScssFile";

export function writeBuildBaseThemeFile() {
  if (!options.write) return;

  const scss = `
    @use '../scss/theme';
    @include theme.all-themes();
  `;

  writeScssFile("./dist/base/theme-all.scss", scss, false);
}
