export const componentThemes = [
  "core",
  "card",
  "progress-bar",
  "tooltip",
  "form-field",
  "input",
  "select",
  "autocomplete",
  "dialog",
  "chips",
  "slide-toggle",
  "radio",
  "slider",
  "menu",
  "list",
  "paginator",
  "tabs",
  "checkbox",
  "button",
  "icon-button",
  "fab",
  "snack-bar",
  "table",
  "progress-spinner",
  "badge",
  "bottom-sheet",
  "button-toggle",
  "datepicker",
  "divider",
  "expansion",
  "grid-list",
  "icon",
  "sidenav",
  "stepper",
  "sort",
  "toolbar",
  "tree",
] as const;

export type ComponentTheme = (typeof componentThemes)[any];
