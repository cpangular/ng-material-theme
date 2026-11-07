// Browser check for the docs (not part of CI): serves dist/, renders every
// example page in headless Chromium in light and dark mode, screenshots each
// to test/out/, and reports any visible text painted below 4.5:1 against its
// background, except inside elements that opt out with data-contrast="low"
// (decorative text, disabled controls, deliberately low emphasis).
//
//   pnpm build && npx playwright install chromium && pnpm check:browser
// Run directly with Node 24 (type stripping).
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const docs = resolve(dirname(new URL(import.meta.url).pathname), "..");
const dist = join(docs, "dist");
const outDir = join(docs, "test/out");
mkdirSync(outDir, { recursive: true });
const port = 8766;
const server = spawn(
  "python3",
  ["-m", "http.server", String(port), "--bind", "127.0.0.1"],
  { cwd: dist, stdio: "ignore" },
);
await new Promise((r) => setTimeout(r, 700));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
page.on("pageerror", (e) => console.error("page error:", e.message));

// Runs in the page: for every element with its own text, paint its colour over
// the nearest non-transparent background on a canvas and compute WCAG contrast.
const measure = () => {
  const lum = (c: number[]) => {
    const [r, g, b] = c.map((v) =>
      (v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const cv = document.createElement("canvas");
  cv.width = cv.height = 1;
  const ctx = cv.getContext("2d", { willReadFrequently: true })!;
  const paint = (layers: string[]) => {
    ctx.clearRect(0, 0, 1, 1);
    for (const l of layers) {
      ctx.fillStyle = l;
      ctx.fillRect(0, 0, 1, 1);
    }
    return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  };
  const transparent = (c: string) =>
    c === "rgba(0, 0, 0, 0)" || c === "transparent";
  const layersBehind = (el: Element) => {
    const layers: string[] = [];
    for (let e: Element | null = el; e; e = e.parentElement) {
      const bg = getComputedStyle(e).backgroundColor;
      if (!transparent(bg)) {
        layers.unshift(bg);
        if (!/rgba\(.*,\s*0?\.\d+\)$/.test(bg)) break; // opaque: stop
      }
    }
    const canvas =
      getComputedStyle(document.documentElement).colorScheme.includes("dark") &&
      !document.body.style.background
        ? "rgb(18,18,18)"
        : "white";
    return [canvas, ...layers];
  };
  const results: { text: string; ratio: number; fg: string; bg: string }[] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set<Element>();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement!;
    if (!n.textContent?.trim() || seen.has(el)) continue;
    seen.add(el);
    if (el.closest('[data-contrast="low"]')) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const behind = layersBehind(el);
    const b = lum(paint(behind));
    const f = lum(paint([...behind, cs.color]));
    const ratio = +((Math.max(f, b) + 0.05) / (Math.min(f, b) + 0.05)).toFixed(
      2,
    );
    results.push({
      text: n.textContent.trim().slice(0, 40),
      ratio,
      fg: cs.color,
      bg: behind.at(-1)!,
    });
  }
  return results;
};

const examples = readdirSync(join(dist, "examples")).filter((f) =>
  f.endsWith(".html"),
);
let low = 0;
for (const file of examples) {
  await page.goto(`http://127.0.0.1:${port}/examples/${file}`);
  for (const mode of ["light", "dark"]) {
    await page.evaluate((m) => {
      document.documentElement.style.colorScheme = m;
    }, mode);
    await page.waitForTimeout(80);
    await page.screenshot({
      path: join(outDir, `${file.replace(/\.html$/, "")}-${mode}.png`),
      fullPage: true,
    });
    const r = await page.evaluate(measure);
    const bad = r.filter((x) => x.ratio < 4.5);
    const worst = Math.min(...r.map((x) => x.ratio));
    console.log(
      `${file} ${mode}: ${r.length} text runs, worst ${worst}${bad.length ? "" : " ok"}`,
    );
    for (const x of bad)
      console.log(`  low ${x.ratio}: "${x.text}" ${x.fg} on ${x.bg}`);
    low += bad.length;
  }
}
// The chapter pages, for a visual check of the chrome.
for (const file of ["index.html", "reference.html"]) {
  await page.goto(`http://127.0.0.1:${port}/${file}`);
  await page.waitForTimeout(300);
  await page.screenshot({
    path: join(outDir, file.replace(/\.html$/, ".png")),
    fullPage: false,
  });
}
await browser.close();
server.kill();
console.log(
  low
    ? `\n${low} text run(s) below 4.5:1 (screenshots in test/out/)`
    : "\nok   browser check (screenshots in test/out/)",
);
