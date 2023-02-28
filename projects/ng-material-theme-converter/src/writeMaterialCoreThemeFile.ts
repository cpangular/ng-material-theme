import { compileNgMaterialCoreTemplate } from "./lib/util/compileNgMaterialCoreTemplate";
import { writeScssFile } from "./lib/util/writeScssFile";
import { options } from "./options";

export function writeMaterialCoreThemeFile() {
  if (!options.write) return;

  const compiled = compileNgMaterialCoreTemplate().css;
  const css = `
    @use "./theme/theme";

    @mixin include(){
      ${compiled};

      @include theme.include-root((
        id: base-theme,
        palette: (
          primary: #4D4D4D,
          secondary: #D5D5D5,
          error: (#e00000, #f74040),
          surface: (white, #424242),
          background: (#fafafa, #303030),
        )
      ));
    }
  `;
  writeScssFile("./dist/scss/_core.scss", css, false);
}
