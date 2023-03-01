import { TransformationFactory } from "../types/TransformationFn";
import { DATE_PICKER_TRANSFORMS } from "./components/datepicker";
import { PROGRESS_BAR_TRANSFORMS } from "./components/progress-bar";
import { TABS_TRANSFORMS } from "./components/tabs";

export const TRANSFORMS: TransformationFactory[] = [TABS_TRANSFORMS, DATE_PICKER_TRANSFORMS, PROGRESS_BAR_TRANSFORMS].flat();
