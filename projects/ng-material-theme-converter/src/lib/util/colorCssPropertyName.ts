import { readFileSync } from "fs";
import { ScssRunner } from "../../../../shared/ts/run-scss";

const runner: ScssRunner = new ScssRunner({
  "theme-color-util": readFileSync("../shared/scss/theme-color/_util.scss", { encoding: "utf-8" }),
});

export function colorCssPropertyName(palette: string, variation?: string, property?: string, isRef: boolean = false) {
  return runner.call<string>("theme-color-util", "css-property-name", [palette, variation ?? null, property ?? null, isRef ?? false]);
}
