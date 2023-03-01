import Enumerable from "linq";
import { ThemeFileUtil } from "./ThemeFileUtil";

export type TransformationFactory = (themeFile: ThemeFileUtil) => TransformationFn[];
export type TransformationFn = () => void;
