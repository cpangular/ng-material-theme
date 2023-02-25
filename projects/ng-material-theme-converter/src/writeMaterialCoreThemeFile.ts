import { compileNgMaterialCoreTemplate } from "./lib/util/compileNgMaterialCoreTemplate";
import { writeScssFile } from "./lib/util/writeScssFile";
import { options } from "./options";

export function writeMaterialCoreThemeFile() {
  if (!options.write) return;

  const compiled = compileNgMaterialCoreTemplate().css;
  const css = `@mixin theme(){
    ${compiled};
  }`;
  writeScssFile("./dist/scss/_core.scss", css, false);
}
