// Browser check for the demo (not part of CI): renders dist/index.html in
// headless Chromium in light and dark mode, screenshots the surface ladder,
// and measures the painted WCAG contrast of every surface tile, sub-theme
// button and palette swatch. Fails when text on a surface or a non-disabled
// swatch's --contrast--high is below 4.5:1, or its --contrast below 3:1.
//
//   pnpm build && npx playwright install chromium && pnpm check:browser
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const demo = resolve(dirname(new URL(import.meta.url).pathname), "..");
const outDir = resolve(demo, "test/out");
mkdirSync(outDir, { recursive: true });
const server = spawn(
  "python3",
  ["-m", "http.server", "8765", "--bind", "127.0.0.1"],
  { cwd: resolve(demo, "dist"), stdio: "ignore" },
);
await new Promise((r) => setTimeout(r, 700));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1300, height: 900 } });
page.on("pageerror", (e) => console.error("page error:", e.message));
await page.goto("http://127.0.0.1:8765/index.html");

// Runs in the page. Colours are resolved by painting them on a canvas, so the
// measurement is of what Chromium displays, including gamut clipping.
const measure = () => {
  const lum = (c) => {
    const [r, g, b] = c.map((v) =>
      (v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const cv = document.createElement("canvas");
  cv.width = cv.height = 1;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  const paint = (...layers) => {
    ctx.clearRect(0, 0, 1, 1);
    for (const l of layers) {
      ctx.fillStyle = l;
      ctx.fillRect(0, 0, 1, 1);
    }
    return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  };
  const ratio = (fg, bg, under = "white") => {
    const b = lum(paint(under, bg)),
      f = lum(paint(under, bg, fg));
    return +((Math.max(f, b) + 0.05) / (Math.min(f, b) + 0.05)).toFixed(2);
  };
  const tiles = [...document.querySelectorAll(".surface-tile")].map((t) => {
    const cs = getComputedStyle(t);
    return {
      tile: t.querySelector("strong").textContent,
      bg: cs.backgroundColor,
      ratio: ratio(cs.color, cs.backgroundColor),
    };
  });
  const buttons = [...document.querySelectorAll("[theme] button")].map((b) => {
    const cs = getComputedStyle(b);
    return {
      theme: b.closest("[theme]").getAttribute("theme"),
      bg: cs.backgroundColor,
      ratio: ratio(cs.color, cs.backgroundColor),
    };
  });
  const swatches = [...document.querySelectorAll(".swatch-quarter")].map(
    (q) => {
      const cs = getComputedStyle(q);
      const card = getComputedStyle(q.closest(".color-card")).backgroundColor;
      const text = (sel) =>
        ratio(
          getComputedStyle(q.querySelector(sel)).color,
          cs.backgroundColor,
          card,
        );
      return {
        swatch: q
          .closest(".color-swatch")
          .className.replace("color-swatch ", ""),
        quarter: q.className.replace("swatch-quarter ", ""),
        disabled: q.className.includes("disabled"),
        high: text(".contrast-high"),
        default: text(".swatch-label"),
        low: text(".contrast-low"),
      };
    },
  );
  return { tiles, buttons, swatches };
};

let failed = 0;
for (const mode of ["light", "dark"]) {
  await page.evaluate((m) => {
    document.documentElement.style.colorScheme = m;
  }, mode);
  await page.waitForTimeout(100);
  const r = await page.evaluate(measure);
  console.log(`\n== ${mode} ==`);
  console.table(r.tiles);
  console.table(r.buttons);
  const live = r.swatches.filter((s) => !s.disabled);
  const min = (k) => Math.min(...live.map((s) => s[k]));
  console.log(
    `${live.length} non-disabled swatches: worst --contrast--high ${min("high")}, --contrast ${min("default")}, --contrast--low ${min("low")}`,
  );
  const bad = [
    ...r.tiles
      .filter((t) => t.ratio < 4.5)
      .map((t) => `surface tile ${t.tile}: ${t.ratio}`),
    ...live
      .filter((s) => s.high < 4.5)
      .map((s) => `${s.swatch}/${s.quarter} --contrast--high ${s.high} < 4.5`),
    ...live
      .filter((s) => s.default < 3)
      .map((s) => `${s.swatch}/${s.quarter} --contrast ${s.default} < 3`),
  ];
  for (const b of bad) console.error(`FAIL ${mode}: ${b}`);
  failed += bad.length;
  await page
    .locator(".surface-demo")
    .screenshot({ path: `${outDir}/surfaces-${mode}.png` });
  await page.screenshot({ path: `${outDir}/page-${mode}.png` });
}
await browser.close();
server.kill();
console.log(
  failed
    ? `\n${failed} failure(s)`
    : "\nok   browser check (screenshots in test/out/)",
);
process.exit(failed ? 1 : 0);
