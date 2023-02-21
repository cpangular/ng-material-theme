import { compileString } from "sass";
import { ThemeTokens } from "../transforms/ThemeTokens";

const themeData = `
        $ref-primary: (
            50: ${ThemeTokens.primary[50]},
            100: ${ThemeTokens.primary[100]},
            200: ${ThemeTokens.primary[200]},
            300: ${ThemeTokens.primary[300]},
            400: ${ThemeTokens.primary[400]},
            500: ${ThemeTokens.primary[500]},
            600: ${ThemeTokens.primary[600]},
            700: ${ThemeTokens.primary[700]},
            800: ${ThemeTokens.primary[800]},
            900: ${ThemeTokens.primary[900]},
            A100: ${ThemeTokens.primary.A100},
            A200: ${ThemeTokens.primary.A200},
            A400: ${ThemeTokens.primary.A400},
            A700: ${ThemeTokens.primary.A700},
            contrast: (
                50: ${ThemeTokens.primary["50-contrast"]},
                100: ${ThemeTokens.primary["100-contrast"]},
                200: ${ThemeTokens.primary["200-contrast"]},
                300: ${ThemeTokens.primary["300-contrast"]},
                400: ${ThemeTokens.primary["400-contrast"]},
                500: ${ThemeTokens.primary["500-contrast"]},
                600: ${ThemeTokens.primary["600-contrast"]},
                700: ${ThemeTokens.primary["700-contrast"]},
                800: ${ThemeTokens.primary["800-contrast"]},
                900: ${ThemeTokens.primary["900-contrast"]},
                A100: ${ThemeTokens.primary["A100-contrast"]},
                A200: ${ThemeTokens.primary["A200-contrast"]},
                A400: ${ThemeTokens.primary["A400-contrast"]},
                A700: ${ThemeTokens.primary["A700-contrast"]},
            ),
            default: ${ThemeTokens.primary.default},
            default-contrast: ${ThemeTokens.primary["default-contrast"]},
            darker: ${ThemeTokens.primary.darker},
            darker-contrast: ${ThemeTokens.primary["darker-contrast"]},
            lighter: ${ThemeTokens.primary.lighter},
            lighter-contrast: ${ThemeTokens.primary["lighter-contrast"]},
            text: ${ThemeTokens.primary.text},
            "50-contrast": ${ThemeTokens.primary["50-contrast"]},
            "100-contrast": ${ThemeTokens.primary["100-contrast"]},
            "200-contrast": ${ThemeTokens.primary["200-contrast"]},
            "300-contrast": ${ThemeTokens.primary["300-contrast"]},
            "400-contrast": ${ThemeTokens.primary["400-contrast"]},
            "500-contrast": ${ThemeTokens.primary["500-contrast"]},
            "600-contrast": ${ThemeTokens.primary["600-contrast"]},
            "700-contrast": ${ThemeTokens.primary["700-contrast"]},
            "800-contrast": ${ThemeTokens.primary["800-contrast"]},
            "900-contrast": ${ThemeTokens.primary["900-contrast"]},
            "A100-contrast": ${ThemeTokens.primary["A100-contrast"]},
            "A200-contrast": ${ThemeTokens.primary["A200-contrast"]},
            "A400-contrast": ${ThemeTokens.primary["A400-contrast"]},
            "A700-contrast": ${ThemeTokens.primary["A700-contrast"]}
        );

        $ref-accent: (
            50: ${ThemeTokens.accent[50]},
            100: ${ThemeTokens.accent[100]},
            200: ${ThemeTokens.accent[200]},
            300: ${ThemeTokens.accent[300]},
            400: ${ThemeTokens.accent[400]},
            500: ${ThemeTokens.accent[500]},
            600: ${ThemeTokens.accent[600]},
            700: ${ThemeTokens.accent[700]},
            800: ${ThemeTokens.accent[800]},
            900: ${ThemeTokens.accent[900]},
            A100: ${ThemeTokens.accent.A100},
            A200: ${ThemeTokens.accent.A200},
            A400: ${ThemeTokens.accent.A400},
            A700: ${ThemeTokens.accent.A700},
            contrast: (
                50: ${ThemeTokens.accent["50-contrast"]},
                100: ${ThemeTokens.accent["100-contrast"]},
                200: ${ThemeTokens.accent["200-contrast"]},
                300: ${ThemeTokens.accent["300-contrast"]},
                400: ${ThemeTokens.accent["400-contrast"]},
                500: ${ThemeTokens.accent["500-contrast"]},
                600: ${ThemeTokens.accent["600-contrast"]},
                700: ${ThemeTokens.accent["700-contrast"]},
                800: ${ThemeTokens.accent["800-contrast"]},
                900: ${ThemeTokens.accent["900-contrast"]},
                A100: ${ThemeTokens.accent["A100-contrast"]},
                A200: ${ThemeTokens.accent["A200-contrast"]},
                A400: ${ThemeTokens.accent["A400-contrast"]},
                A700: ${ThemeTokens.accent["A700-contrast"]},
            ),
            default: ${ThemeTokens.accent.default},
            default-contrast: ${ThemeTokens.accent["default-contrast"]},
            darker: ${ThemeTokens.accent.darker},
            darker-contrast: ${ThemeTokens.accent["darker-contrast"]},
            lighter: ${ThemeTokens.accent.lighter},
            lighter-contrast: ${ThemeTokens.accent["lighter-contrast"]},
            text: ${ThemeTokens.accent.text},
            "50-contrast": ${ThemeTokens.accent["50-contrast"]},
            "100-contrast": ${ThemeTokens.accent["100-contrast"]},
            "200-contrast": ${ThemeTokens.accent["200-contrast"]},
            "300-contrast": ${ThemeTokens.accent["300-contrast"]},
            "400-contrast": ${ThemeTokens.accent["400-contrast"]},
            "500-contrast": ${ThemeTokens.accent["500-contrast"]},
            "600-contrast": ${ThemeTokens.accent["600-contrast"]},
            "700-contrast": ${ThemeTokens.accent["700-contrast"]},
            "800-contrast": ${ThemeTokens.accent["800-contrast"]},
            "900-contrast": ${ThemeTokens.accent["900-contrast"]},
            "A100-contrast": ${ThemeTokens.accent["A100-contrast"]},
            "A200-contrast": ${ThemeTokens.accent["A200-contrast"]},
            "A400-contrast": ${ThemeTokens.accent["A400-contrast"]},
            "A700-contrast": ${ThemeTokens.accent["A700-contrast"]}
        );

        $ref-warn: (
            50: ${ThemeTokens.warn[50]},
            100: ${ThemeTokens.warn[100]},
            200: ${ThemeTokens.warn[200]},
            300: ${ThemeTokens.warn[300]},
            400: ${ThemeTokens.warn[400]},
            500: ${ThemeTokens.warn[500]},
            600: ${ThemeTokens.warn[600]},
            700: ${ThemeTokens.warn[700]},
            800: ${ThemeTokens.warn[800]},
            900: ${ThemeTokens.warn[900]},
            A100: ${ThemeTokens.warn.A100},
            A200: ${ThemeTokens.warn.A200},
            A400: ${ThemeTokens.warn.A400},
            A700: ${ThemeTokens.warn.A700},
            contrast: (
                50: ${ThemeTokens.warn["50-contrast"]},
                100: ${ThemeTokens.warn["100-contrast"]},
                200: ${ThemeTokens.warn["200-contrast"]},
                300: ${ThemeTokens.warn["300-contrast"]},
                400: ${ThemeTokens.warn["400-contrast"]},
                500: ${ThemeTokens.warn["500-contrast"]},
                600: ${ThemeTokens.warn["600-contrast"]},
                700: ${ThemeTokens.warn["700-contrast"]},
                800: ${ThemeTokens.warn["800-contrast"]},
                900: ${ThemeTokens.warn["900-contrast"]},
                A100: ${ThemeTokens.warn["A100-contrast"]},
                A200: ${ThemeTokens.warn["A200-contrast"]},
                A400: ${ThemeTokens.warn["A400-contrast"]},
                A700: ${ThemeTokens.warn["A700-contrast"]},
            ),
            default: ${ThemeTokens.warn.default},
            default-contrast: ${ThemeTokens.warn["default-contrast"]},
            darker: ${ThemeTokens.warn.darker},
            darker-contrast: ${ThemeTokens.warn["darker-contrast"]},
            lighter: ${ThemeTokens.warn.lighter},
            lighter-contrast: ${ThemeTokens.warn["lighter-contrast"]},
            text: ${ThemeTokens.warn.text},
            "50-contrast": ${ThemeTokens.warn["50-contrast"]},
            "100-contrast": ${ThemeTokens.warn["100-contrast"]},
            "200-contrast": ${ThemeTokens.warn["200-contrast"]},
            "300-contrast": ${ThemeTokens.warn["300-contrast"]},
            "400-contrast": ${ThemeTokens.warn["400-contrast"]},
            "500-contrast": ${ThemeTokens.warn["500-contrast"]},
            "600-contrast": ${ThemeTokens.warn["600-contrast"]},
            "700-contrast": ${ThemeTokens.warn["700-contrast"]},
            "800-contrast": ${ThemeTokens.warn["800-contrast"]},
            "900-contrast": ${ThemeTokens.warn["900-contrast"]},
            "A100-contrast": ${ThemeTokens.warn["A100-contrast"]},
            "A200-contrast": ${ThemeTokens.warn["A200-contrast"]},
            "A400-contrast": ${ThemeTokens.warn["A400-contrast"]},
            "A700-contrast": ${ThemeTokens.warn["A700-contrast"]}
        );

        $ref-foreground: (
            base: ${ThemeTokens.foreground.base},
            divider: ${ThemeTokens.foreground.divider},
            dividers: ${ThemeTokens.foreground.divider},
            disabled: ${ThemeTokens.foreground.disabled},
            disabled-button: ${ThemeTokens.foreground["disabled-button"]},
            disabled-text: ${ThemeTokens.foreground["disabled-text"]},
            elevation: black,
            hint-text: ${ThemeTokens.foreground["hint-text"]},
            secondary-text: ${ThemeTokens.foreground["secondary-text"]},
            icon: ${ThemeTokens.foreground.icon},
            icons: ${ThemeTokens.foreground.icon},
            text: ${ThemeTokens.foreground.text},
            slider-min: ${ThemeTokens.foreground["slider-min"]},
            slider-off: ${ThemeTokens.foreground["slider-off"]},
            slider-off-active: ${ThemeTokens.foreground["slider-off-active"]},
          );

        $ref-foreground-inverted: (
            base: ${ThemeTokens.foreground_inverted.base},
            divider: ${ThemeTokens.foreground_inverted.divider},
            dividers: ${ThemeTokens.foreground_inverted.divider},
            disabled: ${ThemeTokens.foreground_inverted.disabled},
            disabled-button: ${ThemeTokens.foreground_inverted["disabled-button"]},
            disabled-text: ${ThemeTokens.foreground_inverted["disabled-text"]},
            elevation: black,
            hint-text: ${ThemeTokens.foreground_inverted["hint-text"]},
            secondary-text: ${ThemeTokens.foreground_inverted["secondary-text"]},
            icon: ${ThemeTokens.foreground_inverted.icon},
            icons: ${ThemeTokens.foreground_inverted.icon},
            text: ${ThemeTokens.foreground_inverted.text},
            slider-min: ${ThemeTokens.foreground_inverted["slider-min"]},
            slider-off: ${ThemeTokens.foreground_inverted["slider-off"]},
            slider-off-active: ${ThemeTokens.foreground_inverted["slider-off-active"]},
          );

          $ref-background: (
            status-bar: ${ThemeTokens.background["status-bar"]},
            app-bar: ${ThemeTokens.background["app-bar"]},
            background: ${ThemeTokens.background.background},
            hover: ${ThemeTokens.background.hover},
            card: ${ThemeTokens.background.card},
            dialog: ${ThemeTokens.background.dialog},
            disabled-button: ${ThemeTokens.background["disabled-button"]},
            raised-button: ${ThemeTokens.background["raised-button"]},
            focused-button: ${ThemeTokens.background["focused-button"]},
            selected-button: ${ThemeTokens.background["selected-button"]},
            selected-disabled-button: ${ThemeTokens.background["selected-disabled-button"]},
            disabled-button-toggle: ${ThemeTokens.background["disabled-button-toggle"]},
            unselected-chip: ${ThemeTokens.background["unselected-chip"]},
            disabled-list-option: ${ThemeTokens.background["disabled-list-option"]},
            tooltip: ${ThemeTokens.background.tooltip},
          );

          $ref-background-inverted: (
            status-bar: ${ThemeTokens.background_inverted["status-bar"]},
            app-bar: ${ThemeTokens.background_inverted["app-bar"]},
            background: ${ThemeTokens.background_inverted.background},
            hover: ${ThemeTokens.background_inverted.hover},
            card: ${ThemeTokens.background_inverted.card},
            dialog: ${ThemeTokens.background_inverted.dialog},
            disabled-button: ${ThemeTokens.background_inverted["disabled-button"]},
            raised-button: ${ThemeTokens.background_inverted["raised-button"]},
            focused-button: ${ThemeTokens.background_inverted["focused-button"]},
            selected-button: ${ThemeTokens.background_inverted["selected-button"]},
            selected-disabled-button: ${ThemeTokens.background_inverted["selected-disabled-button"]},
            disabled-button-toggle: ${ThemeTokens.background_inverted["disabled-button-toggle"]},
            unselected-chip: ${ThemeTokens.background_inverted["unselected-chip"]},
            disabled-list-option: ${ThemeTokens.background_inverted["disabled-list-option"]},
            tooltip: ${ThemeTokens.background_inverted.tooltip},
          );
    `;

export function compileNgMaterialTemplate(templateName: string, darkMode: boolean = false, density: number = 0) {
  return compileString(
    `
    @use '@angular/material' as mat;


    ${themeData}


    $darkMode: ${darkMode ? "true" : "false"};
    $density: ${Math.max(Math.min(density, 0), -2)};

    $primary: $ref-primary;
    $accent: $ref-accent;
    $warn: $ref-warn;

    $foreground: $ref-foreground;
    $background: $ref-background;

    @if not $darkMode {
      $primary: $ref-accent;
      $accent: $ref-warn;
      $warn: $ref-primary;
      $foreground: $ref-foreground-inverted;
      $background: $ref-background-inverted;
    }

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
      primary: $primary,
      accent: $accent,
      warn: $warn,
      is-dark: $darkMode,
      foreground: $foreground,
      background: $background,
    );

    @include mat.${templateName}-theme($theme);

  `,
    {
      loadPaths: ["./node_modules"],
    }
  );
}
