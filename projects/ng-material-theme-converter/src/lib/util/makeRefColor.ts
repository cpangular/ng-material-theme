import { colorCssPropertyName } from "./colorCssPropertyName";
import { primaryColors } from "../data/ColorSets";

export function makeRefColor(palette: string, name: string, colors: typeof primaryColors, contrast: boolean = false) {
  const value = contrast ? `${name}-contrast` : name;
  return {
    name: colorCssPropertyName(palette, "legacy", value, true),
    light: colors.light[name + (contrast ? "-contrast" : "")],
    dark: colors.dark[name + (contrast ? "-contrast" : "")],
  };
}
