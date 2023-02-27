import { compileNgMaterialCoreTemplate } from "./lib/util/compileNgMaterialCoreTemplate";
import { writeScssFile } from "./lib/util/writeScssFile";
import { options } from "./options";

export function writeMaterialCoreThemeFile() {
  if (!options.write) return;

  const compiled = compileNgMaterialCoreTemplate().css;
  const css = `
    @use "./theme-color";
    @use "./theme-mode";

    @mixin theme(){
      ${compiled};

      :root{
        @include theme-color.include(primary, #424242);
        @include theme-color.include(secondary, #606060);
        @include theme-color.include(error, #dd0d0d);
        
        @include theme-color.include(background, #fafafa);
        @include theme-color.include(surface, white);
      }
      
      @include theme-mode.dark-mode(){
        @include theme-color.include(primary, #606060);
        @include theme-color.include(secondary, #909090);
        @include theme-color.include(error, #bb0b0b);
        
        @include theme-color.include(background, #303030);
        @include theme-color.include(surface, #424242);

      }
    }
  `;
  writeScssFile("./dist/scss/_core.scss", css, false);
}
