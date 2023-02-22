import * as CssTree from "css-tree";
import { CssProperty } from "./types/CssProperty";
import { CssPropertyTransform } from "./types/CssPropertyTransform";
import { CssRuleTransform } from "./types/CssRuleTransform";
import { CssStyleSheetTransform } from "./types/CssStyleSheetTransform";
import { CssTransformation } from "./types/CssTransformation";
import { ThemeConfig } from "./types/ThemeConfig";

export function applyTransformations(theme: ThemeConfig, stylesheet: CssTree.StyleSheet, transformations: CssTransformation[]) {
  const stylesheetTransforms = transformations.filter((t) => t.transforms === "stylesheet") as CssStyleSheetTransform[];
  const ruleTransforms = transformations.filter((t) => t.transforms === "rule") as CssRuleTransform[];
  const propTransforms = transformations.filter((t) => t.transforms === "property") as CssPropertyTransform[];

  stylesheetTransforms.forEach((t) => {
    if (t.appliesToTheme(theme.name)) {
      t.transform(stylesheet, theme);
    }
  });

  CssTree.walk(stylesheet, function (n, i, l) {
    if (n.type === "Rule") {
      const selector = CssTree.generate(n.prelude).trim();
      const transforms = ruleTransforms.filter((t) => t.appliesToTheme(theme.name) && t.appliesToSelector(selector));
      transforms.forEach((t) => {
        const ret = t.transform(
          {
            selector,
            templateName: theme.name,
            value: n,
          },
          theme
        );
        if (ret && ret !== n) {
          l.replace(i, l.createItem(ret));
        }
      });
    }
  });

  CssTree.walk(stylesheet, function (n, i, l) {
    if (n.type === "Declaration") {
      const selector = CssTree.generate(this.rule.prelude).trim();

      const prop: CssProperty = {
        selector,
        propertyName: n.property,
        templateName: theme.name,
        value: n.value,
      };

      const transforms = propTransforms.filter(
        (t) => t.appliesToTheme(theme.name) && t.appliesToSelector(selector) && t.appliesToProperty(prop)
      );
      transforms.forEach((t) => {
        let ret = t.transform(prop, theme);
        if (ret !== undefined && ret !== null) {
          switch (typeof ret) {
            case "number":
            case "string":
              ret = {
                type: "Raw",
                value: "" + ret,
              };
              break;
          }
          n.value = ret;
        }
      });
    }
  });
}
