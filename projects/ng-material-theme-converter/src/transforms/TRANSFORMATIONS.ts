import {
  AddMissingPropertyTransform,
  AddMissingRuleTransform,
  ComponentBackgroundTransform,
  ComponentDensityTransform,
  ComponentForegroundTransform,
} from "./impl/component-colors";

export const TRANSFORMATIONS = [
  new AddMissingPropertyTransform(
    "button-theme",
    ".mat-mdc-button.mat-mdc-button-base,.mat-mdc-raised-button.mat-mdc-button-base,.mat-mdc-unelevated-button.mat-mdc-button-base,.mat-mdc-outlined-button.mat-mdc-button-base",
    "margin-top",
    "-inserted-"
  ),
  new AddMissingPropertyTransform(
    "button-theme",
    ".mat-mdc-button.mat-mdc-button-base,.mat-mdc-raised-button.mat-mdc-button-base,.mat-mdc-unelevated-button.mat-mdc-button-base,.mat-mdc-outlined-button.mat-mdc-button-base",
    "margin-bottom",
    "-inserted-"
  ),
  new AddMissingPropertyTransform(
    "button-theme",
    ".mat-mdc-button.mat-mdc-button-base .mdc-button__touch,.mat-mdc-raised-button.mat-mdc-button-base .mdc-button__touch,.mat-mdc-unelevated-button.mat-mdc-button-base .mdc-button__touch,.mat-mdc-outlined-button.mat-mdc-button-base .mdc-button__touch",
    "height",
    "-inserted-"
  ),
  new AddMissingPropertyTransform(
    "button-theme",
    ".mat-mdc-button.mat-mdc-button-base .mat-mdc-button-touch-target,.mat-mdc-raised-button.mat-mdc-button-base .mat-mdc-button-touch-target,.mat-mdc-unelevated-button.mat-mdc-button-base .mat-mdc-button-touch-target,.mat-mdc-outlined-button.mat-mdc-button-base .mat-mdc-button-touch-target",
    "display",
    "-inserted-"
  ),
  new ComponentBackgroundTransform(),
  new ComponentForegroundTransform(),
  //new ComponentDensityTransform(),
];
