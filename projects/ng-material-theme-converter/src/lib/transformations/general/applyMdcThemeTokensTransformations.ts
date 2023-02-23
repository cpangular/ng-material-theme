import chalk from "chalk";
import { MDCThemeTokenSubstitutions } from "../../data/MDCThemeTokenSubstitutions";
import { ThemeRegistry } from "../../ThemeRegistry";
import { PropertyTransformation } from "../../types/PropertyTransformation";
import { ThemeFileUtil } from "../../types/ThemeFileUtil";
import CssTree from "../../util/CssTree";

export function applyMdcThemeTokensTransformations(themeFile: ThemeFileUtil): PropertyTransformation[] {
  return themeFile.database.cssProperties
    .where((r) => r.value.startsWith("var(--mdc-theme-"))
    .select((record) => {
      const match = record.value.match(/^var\(--mdc-theme-(.*?),\s*(.*?)\)/);
      const replacement = MDCThemeTokenSubstitutions[match[1]];
      if (replacement) {
        return () => {
          const value = `var(${ThemeRegistry.registerVariable(themeFile.name, replacement)})`;
          record.node.value = CssTree.parse(value, { context: "value" }) as CssTree.Value;
          themeFile.markChanged();
        };
      } else {
        themeFile.logInfo(`${chalk.yellowBright("found unknown mdc variable:")} ${chalk.magenta(`--mdc-theme-${match[1]}`)}`);
      }
    })
    .where((r) => !!r)
    .toArray();
}
