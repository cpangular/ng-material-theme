import { writeFileSync, mkdirSync } from "fs";
import { generateThemeData } from "./generator/generate-theme-data";

mkdirSync("dist/scss", { recursive: true });

writeFileSync("dist/scss/_theme-data.scss", generateThemeData(), { encoding: "utf-8" });
