import { VarPropertySetTransform } from "../../colors/ColorPaletteTransform";
import { AddMissingPropertyTransform } from "../../missing-props/AddMissingPropertyTransform";
import { ReplaceRuleTransform } from "../../missing-props/AddMissingRuleTransform";

export const FORM_FIELD_TRANSFORMS = [
  new AddMissingPropertyTransform(
    "form-field",
    "select.mat-mdc-form-field-input-control:not(.mat-mdc-native-select-inline) option",
    "color",
    "-inserted-"
  ),
  new AddMissingPropertyTransform(
    "form-field",
    "select.mat-mdc-form-field-input-control:not(.mat-mdc-native-select-inline) option:disabled",
    "color",
    "-inserted-"
  ),
  new VarPropertySetTransform("background-color", "color-overlay-low", ".mdc-text-field--filled:not(.mdc-text-field--disabled)"),
  new VarPropertySetTransform("background-color", "color-container", ".mdc-text-field--filled:not(.mdc-text-field--disabled)"),
  new VarPropertySetTransform("background-color", "color-overlay-low", ".mdc-text-field--disabled.mdc-text-field--filled"),
  new ReplaceRuleTransform(
    "form-field",
    "select.mat-mdc-form-field-input-control:not(.mat-mdc-native-select-inline) option",
    `@include util.dark-mode-only(){
      select.mat-mdc-form-field-input-control:not(.mat-mdc-native-select-inline) option {
        color: rgba(0, 0, 0, 0.87);
      }
    }`
  ),
  new ReplaceRuleTransform(
    "form-field",
    "select.mat-mdc-form-field-input-control:not(.mat-mdc-native-select-inline) option:disabled",
    `@include util.dark-mode-only(){
      select.mat-mdc-form-field-input-control:not(.mat-mdc-native-select-inline) option:disabled {
        color: rgba(0, 0, 0, 0.38);
      }
    }`
  ),
];
