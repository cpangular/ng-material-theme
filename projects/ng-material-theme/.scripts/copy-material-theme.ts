import { copyFileSync } from "fs";

(async () => {
  copyFileSync("../css-builder/dist/mat-theme.css", "./dist/mat-theme.css");
})();
