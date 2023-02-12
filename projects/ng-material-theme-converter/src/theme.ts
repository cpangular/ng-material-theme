import { compile } from "sass";

const css = compile("src/theme.scss", {
  loadPaths: ["node_modules/"],
  sourceMap: true,
  sourceMapIncludeSources: true,
  style: "expanded",
});

console.log("css", css);
