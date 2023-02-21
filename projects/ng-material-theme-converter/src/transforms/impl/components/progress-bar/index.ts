import { VarPropertySetTransform } from "../../colors/ColorPaletteTransform";

function getBgData(palette: string) {
  return `url("data:image/svg+xml,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' enable-background='new 0 0 5 2' xml:space='preserve' viewBox='0 0 5 2' preserveAspectRatio='none slice'%3E%3Ccircle cx='1' cy='1' r='1' fill='var(--theme-color-${palette}-tint)'/%3E%3C/svg%3E")`;
}

export const PROGRESS_BAR_TRANSFORMS = [
  new VarPropertySetTransform(
    "background-image",
    getBgData("primary"),
    ".mat-mdc-progress-bar .mdc-linear-progress__buffer-dots",
    "color-primary-tint"
  ),
  new VarPropertySetTransform(
    "background-image",
    getBgData("secondary"),
    ".mat-mdc-progress-bar.mat-accent .mdc-linear-progress__buffer-dots",
    "color-secondary-tint"
  ),
  new VarPropertySetTransform(
    "background-image",
    getBgData("error"),
    ".mat-mdc-progress-bar.mat-warn .mdc-linear-progress__buffer-dots",
    "color-error-tint"
  ),
];
