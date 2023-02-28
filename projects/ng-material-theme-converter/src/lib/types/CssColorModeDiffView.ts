import { CssPropertyRecord } from "./CssPropertyRecord";

export interface CssColorModeDiffView {
  readonly _type: "mode";
  readonly sourceFile: string;
  readonly selectors: string[];
  readonly name: string;

  readonly darkMode: CssPropertyRecord;
  readonly lightMode: CssPropertyRecord;
}
