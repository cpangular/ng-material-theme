// Verification runner (PLAN.md, "Verification"). Run directly with Node 24 (type stripping).
//   1. Sass compiles all entries.
//   2. Every var(--x) without a fallback is declared in the CSS it is used with,
//      and no unregistered light-dark()-valued property is a `from var(--x)` origin.
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
// the shipped contrast-blend defaults; surfaces are the shipped tones. The
// grid is swept as raw oklch points, so out-of-gamut inputs are covered too.
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
  // --color--<role>: light-dark(oklch(from var(--theme--light--color--<p>) L calc(c * K) h), oklch(... dark ...))
  type Tone = [number, number];
  const tones: Record<string, { palette: string; light: Tone; dark: Tone }> =
    {};
  const toneRe =
    /--color--([\w-]+):\s*light-dark\(\s*oklch\(from var\(--theme--light--color--([\w-]+)\)\s*([\d.]+)\s*calc\(c \* ([\d.]+)\) h\),\s*oklch\(from var\(--theme--dark--color--[\w-]+\)\s*([\d.]+)\s*calc\(c \* ([\d.]+)\) h\)\s*\)/g;
  for (const m of core.matchAll(toneRe)) {
    tones[m[1]] = {
      palette: m[2],
      light: [+m[3], +m[4]],
      dark: [+m[5], +m[6]],
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
  const tone = (c: Color, [L, k]: Tone) =>
    new Color("oklch", [
      L,
      c.to("oklch").coords[1] * k,
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
  for (let h = 0; h < 360; h += 15) {
    for (let L = 0.05; L <= 0.951; L += 0.05) {
      for (const C of [0, 0.1, 0.2]) {
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

// ── 5. Docs chapter order ─────────────────────────────────────────────────────
ok(
  existsSync(docsExamples)
    ? "5 docs chapter order: not implemented yet (Phase 5)"
    : "5 docs chapter order (no docs yet)",
);

process.exit(failed ? 1 : 0);
