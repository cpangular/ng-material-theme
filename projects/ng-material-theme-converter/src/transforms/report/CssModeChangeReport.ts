import { CssChangeReport } from "./CssChangeReport";

export interface CssModeChangeReport extends CssChangeReport {
  scope: "mode";
  lightModeValue: string;
  darkModeValue: string;
}

export function isCssModeChangeReport(obj: object): obj is CssModeChangeReport {
  return "scope" in obj && obj.scope === "mode";
}
