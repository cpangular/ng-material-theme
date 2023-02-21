import { VarPropertySetTransform } from "../../colors/ColorPaletteTransform";
import { AddMissingPropertyTransform } from "../../missing-props/AddMissingPropertyTransform";

export const CHIPS_TRANSFORMS = [
  new VarPropertySetTransform("--mdc-chip-elevated-container-color", "color-elevated"),
  new VarPropertySetTransform("--mdc-chip-elevated-disabled-container-color", "color-elevated"),
  new VarPropertySetTransform("--mdc-chip-label-text-color", "color-elevated-contrast"),
  new VarPropertySetTransform("--mdc-chip-disabled-label-text-color", "color-elevated-contrast"),
  new VarPropertySetTransform("--mdc-chip-with-icon-icon-color", "color-elevated-contrast"),
  new VarPropertySetTransform("--mdc-chip-with-icon-disabled-icon-color", "color-elevated-contrast"),
  new VarPropertySetTransform("--mdc-chip-with-trailing-icon-disabled-trailing-icon-color", "color-elevated-contrast"),
  new VarPropertySetTransform("--mdc-chip-with-trailing-icon-trailing-icon-color", "color-elevated-contrast"),
  new VarPropertySetTransform("--mdc-chip-with-icon-selected-icon-color", "color-elevated-contrast"),
];
