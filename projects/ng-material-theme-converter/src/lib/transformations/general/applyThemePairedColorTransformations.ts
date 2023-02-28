import chalk from "chalk";
import { ColorTranslator } from "colortranslator";
import { ColorLookup } from "../../data/ColorLookup";
import { TintLookup } from "../../data/TintLookup";
import { ThemeRegistry } from "../../ThemeRegistry";
import { CssDiffView } from "../../types/CssDiffView";
import { PropertyTransformation } from "../../types/PropertyTransformation";
import { ThemeFileUtil } from "../../types/ThemeFileUtil";
import CssTree from "../../util/CssTree";

export function applyThemePairedColorTransformations(themeFile: ThemeFileUtil): PropertyTransformation[] {
  return themeFile.database.colorDifferencesView
    .where((v) => v.darkMode?.value !== undefined && v.lightMode?.value !== undefined)
    .selectMany((v) =>
      v.lightMode.valueColors.colors
        .map((c, i) => {
          const diff = v as CssDiffView;
          const lightColor = c;
          const darkColor = diff.darkMode.valueColors.colors[i];
          const density1Color = diff.density1.valueColors.colors[i];
          const density2Color = diff.density2.valueColors.colors[i];

          let match = ColorLookup.find(
            (l) => new ColorTranslator(l.light).HEXA === lightColor.HEXA && new ColorTranslator(l.dark).HEXA === darkColor.HEXA
          );
          if (!match) {
            match = TintLookup.find(
              (l) =>
                new ColorTranslator(l.light).HEX === lightColor.HEX &&
                new ColorTranslator(l.dark).HEX === darkColor.HEX &&
                l.alphas.includes(lightColor.A)
            );
          }

          if (!match) {
            if (lightColor.A !== 1) {
              if (lightColor.R !== lightColor.B || lightColor.R !== lightColor.G) {
                this.logInfo(`${chalk.yellowBright("found unknown color:")} ${chalk.magenta(lightColor.RGBA)}`);
              }
            }
          }

          if (match) {
            return () => {
              const value = `var(${ThemeRegistry.registerVariable(themeFile.name, match.name)})`;
              diff.lightMode.valueColors.replaceColor(lightColor, value);
              diff.darkMode.valueColors.replaceColor(darkColor, value);
              diff.density1.valueColors.replaceColor(density1Color, value);
              diff.density2.valueColors.replaceColor(density2Color, value);

              diff.lightMode.node.value = CssTree.parse(diff.lightMode.valueColors.toString(), { context: "value" }) as CssTree.Value;
              diff.darkMode.node.value = CssTree.parse(diff.darkMode.valueColors.toString(), { context: "value" }) as CssTree.Value;
              diff.density1.node.value = CssTree.parse(diff.density1.valueColors.toString(), { context: "value" }) as CssTree.Value;
              diff.density2.node.value = CssTree.parse(diff.density2.valueColors.toString(), { context: "value" }) as CssTree.Value;
              themeFile.markChanged();
            };
          }
        })
        .filter((v) => !!v)
    )
    .toArray();
}
