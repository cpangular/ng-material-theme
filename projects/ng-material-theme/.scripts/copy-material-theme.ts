import { copyFileSync, mkdirSync } from "fs";

(async () => {
  mkdirSync("./dist/css", { recursive: true });
  copyFileSync("../ng-material-theme-converter/dist/ng-material-theme.css", "./dist/css/ng-material-theme.css");
})();
