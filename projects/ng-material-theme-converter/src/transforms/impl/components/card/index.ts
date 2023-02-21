import { VarPropertySetTransform } from "../../colors/ColorPaletteTransform";
import { AddMissingPropertyTransform } from "../../missing-props/AddMissingPropertyTransform";

export const CARD_TRANSFORMS = [new VarPropertySetTransform("--mdc-outlined-card-outline-color", "color-surface-contrast-low")];
