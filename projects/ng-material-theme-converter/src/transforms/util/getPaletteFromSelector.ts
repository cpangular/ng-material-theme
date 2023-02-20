export function getPaletteFromSelector(selector: string) {
  if (selector.includes(".mat-primary")) {
    return "primary";
  }
  if (selector.includes(".mat-accent") || selector.includes(".mat-secondary")) {
    return "secondary";
  }
  if (selector.includes(".mat-warn") || selector.includes(".mat-error")) {
    return "error";
  }
  if (selector.includes("[disabled]")) {
    return "disabled";
  }
  return "";
}
