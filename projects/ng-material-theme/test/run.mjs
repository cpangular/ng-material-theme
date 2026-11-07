// Verification runner (PLAN.md, "Verification"). Step 1 only for now:
// every entry in css/src must compile. Later steps are added by Phase 1 and 2.
import { compile } from "sass";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const srcDir = new URL("../css/src/", import.meta.url).pathname;
const entries = readdirSync(srcDir).filter((f) => f.endsWith(".scss") && !f.startsWith("_"));
let failed = 0;
for (const entry of entries) {
  try {
    const { css } = compile(join(srcDir, entry), { loadPaths: ["node_modules"], style: "compressed" });
    console.log(`ok   ${entry} (${(css.length / 1024).toFixed(1)} KB)`);
  } catch (e) {
    failed++;
    console.error(`FAIL ${entry}\n${e.message}`);
  }
}
if (entries.length === 0) {
  console.error("FAIL no entries found in css/src");
  failed++;
}
process.exit(failed ? 1 : 0);
