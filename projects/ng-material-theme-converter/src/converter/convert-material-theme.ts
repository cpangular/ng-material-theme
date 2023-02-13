import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { cssTransforms } from "./transforms";

function sectionHeader(title: string) {
  return `/* ********* ${title} ********* */\n\n`;
}

export function convertMaterialTheme() {
  mkdirSync("./dist", { recursive: true });

  const cssPath = "dist/css/theme-raw.css";

  let cssParts = readFileSync(cssPath, { encoding: "utf-8" })
    .split("/*** Components ***/")
    .filter((i) => !!i?.trim());

  let componentCss = cssParts[1];
  for (const transform of cssTransforms) {
    componentCss = transform(componentCss);
  }

  const coreCss = cssParts[0];
  const css = sectionHeader("Core") + coreCss + "\n\n" + sectionHeader("Components") + componentCss;
  writeFileSync("./dist/ng-material-theme.css", css, { encoding: "utf-8" });
}
