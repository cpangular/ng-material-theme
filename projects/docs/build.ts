// Docs build. Run directly with Node 24 (type stripping).
//
//   node build.ts          build the site into dist/
//   node build.ts --check  run the checks only (the library's `pnpm test`, step 5)
//
// Layout of src/:
//   NN-slug.html   one body fragment per chapter: an <h1>, then sections.
//                  Two directives are expanded:
//                    <!-- example: examples/NN-name.html -->  the page in an <iframe>
//                    <!-- include: examples/NN-name.ext -->   its escaped source (any extension)
//   index.html     the landing page fragment
//   examples/      standalone example pages with their own .css/.scss/.js/.json;
//                  non-partial .scss compiles to dist/examples/*.css
//   chrome.css     site chrome only; never loaded by an example
//   chrome.ts      the site's theme select and mode buttons (transpiled to dist/chrome.js)
//
// Checks (any failure exits 1):
//   - every example file is numbered NN- and belongs to a chapter;
//   - an example of chapter N matches no pattern introduced after N (the table below);
//   - an example loads only ../core.css, the theme switcher (chapter 12 on, as
//     ../theme-switcher.js or through an import map as the package specifier)
//     and files of its own chapter, counting module imports and fetch() too;
//   - every chapter embeds at least one example of its own number and includes the
//     source of each of its own pages it embeds; every directive names a file that exists.
import { compile, NodePackageImporter } from "sass";
import ts from "typescript";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, join, resolve } from "node:path";

const root = resolve(dirname(new URL(import.meta.url).pathname));
const src = join(root, "src");
const examplesDir = join(src, "examples");
const dist = join(root, "dist");
const lib = join(root, "node_modules/@cpangular/ng-material-theme/css/dist");
const checkOnly = process.argv.includes("--check");

// ── Chapter table (PLAN.md, Phase 5) ─────────────────────────────────────────
const chapters = [
  { n: 1, slug: "getting-started", title: "Getting started" },
  { n: 2, slug: "light-and-dark", title: "Light and dark" },
  { n: 3, slug: "your-colours", title: "Your colours" },
  { n: 4, slug: "variants", title: "Variants" },
  { n: 5, slug: "surfaces-and-elevation", title: "Surfaces and elevation" },
  { n: 6, slug: "themes", title: "Themes" },
  { n: 7, slug: "using-sass", title: "Using Sass" },
  { n: 8, slug: "custom-palettes", title: "Custom palettes" },
  { n: 9, slug: "containers", title: "Containers" },
  { n: 10, slug: "tuning", title: "Tuning" },
  { n: 11, slug: "sizes-and-density", title: "Sizes and density" },
  { n: 12, slug: "runtime-switching", title: "Runtime switching" },
  { n: 13, slug: "animating", title: "Animating theme changes" },
  { n: 14, slug: "data-driven", title: "Data-driven themes" },
  { n: 15, slug: "angular-material", title: "Angular Material" },
];

// ── Pattern table: what each chapter introduces, as it appears in a source ──
// An example of chapter N must not match a pattern whose chapter is above N.
const patterns: { re: RegExp; chapter: number; what: string }[] = [
  { re: /color-scheme/, chapter: 2, what: "color-scheme" },
  {
    re: /--theme--(?:light|dark)--color--/,
    chapter: 3,
    what: "input variables",
  },
  // --contrast--high is chapter 3's (the text colour for small text); the
  // rest of the contrast and variant family is chapter 4's.
  { re: /--contrast--high/, chapter: 3, what: "--contrast--high" },
  {
    re: /--contrast--low|-(?:lighter|darker|higher|lower)-\d|-tint-\d|-disabled|-reverse-mode/,
    chapter: 4,
    what: "variants",
  },
  {
    re: /--color--(?:on-)?(?:surface|background|outline)|--elevation-/,
    chapter: 5,
    what: "surfaces and elevation",
  },
  { re: /theme=/, chapter: 6, what: "the theme attribute" },
  { re: /@use|\.scss/, chapter: 7, what: "Sass" },
  { re: /apply-container/, chapter: 9, what: "apply-container" },
  {
    // the variables, the per-palette -override suffix, and the createTheme()
    // tuning keys, which are always followed by a map: `blends: (`
    re: /--theme--(?:blend|opacity|contrast-blend|disabled)|-override\b|(?<![$\w-])(?:blends|opacities|contrast-blends|disabled)\s*:\s*\(/,
    chapter: 10,
    what: "tuning",
  },
  { re: /--theme--size|density/, chapter: 11, what: "sizes and density" },
  { re: /<script|themeSwitcher/i, chapter: 12, what: "JavaScript" },
  { re: /--theme--animatable/, chapter: 13, what: "--theme--animatable" },
  { re: /defineTheme/, chapter: 14, what: "defineTheme" },
  { re: /\bmat-|--mat-sys/, chapter: 15, what: "Angular Material" },
];

let failures = 0;
const fail = (msg: string) => {
  failures++;
  console.error(`FAIL ${msg}`);
};
const escapeHtml = (s: string) =>
  s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
const chapterOf = (file: string) => {
  const m = /^(\d\d)-/.exec(file);
  return m ? Number(m[1]) : NaN;
};

// ── Check 1: example files ───────────────────────────────────────────────────
const exampleFiles = existsSync(examplesDir)
  ? readdirSync(examplesDir).sort()
  : [];
for (const file of exampleFiles) {
  const n = chapterOf(file);
  const text = readFileSync(join(examplesDir, file), "utf8");
  if (!chapters.some((c) => c.n === n)) {
    fail(`examples/${file}: not numbered after a chapter (NN-name.ext)`);
    continue;
  }
  for (const p of patterns) {
    if (p.chapter <= n) continue;
    const m = p.re.exec(text);
    if (m)
      fail(
        `examples/${file} (chapter ${n}) uses ${p.what} ("${m[0]}"), introduced in chapter ${p.chapter}`,
      );
  }
  if (file.endsWith(".html")) {
    // Everything an example loads: stylesheet links, script src, module
    // imports, import-map targets and fetch() URLs.
    const refs = [
      ...text.matchAll(
        /<link[^>]+href="([^"]+)"|<script[^>]+src="([^"]+)"|\bfrom\s+"([^"]+)"|^\s*import\s+"([^"]+)"|"imports"\s*:\s*\{[^}]*?"[^"]+"\s*:\s*"([^"]+)"|\bfetch\(\s*"([^"]+)"/gm,
      ),
    ].map((m) => m.slice(1).find((g) => g !== undefined)!);
    for (const ref of refs) {
      const own = chapterOf(ref) === n && !ref.includes("/");
      const core = ref === "../core.css";
      const switcher =
        n >= 12 &&
        (ref === "../theme-switcher.js" ||
          ref === "@cpangular/ng-material-theme/theme-switcher");
      if (!own && !core && !switcher)
        fail(
          `examples/${file}: loads ${ref}; an example loads only ../core.css${n >= 12 ? ", the theme switcher" : ""} and files of its own chapter`,
        );
    }
    if (!/<link[^>]+href="(?:\.\.\/core\.css|\d\d-[\w-]+\.css)"/.test(text))
      fail(
        `examples/${file}: does not load core.css or a stylesheet of its own`,
      );
  }
}

// ── Directive expansion ──────────────────────────────────────────────────────
const sourceLabel: Record<string, string> = {
  ".html": "HTML",
  ".css": "CSS",
  ".scss": "Sass",
  ".js": "JavaScript",
  ".json": "JSON",
};

function expand(chapterFile: string, body: string, n: number): string {
  const embedded: string[] = [];
  const included: string[] = [];
  const out = body.replace(
    /<!--\s*(example|include):\s*(\S+)\s*-->/g,
    (_, kind: string, path: string) => {
      const abs = join(src, path);
      if (!existsSync(abs)) {
        fail(`${chapterFile}: ${kind} ${path} does not exist`);
        return "";
      }
      if (kind === "example") {
        if (!path.endsWith(".html")) {
          fail(`${chapterFile}: example ${path} is not an .html page`);
          return "";
        }
        embedded.push(path);
        return `<figure class="example">
<iframe src="${path}" title="Example: ${path}" loading="lazy"></iframe>
<figcaption><a href="${path}" target="_blank" rel="noopener">Open ${path} in a new tab</a></figcaption>
</figure>`;
      }
      included.push(path);
      const ext = extname(path);
      return `<figure class="source">
<figcaption>${path}<span>${sourceLabel[ext] ?? ext}</span></figcaption>
<pre><code>${escapeHtml(readFileSync(abs, "utf8").trimEnd())}</code></pre>
</figure>`;
    },
  );
  if (!embedded.some((p) => chapterOf(p.replace(/^examples\//, "")) === n))
    fail(
      `${chapterFile}: chapter ${n} embeds no example of its own (examples/${String(n).padStart(2, "0")}-*.html)`,
    );
  // An earlier chapter's example may be embedded again for comparison; its
  // source is shown in its own chapter.
  for (const p of embedded)
    if (chapterOf(p.replace(/^examples\//, "")) === n && !included.includes(p))
      fail(`${chapterFile}: embeds ${p} but never includes its source`);
  return out;
}

// ── Pages ────────────────────────────────────────────────────────────────────
const written = chapters
  .map((c) => ({
    ...c,
    file: `${String(c.n).padStart(2, "0")}-${c.slug}.html`,
  }))
  .filter((c) => existsSync(join(src, c.file)));

function page(title: string, body: string, current: string): string {
  const nav = written
    .map(
      (c) =>
        `<li><a href="${c.file}"${c.file === current ? ' aria-current="page"' : ""}><span class="n">${c.n}</span>${c.title}</a></li>`,
    )
    .join("\n");
  const ref = `<a href="reference.html"${current === "reference.html" ? ' aria-current="page"' : ""}>Reference</a>`;
  return `<!doctype html>
<html lang="en" theme="indigo">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} · ng-material-theme</title>
<link rel="stylesheet" href="core.css">
<link rel="stylesheet" href="chrome.css">
<script>
try {
  var t = localStorage.getItem("@cpangular/ng-material-theme.selectedTheme"), s = localStorage.getItem("@cpangular/ng-material-theme.colorScheme");
  if (t) document.documentElement.setAttribute("theme", t);
  if (s === "light" || s === "dark") document.documentElement.style.colorScheme = s;
} catch (e) {}
</script>
<script type="importmap">{"imports":{"@cpangular/ng-material-theme/theme-switcher":"./theme-switcher.js"}}</script>
<script type="module" src="chrome.js"></script>
</head>
<body>
<header class="site-header">
<a class="site-title" href="index.html">ng-material-theme</a>
<div class="site-controls">
<label>Theme <select id="site-theme" aria-label="Site theme"></select></label>
<div class="scheme" role="group" aria-label="Colour scheme">
<button type="button" data-scheme="light">Light</button><button type="button" data-scheme="dark">Dark</button><button type="button" data-scheme="auto">Auto</button>
</div>
</div>
</header>
<div class="site-body">
<nav class="site-nav" aria-label="Chapters">
<ol>
${nav}
</ol>
<p class="nav-ref">${ref}</p>
</nav>
<main class="site-main">
${body}
</main>
</div>
</body>
</html>
`;
}

const titleOf = (body: string, fallback: string) =>
  /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(body)?.[1].replace(/<[^>]+>/g, "") ??
  fallback;

const pages: { file: string; html: string }[] = [];
for (const c of written) {
  const body = expand(c.file, readFileSync(join(src, c.file), "utf8"), c.n);
  pages.push({
    file: c.file,
    html: page(titleOf(body, c.title), body, c.file),
  });
}
if (existsSync(join(src, "index.html"))) {
  const body = readFileSync(join(src, "index.html"), "utf8").replace(
    "<!-- chapters -->",
    `<ol class="toc">${written.map((c) => `<li><a href="${c.file}">${c.title}</a></li>`).join("")}</ol>`,
  );
  pages.push({
    file: "index.html",
    html: page("Documentation", body, "index.html"),
  });
}

// ── Reference page from the compiled core.css ────────────────────────────────
function reference(core: string): string {
  const registered = [
    ...core.matchAll(
      /@property\s+(--[\w-]+)\s*\{[^}]*?syntax:\s*"([^"]*)"[^}]*?initial-value:\s*([^;}]*)/g,
    ),
  ].map((m) => ({ name: m[1], syntax: m[2], initial: m[3].trim() }));
  const declared: string[] = [];
  const seen = new Set<string>();
  for (const rule of core
    .replace(/@property[^}]*}/g, "")
    .matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    if (!rule[1].includes(":root")) continue;
    for (const d of rule[2].matchAll(/(?:^|;)\s*(--[\w-]+)\s*:/g))
      if (!seen.has(d[1])) {
        seen.add(d[1]);
        declared.push(d[1]);
      }
  }
  const palettes = [
    "primary",
    "secondary",
    "tertiary",
    "neutral-variant",
    "neutral",
    "error",
  ];
  const groups = new Map<string, string[]>();
  const add = (g: string, name: string) => {
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(name);
  };
  for (const name of declared) {
    if (name.startsWith("--color--")) {
      const rest = name.slice("--color--".length);
      const p = palettes.find((p) => rest === p || rest.startsWith(p + "-"));
      if (!p) add("Surfaces and outlines", name);
      else if (
        !/^--(?:blend|opacity|contrast-blend|disabled-)/.test(
          rest.slice(p.length),
        )
      )
        add(p, name);
    } else if (
      name.startsWith("--elevation-") &&
      name !== "--elevation-shadow-color"
    )
      add("Elevation", name);
    else if (/^--theme--size--\d/.test(name)) add("Sizes", name);
  }
  const sectionsOrder = [
    "primary",
    "secondary",
    "tertiary",
    "neutral",
    "neutral-variant",
    "error",
    "Surfaces and outlines",
    "Elevation",
    "Sizes",
  ];
  const colourSwatch = (name: string, group: string[]) => {
    const m = /^(.*?)(--contrast(?:--high|--low)?)$/.exec(name);
    const on = /^--color--on-(.*)$/.exec(name);
    let bg: string, fg: string;
    if (m) {
      bg = `var(${m[1]})`;
      fg = `var(${name})`;
    } else if (on) {
      // on-surface, on-background, on-surface-variant: text on their counterpart
      bg = `var(--color--${on[1]})`;
      fg = `var(${name})`;
    } else {
      bg = `var(${name})`;
      fg = group.includes(`${name}--contrast`)
        ? `var(${name}--contrast)`
        : "var(--color--on-surface)";
    }
    return `<div class="sw" style="--bg:${bg};--fg:${fg}"><code>${name}</code></div>`;
  };
  let body = `<h1>Reference</h1>
<p>Every token <code>core.css</code> defines, drawn live. Change the theme and the colour scheme with the controls at the top of the page. Tokens are listed in the order <code>core.css</code> declares them.</p>
<p class="toc-inline">${sectionsOrder.map((s) => `<a href="#${s.toLowerCase().replace(/\W+/g, "-")}">${s}</a>`).join(" · ")} · <a href="#inputs">Inputs and tuning</a></p>`;
  for (const s of sectionsOrder) {
    const names = groups.get(s) ?? [];
    const id = s.toLowerCase().replace(/\W+/g, "-");
    body += `<section id="${id}"><h2>${palettes.includes(s) ? `<code>${s}</code> palette` : s} <small>${names.length} tokens</small></h2>`;
    if (s === "Elevation")
      body += `<div class="ref-elevation">${names.map((n) => `<div class="el" style="box-shadow:var(${n})"><code>${n}</code></div>`).join("")}</div>`;
    else if (s === "Sizes")
      body += `<div class="ref-sizes">${names.map((n) => `<div class="sz"><code>${n}</code><span style="width:var(${n});height:var(${n})"></span></div>`).join("")}</div>`;
    else
      body += `<div class="swatches">${names.map((n) => colourSwatch(n, names)).join("")}</div>`;
    body += `</section>`;
  }
  body += `<section id="inputs"><h2>Inputs and tuning <small>${registered.length} registered properties</small></h2>
<p>The only registered custom properties. Each inherits, and its initial value is the library default, so a theme that does not set one inherits it.</p>
<table><thead><tr><th>Property</th><th>Syntax</th><th>Initial value</th></tr></thead><tbody>
${registered.map((r) => `<tr><td><code>${r.name}</code></td><td><code>${escapeHtml(r.syntax)}</code></td><td><code>${escapeHtml(r.initial)}</code>${r.syntax === "<color>" ? ` <span class="sw-inline" style="background:${escapeHtml(r.initial)}"></span>` : ""}</td></tr>`).join("\n")}
</tbody></table></section>`;
  return body;
}

// ── Emit ─────────────────────────────────────────────────────────────────────
if (failures) {
  console.error(`\n${failures} docs check failure(s)`);
  process.exit(1);
}
if (checkOnly) {
  console.log(
    `ok   docs checks: ${exampleFiles.length} example files, ${written.length} chapters`,
  );
  process.exit(0);
}

if (!existsSync(join(lib, "core.css")))
  throw new Error(
    `${join(lib, "core.css")} not found; build the library first`,
  );
rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, "examples"), { recursive: true });

for (const f of ["core.css", "theme-switcher.js", "theme-switcher.js.map"])
  copyFileSync(join(lib, f), join(dist, f));
copyFileSync(join(src, "chrome.css"), join(dist, "chrome.css"));
writeFileSync(
  join(dist, "chrome.js"),
  ts.transpileModule(readFileSync(join(src, "chrome.ts"), "utf8"), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
    },
  }).outputText,
);

let compiledScss = 0;
for (const file of exampleFiles) {
  const from = join(examplesDir, file);
  if (file.endsWith(".scss")) {
    if (file.startsWith("_")) continue;
    const { css } = compile(from, {
      importers: [new NodePackageImporter(root)],
      loadPaths: [join(root, "node_modules")],
      style: "compressed",
    });
    writeFileSync(join(dist, "examples", file.replace(/\.scss$/, ".css")), css);
    compiledScss++;
  } else copyFileSync(from, join(dist, "examples", file));
}

const core = readFileSync(join(lib, "core.css"), "utf8");
pages.push({
  file: "reference.html",
  html: page("Reference", reference(core), "reference.html"),
});
for (const p of pages) writeFileSync(join(dist, p.file), p.html);

console.log(
  `ok   docs: ${written.length} chapters + index + reference, ${exampleFiles.length} example files (${compiledScss} Sass) → ${dist}`,
);
