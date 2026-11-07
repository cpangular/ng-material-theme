// Verification runner (PLAN.md, "Verification"). Run directly with Node 24 (type stripping).
//   1. Sass compiles all entries.
//   2. Every var(--x) without a fallback is declared in the CSS it is used with,
//      no unregistered light-dark()-valued property is a `from var(--x)` origin,
//      and core.css keeps its cascade shape (zero-specificity rules; constants
//      declared on :root only; derived palettes opaque).
//   3. Contrast sweep (colorjs.io, no browser) of the luminance step, the OKLab
//      mixes and the surface tones shipped in core.css.
//   4. Gzipped size and @property count.
//   5. Docs chapter-order check (Phase 5; skipped until projects/docs exists).
import { compile, compileString } from "sass";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import Color from "colorjs.io";

const pkgDir = resolve(dirname(new URL(import.meta.url).pathname), "..");
const srcDir = join(pkgDir, "css/src");
const docsExamples = resolve(pkgDir, "../docs/src/examples");
const loadPaths = [
  join(pkgDir, "node_modules"),
  resolve(pkgDir, "../../node_modules"),
];

let failed = 0;
const ok = (msg: string) => console.log(`ok   ${msg}`);
const fail = (msg: string) => {
  failed++;
  console.error(`FAIL ${msg}`);
};

// ── 1. Compile ────────────────────────────────────────────────────────────────
const compiled = new Map<string, string>(); // "core.css" → css text
for (const entry of readdirSync(srcDir).filter(
  (f) => f.endsWith(".scss") && !f.startsWith("_"),
)) {
  try {
    const { css } = compile(join(srcDir, entry), {
      loadPaths,
      style: "compressed",
    });
    compiled.set(entry.replace(/\.scss$/, ".css"), css);
    ok(`1 compile ${entry} (${(css.length / 1024).toFixed(1)} KB)`);
  } catch (e) {
    fail(`1 compile ${entry}\n${(e as Error).message}`);
  }
}
if (!compiled.has("core.css")) {
  console.error("core.css did not compile; stopping.");
  process.exit(1);
}

// ── 2. Declared / registered / relative-colour origins ────────────────────────
function analyse(css: string) {
  const registered = new Set(
    [...css.matchAll(/@property\s+(--[\w-]+)/g)].map((m) => m[1]),
  );
  const declared = new Map<string, string[]>(); // name → [values]
  for (const m of css.matchAll(/(?:^|[{;])\s*(--[\w-]+)\s*:\s*([^;}]*)/g)) {
    if (!declared.has(m[1])) declared.set(m[1], []);
    declared.get(m[1])!.push(m[2]);
  }
  const problems: string[] = [];
  const missing = new Set<string>();
  for (const m of css.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)) {
    if (!declared.has(m[1]) && !registered.has(m[1])) missing.add(m[1]);
  }
  for (const name of missing)
    problems.push(`var(${name}) is read without a fallback but never declared`);
  for (const m of css.matchAll(/from\s+var\(\s*(--[\w-]+)\s*\)/g)) {
    const name = m[1];
    if (registered.has(name)) continue;
    if ((declared.get(name) || []).some((v) => v.includes("light-dark("))) {
      problems.push(
        `${name} holds light-dark() and is unregistered, but is a relative-colour origin`,
      );
    }
  }
  return { registered, declared, problems: [...new Set(problems)] };
}
function check2(label: string, css: string) {
  const { problems } = analyse(css);
  if (problems.length) fail(`2 ${label}\n  ${problems.join("\n  ")}`);
  else ok(`2 ${label}`);
}
check2("core.css", compiled.get("core.css")!);
for (const [name, css] of compiled) {
  if (name !== "core.css")
    check2(`core.css + ${name}`, compiled.get("core.css")! + css);
}
// Cascade shape of core.css (PLAN.md Phase 1 rules a–c).
{
  const core = compiled.get("core.css")!;
  const rules = [
    ...core.replace(/@property[^}]*}/g, "").matchAll(/([^{}]+)\{([^}]*)\}/g),
  ];
  const problems: string[] = [];
  for (const [, sel] of rules) {
    if (!/^\s*:where\(/.test(sel))
      problems.push(`rule \`${sel.trim()}\` is not zero-specificity`);
  }
  const themed = rules.find(([, sel]) => sel.includes("[theme]"))?.[2] ?? "";
  for (const m of themed.matchAll(
    /(--elevation-shadow-color|--theme--size-base--\d+)\s*:/g,
  ))
    problems.push(
      `${m[1]} is declared on [theme]; a :root override would not reach nested themes`,
    );
  for (const m of themed.matchAll(
    /--theme--(?:light|dark)--color--(?:secondary|tertiary|neutral(?:-variant)?)\s*:\s*([^;]*)/g,
  )) {
    if (!/\/\s*1\s*\)\s*$/.test(m[1]))
      problems.push(
        `derived palette ${m[0].split(":")[0]} does not pin alpha to 1`,
      );
  }
  if (problems.length)
    fail(`2 core.css cascade shape\n  ${problems.join("\n  ")}`);
  else ok("2 core.css cascade shape");
}
// Docs examples: each example HTML with the CSS it links, plus its inline styles.
if (existsSync(docsExamples)) {
  for (const file of readdirSync(docsExamples).filter((f) =>
    f.endsWith(".html"),
  )) {
    const html = readFileSync(join(docsExamples, file), "utf8");
    let css = "";
    for (const m of html.matchAll(/<link[^>]+href="([^"]+)"/g)) {
      const href = m[1];
      const base = basename(href);
      if (compiled.has(base)) css += compiled.get(base)!;
      else if (href.endsWith(".scss"))
        css += compileString(readFileSync(join(docsExamples, href), "utf8"), {
          loadPaths,
          url: new URL(`file://${join(docsExamples, href)}`),
          style: "compressed",
        }).css;
      else if (href.endsWith(".css")) {
        const p = join(docsExamples, href);
        if (existsSync(p)) css += readFileSync(p, "utf8");
        else fail(`2 ${file} links ${href}, which does not exist`);
      }
    }
    for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g))
      css += m[1];
    for (const m of html.matchAll(/style="([^"]*)"/g)) css += `x{${m[1]}}`;
    check2(`docs example ${file}`, css);
  }
} else {
  ok("2 docs examples (none yet)");
}

// ── 3. Contrast sweep ─────────────────────────────────────────────────────────
// Mirrors the CSS: the contrast base is black or white at the WCAG luminance
// crossover, judged on the clipped sRGB channels (what the browser paints);
// --contrast and --contrast--low mix the base toward the colour in OKLab by
// the shipped contrast-blend defaults; surfaces are the shipped tones (chroma
// capped, then scaled, alpha pinned to 1). The grid is swept as raw oklch
// points with chroma up to 0.45, so inputs outside sRGB, display-p3 and
// rec2020 are covered; translucent inputs are covered by the alpha grid.
{
  const core = compiled.get("core.css")!;
  const initial = (name: string): string =>
    core.match(
      new RegExp(`@property ${name}\\{[^}]*initial-value:([^}]*)\\}`),
    )?.[1] ?? "NaN";
  const blend = {
    high: parseFloat(initial("--theme--contrast-blend--high")) / 100,
    default: parseFloat(initial("--theme--contrast-blend")) / 100,
    low: parseFloat(initial("--theme--contrast-blend--low")) / 100,
  };
  // --color--<role>: light-dark(oklch(from var(--theme--light--color--<p>) L calc(min(c, CAP) * K) h / 1), oklch(... dark ...))
  type Tone = [number, number, number]; // [L, chroma cap, k]
  const tones: Record<string, { palette: string; light: Tone; dark: Tone }> =
    {};
  const oneTone = String.raw`oklch\(from var\(--theme--(?:light|dark)--color--([\w-]+)\)\s*([\d.]+)\s*calc\(min\(c, ([\d.]+)\) \* ([\d.]+)\) h\s*/\s*1\)`;
  const toneRe = new RegExp(
    String.raw`--color--([\w-]+):\s*light-dark\(\s*${oneTone},\s*${oneTone}\s*\)`,
    "g",
  );
  for (const m of core.matchAll(toneRe)) {
    tones[m[1]] = {
      palette: m[2],
      light: [+m[3], +m[4], +m[5]],
      dark: [+m[7], +m[8], +m[9]],
    };
  }
  const surfaces = Object.keys(tones).filter(
    (r) => r.startsWith("surface") && tones[r].palette === "neutral",
  );
  if (
    !("on-surface" in tones) ||
    surfaces.length < 8 ||
    !("surface-variant" in tones) ||
    !("on-surface-variant" in tones)
  ) {
    fail(
      `3 could not read the surface tones from core.css (found: ${Object.keys(tones).join(", ")})`,
    );
  }

  const black = new Color("srgb", [0, 0, 0]);
  const white = new Color("srgb", [1, 1, 1]);
  const painted = (c: Color) =>
    c.to("srgb").toGamut({ space: "srgb", method: "clip" });
  const luminance = (c: Color) => {
    const [r, g, b] = painted(c).to("srgb-linear").coords;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrastBase = (c: Color) => (luminance(c) < 0.179 ? white : black);
  const mixToward = (base: Color, c: Color, keep: number) =>
    base.mix(c, 1 - keep, { space: "oklab" });
  const ratio = (a: Color, b: Color) =>
    Color.contrastWCAG21(painted(a), painted(b));
  // Mirrors tone(): alpha is dropped because the CSS pins it to 1.
  const tone = (c: Color, [L, cap, k]: Tone) =>
    new Color("oklch", [
      L,
      Math.min(c.to("oklch").coords[1], cap) * k,
      c.to("oklch").coords[2] || 0,
    ]);

  let worst = {
    high: Infinity,
    default: Infinity,
    low: Infinity,
    surface: Infinity,
  };
  let n = 0;
  const problems: string[] = [];
  // Surfaces take only chroma and hue from the input, so they are swept once
  // per (C, h) at the L = 0.5 row rather than at every L.
  for (let h = 0; h < 360; h += 5) {
    for (let L = 0.05; L <= 0.951; L += 0.05) {
      for (const C of [0, 0.1, 0.2, 0.25, 0.3, 0.37, 0.45]) {
        const c = new Color("oklch", [L, C, h]);
        n++;
        const base = contrastBase(c);
        const high = mixToward(base, c, blend.high);
        const def = mixToward(base, c, blend.default);
        const low = mixToward(base, c, blend.low);
        const rh = ratio(high, c),
          rd = ratio(def, c),
          rl = ratio(low, c);
        worst.high = Math.min(worst.high, rh);
        worst.default = Math.min(worst.default, rd);
        worst.low = Math.min(worst.low, rl);
        const tag = `oklch(${L.toFixed(2)} ${C} ${h}) painted ${painted(c).toString({ format: "hex" })}`;
        if (rh < 4.5)
          problems.push(`--contrast--high ${rh.toFixed(2)} < 4.5 on ${tag}`);
        if (rd < 3) problems.push(`--contrast ${rd.toFixed(2)} < 3 on ${tag}`);
        // Surfaces: this colour as the neutral / neutral-variant input, both modes.
        if (Math.abs(L - 0.5) > 1e-9) continue;
        for (const mode of ["light", "dark"] as const) {
          const on = tone(c, tones["on-surface"][mode]);
          for (const role of surfaces) {
            const r = ratio(on, tone(c, tones[role][mode]));
            worst.surface = Math.min(worst.surface, r);
            if (r < 4.5)
              problems.push(
                `${mode} on-surface vs ${role} ${r.toFixed(2)} < 4.5 for neutral ${tag}`,
              );
          }
          const rv = ratio(
            tone(c, tones["on-surface-variant"][mode]),
            tone(c, tones["surface-variant"][mode]),
          );
          worst.surface = Math.min(worst.surface, rv);
          if (rv < 4.5)
            problems.push(
              `${mode} on-surface-variant vs surface-variant ${rv.toFixed(2)} < 4.5 for neutral-variant ${tag}`,
            );
        }
      }
    }
  }
  // Translucent inputs: the painted tone must not depend on the input alpha.
  for (const alpha of [0, 0.3]) {
    const c = new Color("oklch", [0.5, 0.2, 30], alpha);
    for (const mode of ["light", "dark"] as const) {
      const on = tone(c, tones["on-surface"][mode]);
      for (const role of surfaces) {
        const s = tone(c, tones[role][mode]);
        if (s.alpha !== 1 || on.alpha !== 1 || ratio(on, s) < 4.5)
          problems.push(
            `${mode} on-surface vs ${role} not opaque or < 4.5 for neutral with alpha ${alpha}`,
          );
      }
    }
  }
  const summary = `${n} colours; worst --contrast--high ${worst.high.toFixed(2)}, --contrast ${worst.default.toFixed(2)}, --contrast--low ${worst.low.toFixed(2)}, text on surfaces ${worst.surface.toFixed(2)}`;
  if (problems.length)
    fail(
      `3 contrast sweep: ${summary}\n  ${problems.slice(0, 20).join("\n  ")}${problems.length > 20 ? `\n  … ${problems.length - 20} more` : ""}`,
    );
  else ok(`3 contrast sweep: ${summary}`);
}

// ── 4. Size and registrations ─────────────────────────────────────────────────
for (const [name, css] of compiled) {
  const props = (css.match(/@property/g) || []).length;
  ok(
    `4 ${name}: ${(css.length / 1024).toFixed(1)} KB, ${(gzipSync(css).length / 1024).toFixed(1)} KB gzipped, ${props} @property`,
  );
}
// core.css registers exactly the twelve colour inputs plus the theme-level
// tuning variables (PLAN.md Phase 2), every one inheriting, and publishes that
// same list as --theme--animatable.
{
  const core = compiled.get("core.css")!;
  const palettes = [
    "primary",
    "secondary",
    "tertiary",
    "neutral",
    "neutral-variant",
    "error",
  ];
  const expected = [
    ...palettes.flatMap((p) => [
      `--theme--light--color--${p}`,
      `--theme--dark--color--${p}`,
    ]),
    ...["darker-2", "darker-1", "lighter-1", "lighter-2"].map(
      (l) => `--theme--blend--${l}`,
    ),
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `--theme--opacity--${i}`),
    "--theme--contrast-blend--high",
    "--theme--contrast-blend",
    "--theme--contrast-blend--low",
    "--theme--disabled-saturation",
    "--theme--disabled-foreground-opacity",
    "--theme--disabled-background-opacity",
    "--theme--density-scale",
  ];
  const rules = [...core.matchAll(/@property\s+(--[\w-]+)\s*\{([^}]*)\}/g)].map(
    (m) => ({ name: m[1], body: m[2] }),
  );
  const registered = rules.map((r) => r.name);
  const problems: string[] = [];
  for (const name of expected)
    if (!registered.includes(name)) problems.push(`${name} is not registered`);
  for (const r of rules) {
    if (!expected.includes(r.name))
      problems.push(`${r.name} is registered but is not an input`);
    if (!/inherits:\s*true/.test(r.body))
      problems.push(`${r.name} does not inherit`);
    if (!/initial-value:/.test(r.body))
      problems.push(`${r.name} has no initial value`);
  }
  const animatable =
    core
      .match(/--theme--animatable:\s*([^;}]*)/)?.[1]
      .split(",")
      .map((s) => s.trim()) ?? [];
  if (animatable.join() !== registered.join())
    problems.push(
      `--theme--animatable does not list the registered names in order\n    animatable: ${animatable.join(", ")}\n    registered: ${registered.join(", ")}`,
    );
  if (problems.length)
    fail(`4 core.css registrations\n  ${problems.join("\n  ")}`);
  else
    ok(
      `4 core.css registers ${registered.length} inputs (${palettes.length * 2} colours + ${registered.length - palettes.length * 2} tuning), all listed in --theme--animatable`,
    );
}

// ── 5. Docs chapter order ─────────────────────────────────────────────────────
ok(
  existsSync(docsExamples)
    ? "5 docs chapter order: not implemented yet (Phase 5)"
    : "5 docs chapter order (no docs yet)",
);

process.exit(failed ? 1 : 0);
