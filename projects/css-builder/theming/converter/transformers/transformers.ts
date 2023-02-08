import { backgroundTransformers } from "./background-transforms";
import { cardTransformers } from "./card-transformers";
import { checkboxTransformers } from "./checkbox-transformers";
import { chipTransformers } from "./chip-transforms";
import { CssTransform } from "../CssTransform";
import { foregroundTransformers } from "./foreground-transforms";
import { listTransformers } from "./list-transformers";
import { overlayTransformers } from "./overlay-transformers";
import { paletteTransformers } from "./palette-transforms";
import { radioButtonTransformers } from "./radio-button-transformers";
import { slideToggleTransformers } from "./slide-toggle-transforms";
import { sliderTransformers } from "./slider-transformers";
import { snackBarTransformers } from "./snack-bar-transformers";
import { surfaceTransformers } from "./surface-transforms";
import { opacityTransformers } from "./opacity-transformers";

export const cssTransformers: CssTransform[] = [
  paletteTransformers,
  foregroundTransformers,
  backgroundTransformers,
  surfaceTransformers,
  overlayTransformers,
  chipTransformers,
  sliderTransformers,
  slideToggleTransformers,
  radioButtonTransformers,
  checkboxTransformers,
  listTransformers,
  snackBarTransformers,
  cardTransformers,
  opacityTransformers,
].flat();
