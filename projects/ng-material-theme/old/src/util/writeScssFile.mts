import { StyleSheet, generate } from "css-tree";
import { mkdir, writeFile } from "fs/promises";
import { dirname } from "path";
import { format } from "prettier";

export async function writeScssFile(path: string, scss: string | StyleSheet) {
  await mkdir(dirname(path), { recursive: true });
  scss = (typeof scss === "string" ? scss : generate(scss)).trim();
  await writeFile(path, await format(scss, { parser: "scss", tabWidth: 2 }), {
    encoding: "utf-8",
  });
}
