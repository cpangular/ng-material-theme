import { colorCssPropertyName } from "../util/colorCssPropertyName";
import { errorColors, primaryColors, secondaryColors } from "./ColorSets";

export const TintLookup = [
  {
    name: colorCssPropertyName("primary", "tint", "lowest"),
    light: primaryColors.light.default,
    dark: primaryColors.dark.default,
    alphas: [0.01, 0.02],
  },
  {
    name: colorCssPropertyName("primary", "tint", "lower"),
    light: primaryColors.light.default,
    dark: primaryColors.dark.default,
    alphas: [0.04, 0.05],
  },
  {
    name: colorCssPropertyName("primary", "tint", "low"),
    light: primaryColors.light.default,
    dark: primaryColors.dark.default,
    alphas: [0.08, 0.1],
  },
  {
    name: colorCssPropertyName("primary", "tint"),
    light: primaryColors.light.default,
    dark: primaryColors.dark.default,
    alphas: [0.2, 0.25],
  },
  {
    name: colorCssPropertyName("primary", "tint", "high"),
    light: primaryColors.light.default,
    dark: primaryColors.dark.default,
    alphas: [0.3],
  },
  {
    name: colorCssPropertyName("primary", "tint", "higher"),
    light: primaryColors.light.default,
    dark: primaryColors.dark.default,
    alphas: [0.4],
  },
  {
    name: colorCssPropertyName("primary", "tint", "highest"),
    light: primaryColors.light.default,
    dark: primaryColors.dark.default,
    alphas: [0.87],
  },
  {
    name: colorCssPropertyName("secondary", "tint", "lowest"),
    light: secondaryColors.light.default,
    dark: secondaryColors.dark.default,
    alphas: [0.01, 0.02],
  },
  {
    name: colorCssPropertyName("secondary", "tint", "lower"),
    light: secondaryColors.light.default,
    dark: secondaryColors.dark.default,
    alphas: [0.04, 0.05],
  },
  {
    name: colorCssPropertyName("secondary", "tint", "low"),
    light: secondaryColors.light.default,
    dark: secondaryColors.dark.default,
    alphas: [0.08, 0.1],
  },
  {
    name: colorCssPropertyName("secondary", "tint"),
    light: secondaryColors.light.default,
    dark: secondaryColors.dark.default,
    alphas: [0.2, 0.25],
  },
  {
    name: colorCssPropertyName("secondary", "tint", "high"),
    light: secondaryColors.light.default,
    dark: secondaryColors.dark.default,
    alphas: [0.3],
  },
  {
    name: colorCssPropertyName("secondary", "tint", "higher"),
    light: secondaryColors.light.default,
    dark: secondaryColors.dark.default,
    alphas: [0.4],
  },
  {
    name: colorCssPropertyName("secondary", "tint", "highest"),
    light: secondaryColors.light.default,
    dark: secondaryColors.dark.default,
    alphas: [0.87],
  },
  {
    name: colorCssPropertyName("error", "tint", "lowest"),
    light: errorColors.light.default,
    dark: errorColors.dark.default,
    alphas: [0.01, 0.02],
  },
  {
    name: colorCssPropertyName("error", "tint", "lower"),
    light: errorColors.light.default,
    dark: errorColors.dark.default,
    alphas: [0.04, 0.05],
  },
  {
    name: colorCssPropertyName("error", "tint", "low"),
    light: errorColors.light.default,
    dark: errorColors.dark.default,
    alphas: [0.08, 0.1],
  },
  {
    name: colorCssPropertyName("error", "tint"),
    light: errorColors.light.default,
    dark: errorColors.dark.default,
    alphas: [0.2, 0.25],
  },
  {
    name: colorCssPropertyName("error", "tint", "high"),
    light: errorColors.light.default,
    dark: errorColors.dark.default,
    alphas: [0.3],
  },
  {
    name: colorCssPropertyName("error", "tint", "higher"),
    light: errorColors.light.default,
    dark: errorColors.dark.default,
    alphas: [0.4],
  },
  {
    name: colorCssPropertyName("error", "tint", "highest"),
    light: errorColors.light.default,
    dark: errorColors.dark.default,
    alphas: [0.87],
  },
];
