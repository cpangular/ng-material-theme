import { ColorTranslator } from "colortranslator";
import { generate, parse, StyleSheet, Value } from "css-tree";
import { readFileSync } from "fs";
import { join } from "path";
import { compile } from "sass";
import { writeScssFile } from "./util/writeScssFile.mjs";

import colorKeys from "./color-keys.json" with { type: "json" };

const coreResult = compile("./src/scss/core.scss", {
  loadPaths: ["./node_modules"],
});

const themeResult = compile("./src/scss/theme.scss", {
  loadPaths: ["./node_modules"],
});

const theme = parse(themeResult.css) as StyleSheet;

function toScss(value: any): string {
  switch (typeof value) {
    case "string":
      return `${value}`;
    case "boolean":
      return value ? "true" : "false";
    case "undefined":
      return "null";
    case "bigint":
      return value.toString() + "n";
    case "object":
      if (value === null) return "null";
      if (Array.isArray(value)) {
        return `(${value.map(toScss).join(",")})`;
      }
      return `(${Object.entries(value)
        .map(([key, value]) => `${key}: ${toScss(value)}`)
        .join(", ")})`;
    default:
      return value.toString();
  }
}

const colorsResult = compile("./src/scss/colors.scss", {
  loadPaths: ["./node_modules"],
  importers: [
    {
      canonicalize(url) {
        if (!url.endsWith(".json")) return null;
        return new URL("json:" + url);
      },
      load(canonicalUrl) {
        const json = JSON.parse(
          readFileSync(join("src", canonicalUrl.pathname), {
            encoding: "utf-8",
          }),
        );
        return {
          contents: Object.entries(json)
            .map(([key, value]) => `$${key}: ${toScss(value)};`)
            .join("\n"),
          syntax: "scss",
        };
      },
    },
  ],
});

const colors = parse(colorsResult.css) as StyleSheet;

function toPaletteVar(paletteName: string, weight: string) {
  switch (paletteName) {
    case "primary":
    case "secondary":
    case "tertiary":
    case "error":
      if (weight === "80") return `--color--${paletteName}`;
      if (weight === "20") return `--color--${paletteName}--contrast`;
      if (weight === "30") return `--color--${paletteName}-container`;
      if (weight === "90") return `--color--${paletteName}-container--contrast`;
      if (weight === "100") return `--color--white`;
    case "neutral":
      if (weight === "0") return `--color--black`;
      if (weight === "10") return `--color--background`;
      if (weight === "90") return `--color--background--contrast`;
      if (weight === "20") return `--color--surface`;
    case "neutral-variant":
      if (weight === "20") return `--color--background-variant`;
      if (weight === "80") return `--color--background-variant--contrast`;
      if (weight === "30") return `--color--surface-variant`;
      if (weight === "90") return `--color--surface-variant--contrast`;
      if (weight === "60") return `--color--outline`;
  }

  return `--palette-ref--${paletteName}-${weight}`;
}

const colorVars = new Map<string, string>();

colors.children.forEach((child) => {
  if (child.type === "Rule") {
    child.block.children.forEach((c) => {
      if (c.type === "Declaration") {
        //  console.log(child.property, child.value);
        colorVars.set(c.property, generate(c.value));
        let pValue = generate(c.value).toLowerCase().trim();
        if (c.property === "--mat-snack-bar-button-color") {
          pValue = colorKeys.primary[80];
        }
        try {
          const pColor = new ColorTranslator(pValue);
          for (const paletteName in colorKeys) {
            const values = colorKeys[paletteName as keyof typeof colorKeys];
            for (const k in values) {
              const v = new ColorTranslator(values[k as keyof typeof values]);

              if (pColor.HEXA === v.HEXA) {
                c.value = parse(`var(${toPaletteVar(paletteName, k)})`, {
                  context: "value",
                }) as Value;
              } else if (pColor.HEX === v.HEX) {
                c.value = parse(
                  `color-mix(in oklab, var(${toPaletteVar(paletteName, k)}) ${Math.round((pColor.RGBAObject.A || 1) * 10000) / 100}%, transparent 0%)`,
                  { context: "value" },
                ) as Value;
              }
            }
          }
        } catch {
          console.log("-- not color ", c.property, pValue);

          const findRgbRegExp = /rgba\(.*?\)/gim;

          const matches = Array.from(pValue.matchAll(findRgbRegExp));
          let final = pValue;

          if (matches.length > 0) {
            for (const match of matches) {
              const rgba = new ColorTranslator(match[0]);
              for (const paletteName in colorKeys) {
                const values = colorKeys[paletteName as keyof typeof colorKeys];
                for (const k in values) {
                  const v = new ColorTranslator(
                    values[k as keyof typeof values],
                  );
                  if (rgba.HEX === v.HEX) {
                    console.log(
                      "match",
                      match[0],
                      `var(${toPaletteVar(paletteName, k)})`,
                    );
                    final = final.replace(
                      match[0],
                      `color-mix(in oklab, var(${toPaletteVar(paletteName, k)}) ${Math.round((rgba.RGBAObject.A || 1) * 10000) / 100}%, transparent 0%)`,
                    );
                    c.value = parse(final, { context: "value" }) as Value;
                  }
                }
              }
            }
          }
        }

        // if (pValue === colorKeys.primary[40]) {
        //     c.value = parse('var(--color-primary)', { context: "value" }) as Value;
        // }
      }
    });
  }
});

// const themeVars = new Map<string, string>();

theme.children.forEach((child) => {
  if (child.type === "Rule") {
    child.block.children = child.block.children.filter((c) => {
      if (c.type === "Declaration") {
        return !colorVars.has(c.property);
      }
      return true;
    });
  }
});

// console.log(colorVars);
// console.log(themeVars);

await writeScssFile("./css/core.css", coreResult.css);
await writeScssFile("./css/theme.css", generate(theme));
await writeScssFile("./css/colors.css", generate(colors));
