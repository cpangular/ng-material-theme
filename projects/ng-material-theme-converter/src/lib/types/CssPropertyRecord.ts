import { ColorizedProperty } from "../util/ColorizedProperty";
import CssTree from "../util/CssTree";

export interface CssPropertyRecord {
  readonly sourceFile: string;
  readonly darkMode: boolean;
  readonly density: 0 | -1 | -2;
  readonly selectors: string[];
  readonly name: string;
  readonly node: CssTree.Declaration;
  readonly value: string;
  readonly important: boolean;
  readonly valueColors: ColorizedProperty;
}
