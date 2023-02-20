import { CssChangeReport } from "./CssChangeReport";

export interface CssModeChangeReport extends CssChangeReport {
  scope: "mode";
  lightModeValue: string;
  darkModeValue: string;
}

export function isCssModeChangeReport(obj: object): obj is CssModeChangeReport {
  return obj && "scope" in obj && obj.scope === "mode";
}
