import * as CssTree from "css-tree";
import { CssProperty } from "./CssProperty";
import { ThemeConfig } from "./ThemeConfig";

export type TransformPropertyFn = (property: CssProperty, config: ThemeConfig) => undefined | string | number | CssTree.Raw | CssTree.Value;

export interface CssTransformHandler {
  appliesToTheme: (themeName: string) => boolean;
  appliesToSelector: (selector: string) => boolean;
  appliesToProperty: (property: CssProperty) => boolean;
  transform: TransformPropertyFn;
}
