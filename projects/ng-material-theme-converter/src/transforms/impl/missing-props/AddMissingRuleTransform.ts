import * as CssTree from "css-tree";
import { CssRule } from "../../types/CssRule";
import { CssRuleTransform } from "../../types/CssRuleTransform";
import { CssStyleSheetTransform } from "../../types/CssStyleSheetTransform";
import { ThemeConfig } from "../../types/ThemeConfig";
import { CssTransformBase } from "../CssTransformBase";

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

export class ReplaceRuleTransform extends CssTransformBase implements CssRuleTransform {
  public readonly transforms = "rule";

  public override appliesToTheme(themeName: string) {
    return themeName === this.theme;
  }

  public override appliesToSelector(selector: string) {
    return selector === this.selector;
  }

  constructor(private readonly theme: string, private readonly selector: string, private readonly rule: string) {
    super();
  }

  transform(rule: CssRule, config: ThemeConfig): CssTree.Rule {
    console.log("ReplaceRuleTransform", rule.selector);
    const newRule = CssTree.parse(this.rule.trim(), { context: "rule" }) as CssTree.Rule;
    return newRule;
  }
}
