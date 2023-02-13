import { CssTransform } from "../css-transform";
import { backgroundTransforms } from "./background-transforms";
import { cardTransforms } from "./card-transforms";
import { checkboxTransforms } from "./checkbox-transforms";
import { chipTransforms } from "./chip-transforms";
import { foregroundTransforms } from "./foreground-transforms";
import { listTransforms } from "./list-transforms";
import { opacityTransforms } from "./opacity-transforms";
import { overlayTransforms } from "./overlay-transforms";
import { paletteTransforms } from "./palette-transforms";
import { radioButtonTransformers } from "./radio-button-transforms";
import { slideToggleTransformers } from "./slide-toggle-transforms";
import { sliderTransformers } from "./slider-transforms";
import { snackBarTransformers } from "./snack-bar-transforms";
import { surfaceTransformers } from "./surface-transforms";

export const cssTransforms: CssTransform[] = [
  paletteTransforms,
  foregroundTransforms,
  backgroundTransforms,
  surfaceTransformers,
  overlayTransforms,
  chipTransforms,
  sliderTransformers,
  slideToggleTransformers,
  radioButtonTransformers,
  checkboxTransforms,
  listTransforms,
  snackBarTransformers,
  cardTransforms,
  opacityTransforms,
].flat();
