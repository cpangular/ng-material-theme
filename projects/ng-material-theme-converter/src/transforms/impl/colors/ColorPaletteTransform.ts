import { ColorTranslator } from "colortranslator";
import * as CssTree from "css-tree";
import { Raw, Value } from "css-tree";
import { BackgroundTokenKey, ForegroundTokenKey, PaletteTokenKey } from "../../ThemeTokens";
import { ThemeVarsRegistry } from "../../ThemeVarsRegistry";
import { CssProperty } from "../../types/CssProperty";
import { CssPropertyTransform } from "../../types/CssPropertyTransform";
import { ThemeConfig } from "../../types/ThemeConfig";
import {
  ThemeBackgroundName,
  ThemeErrorName,
  ThemeForegroundName,
  ThemePaletteName,
  ThemePrimaryName,
  ThemeSecondaryName,
} from "../../types/ThemePaletteName";
import { getThemeColor } from "../../util/getThemeColor";
import { getDeclarationColor } from "../component-colors";
import { CssTransformBase } from "../CssTransformBase";

export class ColorPaletteTransform extends CssTransformBase implements CssPropertyTransform {
  private static _defaultProperties = ["color", "background", "background-color"];
  public readonly transforms = "property";

  public appliesToProperty(property: CssProperty) {
    return this.propertyFilter === true || (this.propertyFilter ?? []).includes(property.propertyName);
  }
  constructor(
    varName: string,
    palette: ThemePrimaryName | ThemeSecondaryName | ThemeErrorName,
    paletteProperty: PaletteTokenKey,
    colorMod?: (color: ColorTranslator) => ColorTranslator,
    propertyFilter?: true | string[]
  );
  constructor(
    varName: string,
    palette: ThemeBackgroundName,
    paletteProperty: BackgroundTokenKey,
    colorMod?: (color: ColorTranslator) => ColorTranslator,
    propertyFilter?: true | string[]
  );
  constructor(
    varName: string,
    palette: ThemeForegroundName,
    paletteProperty: ForegroundTokenKey,
    colorMod?: (color: ColorTranslator) => ColorTranslator,
    propertyFilter?: true | string[]
  );
  constructor(
    private readonly varName: string,
    private readonly palette: ThemePaletteName,
    private readonly paletteProperty: string,
    private readonly colorMod?: (color: ColorTranslator) => ColorTranslator,
    private readonly propertyFilter: true | string[] = true
  ) {
    super();
  }

  public transform(property: CssProperty, config: ThemeConfig): string | number | Raw | Value {
    let themeColor = getThemeColor(config, this.palette as any, this.paletteProperty);

    if (this.colorMod) {
      themeColor = this.colorMod(new ColorTranslator(themeColor.HEXA));
    }

    const value = getDeclarationColor(property)?.HEXA;
    const themeValue = themeColor.HEXA;

    if (value === themeValue) {
      const vName = this.varName?.trim() || `color-${this.palette}`;
      return `var(${ThemeVarsRegistry.register(config.name, vName)})`;
    }

    return undefined;
  }
}

export class VarValueReplaceTransform extends CssTransformBase implements CssPropertyTransform {
  public readonly transforms = "property";

  public appliesToProperty(property: CssProperty) {
    return (
      CssTree.generate(property.value).startsWith(`var(${this.fromVar},`) ||
      CssTree.generate(property.value).startsWith(`var(${this.fromVar})`)
    );
  }

  constructor(private readonly fromVar: string, private readonly toVar: string) {
    super();
  }

  public transform(property: CssProperty, config: ThemeConfig): string | number | Raw | Value {
    return `var(${ThemeVarsRegistry.register(config.name, this.toVar)})`;
  }
}

export class VarPropertySetTransform extends CssTransformBase implements CssPropertyTransform {
  public readonly transforms = "property";

  public override appliesToProperty(property: CssProperty) {
    return property.propertyName === this.propertyName;
  }

  public override appliesToSelector(selector: string) {
    return !this.selector || selector === this.selector;
  }

  constructor(
    private readonly propertyName: string,
    private readonly toVar: string,
    private readonly selector?: string,
    private readonly rawId?: string | string[]
  ) {
    super();
  }

  public transform(property: CssProperty, config: ThemeConfig): string | number | Raw | Value {
    if (this.rawId) {
      const ids = Array.isArray(this.rawId) ? this.rawId : [this.rawId];
      ids.forEach((id) => {
        ThemeVarsRegistry.register(config.name, id);
      });
      return this.toVar;
    }
    return `var(${ThemeVarsRegistry.register(config.name, this.toVar)})`;
  }
}
