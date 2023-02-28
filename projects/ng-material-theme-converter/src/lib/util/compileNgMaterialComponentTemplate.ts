import { compileString } from "sass";
import { NgMaterialThemeGenerationData } from "../data/NgMaterialThemeGenerationData";

export function compileNgMaterialComponentTemplate(templateName: string, darkMode: boolean = false, density: number = 0) {
  return compileString(
    `
    @use '@angular/material' as mat;

    ${NgMaterialThemeGenerationData}

    $simpleMode: true;

    $darkMode: ${darkMode ? "true" : "false"};
    $density: ${Math.max(Math.min(density, 0), -2)};

    $primary: $ref-primary;
    $accent: $ref-accent;
    $warn: $ref-warn;

    $foreground: $ref-foreground;
    $background: $ref-background;

    @if $darkMode {
      $primary: $ref-accent;
      $accent: $ref-warn;
      $warn: $ref-primary;
      $foreground: $ref-foreground-inverted;
      $background: $ref-background-inverted;
    }

    $theme: null;
    @if $simpleMode{
      $themeSimple: (
        color: (
          primary: $primary,
          accent: $accent,
          warn: $warn
        ),
        density: $density,
        typography: mat.define-typography-config(),
      );

      @if $darkMode {
        $theme: mat.define-dark-theme($themeSimple);
      } @else {
        $theme: mat.define-light-theme($themeSimple);
      }

    } @else {
      $theme: (
        color: (
          primary: $primary,
          accent: $accent,
          warn: $warn,
          is-dark: $darkMode,
           foreground: $foreground,
           background: $background,
        ),
        density: $density,
        typography: mat.define-typography-config(),
        primary: $primary,
        accent: $accent,
        warn: $warn,
        is-dark: $darkMode,
         foreground: $foreground,
         background: $background,
      );
    }

    @include mat.${templateName}-theme($theme);
  `,
    {
      loadPaths: ["./node_modules"],
    }
  );
}
