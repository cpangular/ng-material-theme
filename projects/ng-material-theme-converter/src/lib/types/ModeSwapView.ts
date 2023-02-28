import { CssColorModeDiffView } from "./CssColorModeDiffView";

export interface ModeSwapView {
  variable: string;
  lightValue: string;
  darkValue: string;
  replacements: CssColorModeDiffView[];
}
