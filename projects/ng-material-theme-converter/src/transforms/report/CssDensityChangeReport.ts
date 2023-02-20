import { CssChangeReport } from "./CssChangeReport";

export interface CssDensityChangeReport extends CssChangeReport {
  scope: "density";
  values: {
    "-2": string;
    "-1": string;
    "0": string;
  };
}

export function isCssDensityChangeReport(obj: object): obj is CssDensityChangeReport {
  return "scope" in obj && obj.scope === "density";
}
