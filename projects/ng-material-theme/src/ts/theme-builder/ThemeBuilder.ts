// import _theme_mode_index from "../../../../shared/scss/theme-mode/_index.scss";
// import _theme_mode_util from "../../../../shared/scss/theme-mode/_util.scss";

// import _theme_color_index from "../../../../shared/scss/theme-color/_index.scss";
// import _theme_color_color from "../../../../shared/scss/theme-color/_color.scss";
// import _theme_color_contrast from "../../../../shared/scss/theme-color/_contrast.scss";
// import _theme_color_legacy from "../../../../shared/scss/theme-color/_legacy.scss";
// import _theme_color_properties from "../../../../shared/scss/theme-color/_properties.scss";
// import _theme_color_shade from "../../../../shared/scss/theme-color/_shade.scss";
// import _theme_color_tint from "../../../../shared/scss/theme-color/_tint.scss";
// import _theme_color_util from "../../../../shared/scss/theme-color/_util.scss";

// import _theme_index from "../../../../shared/scss/theme/_index.scss";
// import _theme_theme from "../../../../shared/scss/theme/_theme.scss";
// import _theme_palette from "../../../../shared/scss/theme/_palette.scss";

// import { compileString } from "sass";

// const scssFs = {
//   "theme-mode": _theme_mode_index,
//   "theme-mode/util": _theme_mode_util,

//   "theme-color": _theme_color_index,
//   "theme-color/color": _theme_color_color,
//   "theme-color/contrast": _theme_color_contrast,
//   "theme-color/legacy": _theme_color_legacy,
//   "theme-color/properties": _theme_color_properties,
//   "theme-color/shade": _theme_color_shade,
//   "theme-color/tint": _theme_color_tint,
//   "theme-color/until": _theme_color_util,

//   theme: _theme_index,
//   "theme/theme": _theme_theme,
//   "theme/palette": _theme_palette,
// };

// export class ThemeBuilder {
//   public static run(src: string) {
//     return compileString(src, {
//       importers: [
//         {
//           canonicalize: (url, opts) => {
//             return new URL(url);
//           },
//           load: (url) => {
//             return null;
//           },
//         },
//       ],
//     });
//   }
// }
