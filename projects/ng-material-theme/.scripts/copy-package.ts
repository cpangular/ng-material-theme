import { PackageJson } from "type-fest";
import { readJsonFile, writeJsonFile } from "@cpdevtools/lib-node-utilities";

(async () => {
  const pkg = (await readJsonFile("./package.json")) as PackageJson;
  delete pkg.devDependencies;
  delete pkg.scripts;
  delete (pkg as any)["lint-staged"];

  if (pkg.typings?.startsWith("./dist/")) {
    pkg.typings = "." + pkg.typings.slice(6);
  }

  if (pkg.main?.startsWith("./dist/")) {
    pkg.main = "." + pkg.main.slice(6);
  }

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
        }
      }
    }
  }

  await writeJsonFile("./dist/package.json", pkg, 2);
})();
