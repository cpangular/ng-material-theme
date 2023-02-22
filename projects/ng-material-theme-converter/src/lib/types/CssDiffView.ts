import { CssPropertyRecord } from "./CssPropertyRecord";

export interface CssDiffView {
  readonly sourceFile: string;
  readonly selectors: string[];
  readonly name: string;

  readonly darkMode: CssPropertyRecord;
  readonly lightMode: CssPropertyRecord;
  readonly density0: CssPropertyRecord;
  readonly density1: CssPropertyRecord;
  readonly density2: CssPropertyRecord;
}
