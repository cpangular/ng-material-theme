import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
  selector: "lib-theme-vis",
  imports: [],
  templateUrl: "./theme-vis.component.html",
  styleUrl: "./theme-vis.component.scss",
})
export class ThemeVisComponent {
  protected readonly palettes = [
    "primary",
    "secondary",
    "tertiary",
    "error",
    "neutral",
    "neutral-variant",
  ];

  protected readonly shades = [
    0, 4, 5, 6, 10, 12, 17, 20, 22, 24, 25, 30, 35, 40, 50, 60, 70, 80, 87, 90,
    92, 94, 95, 96, 98, 99, 100,
  ];

  protected readonly colorPalettes = [
    "primary",
    "secondary",
    "tertiary",
    "error",
  ];

  protected readonly bgPalettes = {
    background: "neutral",
    "background-variant": "neutral-variant",
    surface: "neutral",
    "surface-variant": "neutral-variant",
  };
  protected readonly bgPaletteValues = {
    background: [
      [95, 10],
      [10, 90],
    ],
    "background-variant": [
      [80, 20],
      [20, 80],
    ],
    surface: [
      [99, 10],
      [20, 90],
    ],
    "surface-variant": [
      [90, 30],
      [30, 90],
    ],
  };

  protected readonly bgAliases = ["background", "surface"];

  public getBgPalette(key: string) {
    return this.bgPalettes[key as keyof typeof this.bgPalettes];
  }

  public getBgPaletteValue(key: string, isDark = false, isContrast = false) {
    const palette =
      this.bgPaletteValues[key as keyof typeof this.bgPaletteValues];
    return palette[isDark ? 1 : 0][isContrast ? 1 : 0];
  }
}
