import { Raw, Value } from "css-tree";
import { CssProperty } from "../types/CssProperty";
import { CssPropertyTransform } from "../types/CssPropertyTransform";
import { ThemeConfig } from "../types/ThemeConfig";
import { getPaletteFromSelector } from "../util/getPaletteFromSelector";
import { CssTransformBase } from "./CssTransformBase";
import * as CssTree from "css-tree";
import { ThemeVarsRegistry } from "../ThemeVarsRegistry";

import colorNameList from "color-name-list";
import { ColorTranslator } from "colortranslator";

const FOR_THEMES = ["button"];

const PROPERTY_PREFIXES = ["--mdc-text-button", "--mdc-filled-button", "--mdc-protected-button", "--mdc-outlined-button"];

const BACKGROUND_SUFFIXES = ["container-color", "disabled-container-color"];
const FOREGROUND_SUFFIXES = ["label-text-color", "disabled-label-text-color"];
const RIPPLE_SUFFIXES = ["persistent-ripple-color", "ripple-color"];

export class ComponentBackgroundColorTransform extends CssTransformBase implements CssPropertyTransform {
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
        return `var(${ThemeVarsRegistry.register(config.name, `color-${palette}`)})`;
      case "disabled":
        return `var(${ThemeVarsRegistry.register(config.name, `color-overlay-disabled`)})`;
      default:
        return `var(${ThemeVarsRegistry.register(config.name, `color-surface`)})`;
    }
  }
}

export class ComponentRippleTransform extends CssTransformBase implements CssPropertyTransform {
  private readonly _props = ["--mat-mdc-button"].map((p) => RIPPLE_SUFFIXES.map((s) => `${p}-${s}`)).flat();

  public readonly transforms = "property";

  public override appliesToTheme(themeName: string) {
    return FOR_THEMES.includes(themeName);
  }

  public appliesToProperty(property: CssProperty) {
    return this._props.includes(property.propertyName);
  }

  public transform(property: CssProperty, config: ThemeConfig): string | number | Raw | Value {
    const palette = getPaletteFromSelector(property.selector);
    const tint = property.propertyName.endsWith("-persistent-ripple-color") ? "" : "-tint-lower";

    switch (palette) {
      case "primary":
      case "secondary":
      case "error":
        return `var(${ThemeVarsRegistry.register(config.name, `color-${palette}${tint}`)})`;
      default:
        return `var(${ThemeVarsRegistry.register(config.name, `color-surface${tint}`)})`;
    }
  }
}

const opacityMap = {
  lowest: {
    true: 0.04,
    false: 0.02,
  },
  lower: {
    true: 0.08,
    false: 0.04,
  },
  low: {
    true: 0.12,
    false: 0.06,
  },
  medium: {
    true: 0.24,
    false: 0.12,
  },
  high: {
    true: 0.38,
    false: 0.24,
  },
  higher: {
    true: 0.5,
    false: 0.42,
  },
  highest: {
    true: 0.9,
    false: 0.65,
  },
};

export class ComponentOpacityTransform extends CssTransformBase implements CssPropertyTransform {
  public readonly transforms = "property";

  public override appliesToTheme(themeName: string) {
    return FOR_THEMES.includes(themeName);
  }

  public appliesToProperty(property: CssProperty) {
    return property.propertyName === "opacity";
  }

  public transform(property: CssProperty, config: ThemeConfig): string | number | Raw | Value {
    const propVal = parseFloat(CssTree.generate(property.value));
    switch (propVal) {
      case opacityMap.lowest[config.darkMode.toString()]:
        return `var(${ThemeVarsRegistry.register(config.name, `opacity-lowest`)})`;
      case opacityMap.lower[config.darkMode.toString()]:
        return `var(${ThemeVarsRegistry.register(config.name, `opacity-lower`)})`;
      case opacityMap.lowest[config.darkMode.toString()]:
        return `var(${ThemeVarsRegistry.register(config.name, `opacity-low`)})`;
      case opacityMap.medium[config.darkMode.toString()]:
        return `var(${ThemeVarsRegistry.register(config.name, `opacity`)})`;
      case opacityMap.high[config.darkMode.toString()]:
        return `var(${ThemeVarsRegistry.register(config.name, `opacity-high`)})`;
      case opacityMap.higher[config.darkMode.toString()]:
        return `var(${ThemeVarsRegistry.register(config.name, `opacity-higher`)})`;
      case opacityMap.highest[config.darkMode.toString()]:
        return `var(${ThemeVarsRegistry.register(config.name, `opacity-highest`)})`;
    }
  }
}

export class ComponentForegroundColorTransform extends CssTransformBase implements CssPropertyTransform {
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
        return `var(${ThemeVarsRegistry.register(config.name, `color-${palette}-contrast`)})`;
      case "disabled":
        return `var(${ThemeVarsRegistry.register(config.name, `color-overlay-disabled-contrast`)})`;
      default:
        return `var(${ThemeVarsRegistry.register(config.name, `color-surface-contrast`)})`;
    }
  }
}

export function getDeclarationColor(property: CssProperty) {
  try {
    return new ColorTranslator(CssTree.generate(property.value).trim());
  } catch {}
  return undefined;
}

export class ComponentDensityTransform extends CssTransformBase implements CssPropertyTransform {
  public readonly transforms = "property";

  public override appliesToTheme(themeName: string) {
    return FOR_THEMES.includes(themeName);
  }

  public appliesToSelector(selector: string) {
    return selector.includes("-mdc-button-base");
  }
  public appliesToProperty(property: CssProperty) {
    return property.propertyName === "height";
  }

  public transform(property: CssProperty, config: ThemeConfig): string | number | Raw | Value {
    const value = CssTree.generate(property.value);
    const val = parseFloat(value);
    if (value.endsWith("px")) {
      const target = val + Math.abs(config.density) * 4;
      if (target === 36) {
        return `clamp(28px, calc(36px - calc(4px * var(${ThemeVarsRegistry.register(config.name, "density")}, 0))), 36px)`;
      }
    } else if (value === "100%") {
      return `max(100%, calc(133.3334% + calc(var(${ThemeVarsRegistry.register(config.name, "density")}, 0) * 100%)))`;
    }
  }
}
