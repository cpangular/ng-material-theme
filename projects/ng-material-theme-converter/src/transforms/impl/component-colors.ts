import { Raw, Value } from "css-tree";
import { CssProperty } from "../types/CssProperty";
import { CssPropertyTransform } from "../types/CssPropertyTransform";
import { ThemeConfig } from "../types/ThemeConfig";
import { getPaletteFromSelector } from "../util/getPaletteFromSelector";
import { CssTransformBase } from "./CssTransformBase";

const FOR_THEMES = ["button-theme"];

const PROPERTY_PREFIXES = ["--mdc-text-button", "--mdc-filled-button", "--mdc-protected-button", "--mdc-outlined-button"];

const BACKGROUND_SUFFIXES = ["container-color", "disabled-container-color"];
const FOREGROUND_SUFFIXES = ["label-text-color", "disabled-label-text-color"];

export class ComponentBackgroundTransform extends CssTransformBase implements CssPropertyTransform {
  private readonly _props = PROPERTY_PREFIXES.map((p) => BACKGROUND_SUFFIXES.map((s) => `${p}-${s}`)).flat();

  public readonly transforms = "property";

  public override appliesToTheme(themeName: string) {
    return FOR_THEMES.includes(themeName);
  }

  public appliesToProperty(property: CssProperty) {
    return this._props.includes(property.propertyName);
  }

  public transform(property: CssProperty, config: ThemeConfig): string | number | Raw | Value {
    const palette = getPaletteFromSelector(property.selector);
    switch (palette) {
      case "primary":
      case "secondary":
      case "error":
        return `var(--theme-color-${palette})`;
      case "disabled":
        return `var(--theme-color-overlay-disabled)`;
      default:
        return `var(--theme-color-surface)`;
    }
  }
}

export class ComponentForegroundTransform extends CssTransformBase implements CssPropertyTransform {
  private readonly _props = PROPERTY_PREFIXES.map((p) => FOREGROUND_SUFFIXES.map((s) => `${p}-${s}`)).flat();

  public readonly transforms = "property";

  public override appliesToTheme(themeName: string) {
    return FOR_THEMES.includes(themeName);
  }

  public appliesToProperty(property: CssProperty) {
    return this._props.includes(property.propertyName);
  }

  public transform(property: CssProperty, config: ThemeConfig): string | number | Raw | Value {
    const palette = getPaletteFromSelector(property.selector);
    switch (palette) {
      case "primary":
      case "secondary":
      case "error":
        return `var(--theme-color-${palette}-contrast)`;
      case "disabled":
        return `var(--theme-color-overlay-disabled-contrast)`;
      default:
        return `var(--theme-color-surface-contrast)`;
    }
  }
}
