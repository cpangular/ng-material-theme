import { CssPropertyRecord } from "./CssPropertyRecord";

export interface CssColorModeDiffView {
  readonly sourceFile: string;
  readonly selectors: string[];
  readonly name: string;

  readonly darkMode: CssPropertyRecord;
  readonly lightMode: CssPropertyRecord;
}
