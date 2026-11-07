// Demo build, run directly by Node 24 (type stripping) after sass has compiled
// src/styles.scss to dist/styles.css: copies the page, core.css and the
// switcher to dist/, and writes dist/crossfade.html as a single self-contained
// file (core.css inlined) that can be opened in any browser from any folder.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const demo = resolve(dirname(new URL(import.meta.url).pathname));
const lib = join(demo, "node_modules/@cpangular/ng-material-theme/css/dist");
const dist = join(demo, "dist");
mkdirSync(dist, { recursive: true });

copyFileSync(join(demo, "src/index.html"), join(dist, "index.html"));
for (const f of ["core.css", "theme-switcher.js"])
  copyFileSync(join(lib, f), join(dist, f));

const core = readFileSync(join(lib, "core.css"), "utf8");
const link = '<link rel="stylesheet" href="core.css" />';
const page = readFileSync(join(demo, "src/crossfade.html"), "utf8");
if (!page.includes(link)) throw new Error(`crossfade.html: ${link} not found`);
writeFileSync(
  join(dist, "crossfade.html"),
  page.replace(link, `<style>\n${core}\n</style>`),
);
console.log("dist/index.html, dist/crossfade.html (self-contained)");
