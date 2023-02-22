import { CssPropertyRecord } from "./CssPropertyRecord";

export interface CssDensityDiffView {
  readonly sourceFile: string;
  readonly selectors: string[];
  readonly name: string;

  readonly density0: CssPropertyRecord;
  readonly density1: CssPropertyRecord;
  readonly density2: CssPropertyRecord;
}
