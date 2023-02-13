import { CssTransform } from "../css-transform";
import { replaceVariable } from "../replace-variable";

export const slideToggleTransformers: CssTransform[] = [];

slideToggleTransformers.push(replaceVariable("mdc-switch-disabled-selected-handle-color", "#000", "var(--theme-background-lower)"));
slideToggleTransformers.push(replaceVariable("mdc-switch-disabled-unselected-handle-color", "#000", "var(--theme-background-lower)"));
slideToggleTransformers.push(replaceVariable("mdc-switch-disabled-selected-track-color", "#f5f5f5", "var(--theme-background-higher)"));
slideToggleTransformers.push(replaceVariable("mdc-switch-disabled-unselected-track-color", "#f5f5f5", "var(--theme-background-higher)"));
slideToggleTransformers.push(replaceVariable("mdc-switch-unselected-focus-state-layer-color", "#f5f5f5", "var(--theme-background-higher)"));
slideToggleTransformers.push(
  replaceVariable("mdc-switch-unselected-pressed-state-layer-color", "#f5f5f5", "var(--theme-background-higher)")
);
slideToggleTransformers.push(replaceVariable("mdc-switch-unselected-hover-state-layer-color", "#f5f5f5", "var(--theme-background-higher)"));
slideToggleTransformers.push(replaceVariable("mdc-switch-unselected-focus-handle-color", "#fafafa", "var(--theme-surface-higher)"));
slideToggleTransformers.push(replaceVariable("mdc-switch-unselected-hover-handle-color", "#fafafa", "var(--theme-surface-higher)"));
slideToggleTransformers.push(replaceVariable("mdc-switch-unselected-pressed-handle-color", "#fafafa", "var(--theme-surface-higher)"));
slideToggleTransformers.push(replaceVariable("mdc-switch-handle-surface-color", "var(--mdc-theme-surface, #fff)", "var(--theme-surface)"));
slideToggleTransformers.push(replaceVariable("mdc-switch-selected-icon-color", "#212121", "var(--theme-background-low)"));
slideToggleTransformers.push(replaceVariable("mdc-switch-disabled-selected-icon-color", "#212121", "var(--theme-background-low)"));
slideToggleTransformers.push(replaceVariable("mdc-switch-disabled-unselected-icon-color", "#212121", "var(--theme-background-low)"));
slideToggleTransformers.push(replaceVariable("mdc-switch-unselected-icon-color", "#212121", "var(--theme-background-low)"));
slideToggleTransformers.push(replaceVariable("mdc-switch-unselected-handle-color", "#9e9e9e", "var(--theme-surface-high)"));
