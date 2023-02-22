import { colorKey } from "./colorKey";
import { primaryColors } from "../data/ColorSets";

export function makeRefColor(palette: string, name: string, colors: typeof primaryColors, contrast: boolean = false) {
  return {
    name: colorKey(palette, contrast ? "contrast" : undefined, name, true),
    light: colors.light[name + (contrast ? "-contrast" : "")],
    dark: colors.dark[name + (contrast ? "-contrast" : "")],
  };
}
