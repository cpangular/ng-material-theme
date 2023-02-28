import { compileString } from "sass";

export function compileNgMaterialCoreTemplate() {
  return compileString(
    `
    @use '@angular/material' as mat;
    @include mat.core();
  `,
    {
      loadPaths: ["./node_modules"],
    }
  );
}
