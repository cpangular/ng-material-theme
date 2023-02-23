import CssTree from "../util/CssTree";
import { ThemeFileDatabase } from "./ThemeFileDatabase";

export interface ThemeFileUtil {
  readonly name: string;
  readonly changed: boolean;
  readonly database: ThemeFileDatabase;
  logInfo(message?: any): void;
  markChanged(): void;
  prependHeader(header: CssTree.Rule): void;
}
