import { CssChangeReport } from "./CssChangeReport";

export interface CssDensityChangeReport extends CssChangeReport {
  scope: "density";
  values: {
    "-2": string;
    "-1": string;
    "0": string;
  };
}
