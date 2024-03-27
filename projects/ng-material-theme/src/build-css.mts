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
          const findRgbRegExp = /rgba\(.*?\)/gim;
          let final = pValue;
          const matches = Array.from(pValue.matchAll(findRgbRegExp));
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
      }
    });
  }
});

const baseResult = compile("./src/scss/base.scss", {
  loadPaths: ["./node_modules"],
});

const base = parse(baseResult.css) as StyleSheet;

base.children.forEach((child) => {
  if (child.type === "Rule") {
    child.block.children = child.block.children.filter((c) => {
      if (c.type === "Declaration") {
        return !colorVars.has(c.property);
      }
      return true;
    });
  }
});

const densityMap = new Map<string, Set<string>>();

function genDensity(densityScale: number) {
  const densityResult = compile(
    `./src/scss/density-${densityScale * -1}.scss`,
    {
      loadPaths: ["./node_modules"],
    },
  );
  const density = parse(densityResult.css) as StyleSheet;

  density.children.forEach((child) => {
    if (child.type === "Rule") {
      child.block.children = child.block.children.filter((c) => {
        if (c.type === "Declaration") {
          return !colorVars.has(c.property);
        }
        return true;
      });
      child.block.children.forEach((c) => {
        if (c.type === "Declaration") {
          if (!densityMap.has(c.property)) {
            densityMap.set(c.property, new Set());
          }
          const propDensity = densityMap.get(c.property)!;
          propDensity.add(generate(c.value));
        }
      });
    }
  });
  return density;
}

function filterDensity(density: StyleSheet) {
  density.children.forEach((child) => {
    if (child.type === "Rule") {
      child.block.children = child.block.children.filter((c) => {
        if (c.type === "Declaration") {
          return (densityMap.get(c.property)?.size || 0) > 1;
        }
        return true;
      });
    }
  });
  return density;
}
function filterNonDensity(density: StyleSheet) {
  density.children.forEach((child) => {
    if (child.type === "Rule") {
      child.block.children = child.block.children.filter((c) => {
        if (c.type === "Declaration") {
          return (densityMap.get(c.property)?.size || 0) <= 1;
        }
        return true;
      });
    }
  });
  return density;
}

const density_0 = genDensity(0);
const density_1 = genDensity(-1);
const density_2 = genDensity(-2);
const density_3 = genDensity(-3);
const density_4 = genDensity(-4);
const density_5 = genDensity(-5);

filterDensity(density_0);
filterDensity(density_1);
filterDensity(density_2);
filterDensity(density_3);
filterDensity(density_4);
filterDensity(density_5);

filterNonDensity(base);

const coreThemeCss = `
    ${generate(colors)}
    ${generate(base)}
    ${generate(density_0)}
    ${generate(density_1)}
    ${generate(density_2)}
    ${generate(density_3)}
    ${generate(density_4)}
    ${generate(density_5)}
    ${coreResult.css}
`;

await writeScssFile("./css/core.css", coreThemeCss);

/*
await writeScssFile("./css/base.css", generate(base));
await writeScssFile("./css/density-0.css", generate(density_0));
await writeScssFile("./css/density-1.css", generate(density_1));
await writeScssFile("./css/density-2.css", generate(density_2));
await writeScssFile("./css/density-3.css", generate(density_3));
await writeScssFile("./css/density-4.css", generate(density_4));
await writeScssFile("./css/density-5.css", generate(density_5));
await writeScssFile("./css/colors.css", generate(colors));
*/
