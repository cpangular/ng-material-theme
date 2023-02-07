import { backgroundTransformers } from "./background-transforms";
import { chipTransformers } from "./chip-transforms";
import { CssTransform } from "./CssTransform";
import { foregroundTransformers } from "./foreground-transforms";
import { paletteTransformers } from "./palette-transforms";
import { slideToggleTransformers } from "./slide-toggle-transforms";
import { surfaceTransformers } from "./surface-transforms";

export const cssTransformers: CssTransform[] = [
    paletteTransformers,
    foregroundTransformers,
    backgroundTransformers,
    surfaceTransformers,
    chipTransformers,
    slideToggleTransformers
].flat();


