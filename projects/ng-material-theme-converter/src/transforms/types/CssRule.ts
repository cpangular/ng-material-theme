import * as CssTree from "css-tree";

export interface CssRule {
  templateName: string;
  selector: string;
  value: CssTree.Rule;
}
