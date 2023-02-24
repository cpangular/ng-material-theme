import { PackageJson } from "type-fest";
import { readJsonFile, writeJsonFile } from "@cpdevtools/lib-node-utilities";

(async () => {
  const pkg = (await readJsonFile("./package.json")) as PackageJson;
  delete pkg.devDependencies;
  delete pkg.scripts;
  delete (pkg as any)["lint-staged"];
  pkg.typings = "./index.d.ts";
  pkg.main = "./index.js";

  const exports = pkg.exports as {
    [path: string]: PackageJson.Exports;
  };
  if (pkg.exports) {
    for (const key in exports) {
      const exp = exports[key] as { [path: string]: string } | string;
      if (typeof exp === "string") {
        if (exp.startsWith("./dist/")) {
          exports[key] = "." + exp.slice(6);
        }
      } else {
        for (const k in exp) {
          if (exp[k].startsWith("./dist/")) {
            exp[k] = "." + exp[k].slice(6);
          }
          if (exp[k].startsWith("./src/")) {
            exp[k] = "." + exp[k].slice(5);
          }
        }
      }
    }
  }

  await writeJsonFile("./dist/package.json", pkg, 2);
})();
