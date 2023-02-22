import { ThemeConfig } from "../../types/ThemeConfig";
import { CssTransformBase } from "../CssTransformBase";
import * as CssTree from "css-tree";
import { CssStyleSheetTransform } from "../../types/CssStyleSheetTransform";

export class AddMissingPropertyTransform extends CssTransformBase implements CssStyleSheetTransform {
  public readonly transforms = "stylesheet";

  public override appliesToTheme(themeName: string) {
    return themeName === this.theme;
  }

  transform(styleSheet: CssTree.StyleSheet, config: ThemeConfig): void {
    const rule = CssTree.find(styleSheet, (n) => {
      return n.type === "Rule" && CssTree.generate(n.prelude).trim() === this.selector.trim();
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
