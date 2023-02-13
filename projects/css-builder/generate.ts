import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { genNgMaterialThemeData } from "./theming/converter/genNgMaterialThemeData";
var cssData = genNgMaterialThemeData();

const cssPath = "../NgMaterialApp/src/_theme.scss";
