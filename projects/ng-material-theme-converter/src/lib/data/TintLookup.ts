import { colorKey } from "../util/colorKey";
import { errorColors, primaryColors, secondaryColors } from "./ColorSets";

export const TintLookup = [
  {
    name: colorKey("primary", "tint", "lowest"),
    light: primaryColors.light.default,
    dark: primaryColors.dark.default,
    alphas: [0.01, 0.02],
  },
  {
    name: colorKey("primary", "tint", "lower"),
    light: primaryColors.light.default,
    dark: primaryColors.dark.default,
    alphas: [0.04, 0.05],
  },
  {
    name: colorKey("primary", "tint", "low"),
    light: primaryColors.light.default,
    dark: primaryColors.dark.default,
    alphas: [0.08, 0.1],
  },
  {
    name: colorKey("primary", "tint"),
    light: primaryColors.light.default,
    dark: primaryColors.dark.default,
    alphas: [0.2, 0.25],
  },
  {
    name: colorKey("primary", "tint", "high"),
    light: primaryColors.light.default,
    dark: primaryColors.dark.default,
    alphas: [0.3],
  },
  {
    name: colorKey("primary", "tint", "higher"),
    light: primaryColors.light.default,
    dark: primaryColors.dark.default,
    alphas: [0.4],
  },
  {
    name: colorKey("primary", "tint", "highest"),
    light: primaryColors.light.default,
    dark: primaryColors.dark.default,
    alphas: [0.87],
  },
  {
    name: colorKey("secondary", "tint", "lowest"),
    light: secondaryColors.light.default,
    dark: secondaryColors.dark.default,
    alphas: [0.01, 0.02],
  },
  {
    name: colorKey("secondary", "tint", "lower"),
    light: secondaryColors.light.default,
    dark: secondaryColors.dark.default,
    alphas: [0.04, 0.05],
  },
  {
    name: colorKey("secondary", "tint", "low"),
    light: secondaryColors.light.default,
    dark: secondaryColors.dark.default,
    alphas: [0.08, 0.1],
  },
  {
    name: colorKey("secondary", "tint"),
    light: secondaryColors.light.default,
    dark: secondaryColors.dark.default,
    alphas: [0.2, 0.25],
  },
  {
    name: colorKey("secondary", "tint", "high"),
    light: secondaryColors.light.default,
    dark: secondaryColors.dark.default,
    alphas: [0.3],
  },
  {
    name: colorKey("secondary", "tint", "higher"),
    light: secondaryColors.light.default,
    dark: secondaryColors.dark.default,
    alphas: [0.4],
  },
  {
    name: colorKey("secondary", "tint", "highest"),
    light: secondaryColors.light.default,
    dark: secondaryColors.dark.default,
    alphas: [0.87],
  },
  {
    name: colorKey("error", "tint", "lowest"),
    light: errorColors.light.default,
    dark: errorColors.dark.default,
    alphas: [0.01, 0.02],
  },
  {
    name: colorKey("error", "tint", "lower"),
    light: errorColors.light.default,
    dark: errorColors.dark.default,
    alphas: [0.04, 0.05],
  },
  {
    name: colorKey("error", "tint", "low"),
    light: errorColors.light.default,
    dark: errorColors.dark.default,
    alphas: [0.08, 0.1],
  },
  {
    name: colorKey("error", "tint"),
    light: errorColors.light.default,
    dark: errorColors.dark.default,
    alphas: [0.2, 0.25],
  },
  {
    name: colorKey("error", "tint", "high"),
    light: errorColors.light.default,
    dark: errorColors.dark.default,
    alphas: [0.3],
  },
  {
    name: colorKey("error", "tint", "higher"),
    light: errorColors.light.default,
    dark: errorColors.dark.default,
    alphas: [0.4],
  },
  {
    name: colorKey("error", "tint", "highest"),
    light: errorColors.light.default,
    dark: errorColors.dark.default,
    alphas: [0.87],
  },
];
