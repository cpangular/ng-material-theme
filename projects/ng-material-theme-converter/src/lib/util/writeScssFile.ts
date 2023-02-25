import { mkdirSync, writeFileSync } from "fs";
import Prettier from "prettier";
import Path from "path";
import CssTree from "./CssTree";

export function writeScssFile(path: string, scss: string | CssTree.StyleSheet, includeUtil: boolean = true) {
  try {
    mkdirSync(Path.dirname(path), { recursive: true });
    scss = (typeof scss === "string" ? scss : CssTree.generate(scss)).trim();
    if (includeUtil) {
      scss = `
          @use '../theme-mode';
          ${scss}
        `;
    }
    writeFileSync(path, Prettier.format(scss, { parser: "scss", tabWidth: 2 }), { encoding: "utf-8" });
  } catch (e) {
    if (e instanceof Error) {
      console.error("Unable to write scss file: ", path);
      console.error(e.name);
      console.error(e.message);
    }
  }
}
