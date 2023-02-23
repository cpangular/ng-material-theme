import Enumerable from "linq";
import { CssColorModeDiffView } from "./CssColorModeDiffView";
import { CssDensityDiffView } from "./CssDensityDiffView";
import { CssDiffView } from "./CssDiffView";
import { CssPropertyRecord } from "./CssPropertyRecord";

export interface ThemeFileDatabase {
  cssProperties: Enumerable.IEnumerable<CssPropertyRecord>;
  differencesView: Enumerable.IEnumerable<CssDiffView>;
  colorDifferencesView: Enumerable.IEnumerable<CssColorModeDiffView>;
  densityDifferencesView: Enumerable.IEnumerable<CssDensityDiffView>;
}
