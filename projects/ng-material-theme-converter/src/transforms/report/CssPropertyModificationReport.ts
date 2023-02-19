import { CssChangeReport } from "./CssChangeReport";

export interface CssPropertyModificationReport {
  name: string;
  value: string;
  change?: CssChangeReport;
}
