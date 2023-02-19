import { CssChangeReport } from "./CssChangeReport";

export interface CssModeChangeReport extends CssChangeReport {
  scope: "mode";
  lightModeValue: string;
  darkModeValue: string;
}
