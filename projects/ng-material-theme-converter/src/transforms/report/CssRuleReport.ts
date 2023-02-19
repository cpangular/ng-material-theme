import { CssPropertyModificationReport } from "./CssPropertyModificationReport";

export interface CssRuleReport {
  source: string;
  selector: string;
  properties: CssPropertyModificationReport[];
}
