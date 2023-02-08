import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { cssTransformers } from "./transformers/transformers";

function sectionHeader(title: string) {
  return `/* ********* ${title} ********* */\n\n`;
}

export function convertMaterialTheme() {
  mkdirSync("./dist", { recursive: true });

  const cssPath = "../NgMaterialApp/dist/ng-material-app/styles.css";
  let cssParts = readFileSync(cssPath, { encoding: "utf-8" })
    .split(/(\/\*\!\*\*)|(\*\*\*\/\n)/g)
    .filter((i) => !!i)
    .filter((i) => !i.startsWith("/*!*"))
    .filter((i) => !i.startsWith("***"));

  let componentCss = cssParts[1];
  for (const transform of cssTransformers) {
    componentCss = transform(componentCss);
  }

  const coreCss = cssParts[0];
  const css = sectionHeader("Core") + coreCss + "\n\n" + sectionHeader("Components") + componentCss;
  writeFileSync("./dist/mat-theme.css", css, { encoding: "utf-8" });
}
