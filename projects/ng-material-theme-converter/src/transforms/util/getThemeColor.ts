import { ThemeConfig } from "../../lib/types/ThemeConfig";
import { ColorTranslator } from "colortranslator";
import { BackgroundTokenKey, ForegroundTokenKey, PaletteTokenKey, ThemeTokens } from "../../lib/data/ThemeTokens";
import {
  ThemeBackgroundName,
  ThemeErrorName,
  ThemeForegroundName,
  ThemePaletteName,
  ThemePrimaryName,
  ThemeSecondaryName,
} from "../types/ThemePaletteName";

function buildReturn(val: string | undefined | null) {
  val ??= undefined;
  return val === undefined ? undefined : new ColorTranslator(val);
}

//ThemePrimaryName
export function getThemeColor(config: ThemeConfig, palette: ThemePrimaryName, property: PaletteTokenKey): ColorTranslator;
export function getThemeColor(config: ThemeConfig, palette: ThemeSecondaryName, property: PaletteTokenKey): ColorTranslator;
export function getThemeColor(config: ThemeConfig, palette: ThemeErrorName, property: PaletteTokenKey): ColorTranslator;
export function getThemeColor(config: ThemeConfig, palette: ThemeBackgroundName, property: BackgroundTokenKey): ColorTranslator;
export function getThemeColor(config: ThemeConfig, palette: ThemeForegroundName, property: ForegroundTokenKey): ColorTranslator;
export function getThemeColor(config: ThemeConfig, palette: ThemePaletteName, property: string): ColorTranslator | undefined;
export function getThemeColor(config: ThemeConfig, palette: ThemePaletteName, property: string): ColorTranslator | undefined {
  switch (palette) {
    case "background":
      const bg = config.darkMode ? ThemeTokens.background : ThemeTokens.background_inverted;
      return buildReturn(bg[property]);
    case "foreground":
      const fg = config.darkMode ? ThemeTokens.foreground : ThemeTokens.foreground_inverted;
      return buildReturn(fg[property]);

    case "primary":
      const p = config.darkMode ? ThemeTokens.primary : ThemeTokens.accent;
      return buildReturn(p[property]);
    case "accent":
    case "secondary":
      const a = config.darkMode ? ThemeTokens.accent : ThemeTokens.warn;
      return buildReturn(a[property]);
    case "warn":
    case "error":
      const w = config.darkMode ? ThemeTokens.warn : ThemeTokens.primary;
      return buildReturn(w[property]);
  }
}
