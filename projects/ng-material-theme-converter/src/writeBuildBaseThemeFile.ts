import { options } from "./options";
import { writeScssFile } from "./lib/util/writeScssFile";

export function writeBuildBaseThemeFile() {
  if (!options.write) return;

  const scss = `
    @use "../../scss/theming/core";
    @use "../../scss/theming/components";

    @include core.theme();
    @include components.all-themes();
  `;

  writeScssFile("./dist/base/components/theme-all.scss", scss, false);
}
