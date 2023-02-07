import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { genNgMaterialThemeData } from './theming/genNgMaterialThemeData';
var cssData = genNgMaterialThemeData();

const cssPath = '../NgMaterialApp/src/_theme.scss';
writeFileSync(cssPath, cssData, { encoding: 'utf-8' });