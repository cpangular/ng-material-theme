import { CssProperty } from "./types/CssProperty";
import { CssTransformHandler, TransformPropertyFn } from "./types/CssTransformHandler";

export function createTransform(
  appliesToTheme: (themeName: string) => boolean,
  appliesToSelector: (selector: string) => boolean,
  appliesToProperty: (property: CssProperty) => boolean,
  transform: TransformPropertyFn
): CssTransformHandler {
  return { appliesToTheme, appliesToSelector, appliesToProperty, transform };
}
