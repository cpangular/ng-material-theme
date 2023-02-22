import { ColorTranslator } from "colortranslator";
import CssTree from "./CssTree";

import { tryGetColor } from "./tryGetColor";

export class ColorizedProperty {
  private readonly _parts: (string | ColorTranslator)[] = [];

  constructor(public readonly propertyName: string, private readonly node: CssTree.Raw | CssTree.Value) {
    if (node.type === "Raw") {
      this._parts.push(tryGetColor(node) ?? CssTree.generate(node).trim());
    } else {
      node.children.forEach((p) => {
        this._parts.push(tryGetColor(p) ?? CssTree.generate(p).trim());
      });
    }
  }

  public get colors() {
    return this._parts.filter((p) => p instanceof ColorTranslator) as ColorTranslator[];
  }

  public get parts() {
    return this._parts.slice();
  }

  public replaceColor(oldColor: ColorTranslator, newValue: ColorTranslator | string) {
    const idx = this._parts.findIndex((p) => p === oldColor);
    if (idx !== -1) {
      this._parts.splice(idx, 1, newValue);
    }
  }

  public toDeclaration(): CssTree.Declaration {
    return CssTree.parse(this.toDeclarationString(), { context: "declaration" }) as CssTree.Declaration;
  }

  public toDeclarationString(): string {
    return `${this.propertyName}: ${this.toString()}`;
  }

  public toString(): string {
    return this._parts.map((i) => (typeof i === "string" ? i : i.A < 1 ? i.RGBA : i.HEX)).join(" ");
  }
}
