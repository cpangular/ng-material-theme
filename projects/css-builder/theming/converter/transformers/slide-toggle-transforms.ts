import { CssTransform } from "../CssTransform";
import { replaceVar } from "../replaceVar";

export const slideToggleTransformers: CssTransform[] = [];

slideToggleTransformers.push(replaceVar("mdc-switch-disabled-selected-handle-color", "#000", "var(--theme-background-lower)"));
slideToggleTransformers.push(replaceVar("mdc-switch-disabled-unselected-handle-color", "#000", "var(--theme-background-lower)"));
slideToggleTransformers.push(replaceVar("mdc-switch-disabled-selected-track-color", "#f5f5f5", "var(--theme-background-higher)"));
slideToggleTransformers.push(replaceVar("mdc-switch-disabled-unselected-track-color", "#f5f5f5", "var(--theme-background-higher)"));
slideToggleTransformers.push(replaceVar("mdc-switch-unselected-focus-state-layer-color", "#f5f5f5", "var(--theme-background-higher)"));
slideToggleTransformers.push(replaceVar("mdc-switch-unselected-pressed-state-layer-color", "#f5f5f5", "var(--theme-background-higher)"));
slideToggleTransformers.push(replaceVar("mdc-switch-unselected-hover-state-layer-color", "#f5f5f5", "var(--theme-background-higher)"));
slideToggleTransformers.push(replaceVar("mdc-switch-unselected-focus-handle-color", "#fafafa", "var(--theme-surface-higher)"));
slideToggleTransformers.push(replaceVar("mdc-switch-unselected-hover-handle-color", "#fafafa", "var(--theme-surface-higher)"));
slideToggleTransformers.push(replaceVar("mdc-switch-unselected-pressed-handle-color", "#fafafa", "var(--theme-surface-higher)"));
slideToggleTransformers.push(replaceVar("mdc-switch-handle-surface-color", "var(--mdc-theme-surface, #fff)", "var(--theme-surface)"));
slideToggleTransformers.push(replaceVar("mdc-switch-selected-icon-color", "#212121", "var(--theme-background-low)"));
slideToggleTransformers.push(replaceVar("mdc-switch-disabled-selected-icon-color", "#212121", "var(--theme-background-low)"));
slideToggleTransformers.push(replaceVar("mdc-switch-disabled-unselected-icon-color", "#212121", "var(--theme-background-low)"));
slideToggleTransformers.push(replaceVar("mdc-switch-unselected-icon-color", "#212121", "var(--theme-background-low)"));
slideToggleTransformers.push(replaceVar("mdc-switch-unselected-handle-color", "#9e9e9e", "var(--theme-surface-high)"));
