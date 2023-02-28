import { writeFileSync } from "fs";
import { ThemeRegistry } from "./lib/ThemeRegistry";
import { options } from "./options";

export function witeRegisteredVariablesReport() {
  if (!options.transformations || !options.write) return;

  const view = ThemeRegistry.variablesQuery
    .groupBy(
      (v) => v.theme,
      (v) => v.name,
      (theme, names) => ({
        theme,
        properties: names
          .distinct()
          .orderBy((v) => v)
          .toArray(),
      })
    )
    .orderBy((v) => v.theme)
    .toArray();

  view.unshift({
    theme: "*",
    properties: ThemeRegistry.variablesQuery
      .select((v) => v.name)
      .distinct()
      .orderBy((v) => v)
      .toArray(),
  });

  view.push({
    theme: "-generated-",
    properties: ThemeRegistry.generatedVariablesQuery
      .select((v) => v.name)
      .distinct()
      .orderBy((v) => v)
      .toArray(),
  });

  writeFileSync("./dist/registeredVariables.json", JSON.stringify(view, undefined, 2), { encoding: "utf-8" });
}
