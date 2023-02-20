import { CssPropertyReport } from "./report/CssPropertyReport";
import Enumerable from "linq";
import { CssChangeReport } from "./report/CssChangeReport";
import { CssModeChangeReport } from "./report/CssModeChangeReport";
import { CssDensityChangeReport } from "./report/CssDensityChangeReport";
import { CssPropertyModificationReport } from "./report/CssPropertyModificationReport";
import { CssRuleReport } from "./report/CssRuleReport";

export function generateReport(properties: CssPropertyReport[]) {
  return Enumerable.from(properties)
    .groupBy(
      (p) => p.selector,
      (p) => p,
      (selector, props) => {
        return {
          selector,
          source: props.first().source,
          properties: props
            .groupBy(
              (p) => p.name,
              (p) => p,
              (name, p) => {
                const currentValue = p
                  .where((i) => i.darkMode === true && i.density === -2)
                  .select((i) => i.value)
                  .firstOrDefault();
                const colorValue = p
                  .where((i) => i.darkMode === false && i.density === -2)
                  .select((i) => i.value)
                  .firstOrDefault();
                const dense1Value = p
                  .where((i) => i.darkMode === true && i.density === -1)
                  .select((i) => i.value)
                  .firstOrDefault();
                const dense0Value = p
                  .where((i) => i.darkMode === true && i.density === 0)
                  .select((i) => i.value)
                  .firstOrDefault();

                let change: CssChangeReport | undefined;
                if (currentValue !== colorValue) {
                  change = {
                    scope: "mode",
                    darkModeValue: currentValue,
                    lightModeValue: colorValue,
                  } as CssModeChangeReport;
                } else if (currentValue !== dense1Value || currentValue !== dense0Value) {
                  change = {
                    scope: "density",

                    values: {
                      "-1": dense1Value,
                      "-2": dense0Value,
                      "0": currentValue,
                    },
                  } as CssDensityChangeReport;
                }

                return {
                  name,
                  value: currentValue,
                  change,
                } as CssPropertyModificationReport;
              }
            )
            .toArray(),
        } as CssRuleReport;
      }
    )
    .toArray();
}
