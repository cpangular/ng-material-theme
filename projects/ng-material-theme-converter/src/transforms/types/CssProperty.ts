import * as CssTree from "css-tree";

export interface CssProperty {
  templateName: string;
  selector: string;
  propertyName: string;
  value: CssTree.Raw | CssTree.Value;
}
