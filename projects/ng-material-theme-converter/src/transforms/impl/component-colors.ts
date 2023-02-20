import { Raw, Value } from "css-tree";
import { CssProperty } from "../types/CssProperty";
import { CssPropertyTransform } from "../types/CssPropertyTransform";
import { ThemeConfig } from "../types/ThemeConfig";
import { getPaletteFromSelector } from "../util/getPaletteFromSelector";
import { CssTransformBase } from "./CssTransformBase";
import * as CssTree from "css-tree";
import { ThemeVarsRegistry } from "../ThemeVarsRegistry";
import { CssStyleSheetTransform } from "../types/CssStyleSheetTransform";

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
        return `var(${ThemeVarsRegistry.register(`color-${palette}`)})`;
      case "disabled":
        return `var(${ThemeVarsRegistry.register(`color-overlay-disabled`)})`;
      default:
        return `var(${ThemeVarsRegistry.register(`color-surface`)})`;
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
        return `var(${ThemeVarsRegistry.register(`color-${palette}-contrast`)})`;
      case "disabled":
        return `var(${ThemeVarsRegistry.register(`color-overlay-disabled-contrast`)})`;
      default:
        return `var(${ThemeVarsRegistry.register(`color-surface-contrast`)})`;
    }
  }
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
        return `clamp(28px, calc(36px - calc(4px * var(${ThemeVarsRegistry.register("density")}, 0))), 36px)`;
      }
    } else if (value === "100%") {
      return `max(100%, calc(133.3334% + calc(var(${ThemeVarsRegistry.register("density")}, 0) * 100%)))`;
    }
  }
}

export class AddMissingRuleTransform extends CssTransformBase implements CssStyleSheetTransform {
  public readonly transforms = "stylesheet";

  public override appliesToTheme(themeName: string) {
    return themeName === this.theme;
  }

  transform(styleSheet: CssTree.StyleSheet, config: ThemeConfig): void {
    const rule = CssTree.find(styleSheet, (n) => {
      return n.type === "Rule" && CssTree.generate(n.prelude) === this.selector;
    }) as CssTree.Rule | undefined;

    if (!rule) {
      const node = CssTree.parse(`${this.selector}{
        ${this.rule}
      }`);
      const item = styleSheet.children.createItem(node);
      styleSheet.children.append(item);
    }
  }

  constructor(private readonly theme: string, private readonly selector: string, private readonly rule: string) {
    super();
  }
}
export class AddMissingPropertyTransform extends CssTransformBase implements CssStyleSheetTransform {
  public readonly transforms = "stylesheet";

  public override appliesToTheme(themeName: string) {
    return themeName === this.theme;
  }

  transform(styleSheet: CssTree.StyleSheet, config: ThemeConfig): void {
    const rule = CssTree.find(styleSheet, (n) => {
      return n.type === "Rule" && CssTree.generate(n.prelude) === this.selector;
    }) as CssTree.Rule | undefined;

    if (!rule) {
      const node = CssTree.parse(`${this.selector}{
        ${this.property}: ${this.value};
      }`);
      const item = styleSheet.children.createItem(node);
      styleSheet.children.append(item);
    } else {
      const prop = CssTree.find(rule, (n) => {
        return n.type === "Declaration" && n.property === this.property;
      }) as CssTree.Declaration | undefined;
      if (!prop) {
        const item = rule.block.children.createItem(CssTree.parse(`${this.property}: ${this.value}`, { context: "declaration" }));
        rule.block.children.append(item);
      }
    }
  }

  constructor(
    private readonly theme: string,
    private readonly selector: string,
    private readonly property: string,
    private readonly value: string
  ) {
    super();
  }
}
