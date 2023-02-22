import { ColorTranslator } from "colortranslator";
import CssTree from "./CssTree";

export function tryGetColor(node: string | CssTree.CssNode) {
  try {
    return new ColorTranslator(typeof node === "string" ? node.trim() : CssTree.generate(node).trim());
  } catch {}
}
