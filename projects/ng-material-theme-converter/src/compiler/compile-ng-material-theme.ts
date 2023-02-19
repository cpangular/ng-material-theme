import { compileString } from "sass";

export function compileNgMaterialTemplate(templateName: string, darkMode: boolean = false, density: number = 0) {
  return compileString(
    `
    @use '@angular/material' as mat;
    @use "../dist/scss/theme-data" as theme;


    $darkMode: ${darkMode ? "true" : "false"};
    $density: ${Math.max(Math.min(density, 0), -2)};

    $theme: (
      color: (
        primary: theme.$primary-palette,
        accent: theme.$accent-palette,
        warn: theme.$warn-palette,
        is-dark: $darkMode,
        foreground: theme.$foreground,
        background: theme.$background,
      ),
      density: $density,
      primary: theme.$primary-palette,
      accent: theme.$accent-palette,
      warn: theme.$warn-palette,
      is-dark: $darkMode,
      foreground: theme.$foreground,
      background: theme.$background,
    );



    @include mat.${templateName}($theme);

  `,
    {
      loadPaths: ["./node_modules"],
    }
  );
}
