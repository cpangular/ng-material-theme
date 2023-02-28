import { HeaderInsertionTransformation } from "../../../types/HeaderInsertionTransformation";
import { PropertyTransformation } from "../../../types/PropertyTransformation";

export interface ColorModeColorSwapTransformation {
  generatedCount: number;
  modifiedCount: number;
  headers: HeaderInsertionTransformation[];
  properties: PropertyTransformation[];
}
