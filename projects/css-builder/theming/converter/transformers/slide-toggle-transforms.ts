import { ThemeTokens } from "../ThemeTokens";
import { CssTransform } from "../CssTransform";
import { replaceVar } from "../replaceVar";

export const slideToggleTransformers: CssTransform[] = [];




slideToggleTransformers.push(replaceVar('mdc-switch-disabled-selected-handle-color', '#000', 'var(--theme-background-x-low)'));
slideToggleTransformers.push(replaceVar('mdc-switch-disabled-unselected-handle-color', '#000', 'var(--theme-background-x-low)'));

slideToggleTransformers.push(replaceVar('mdc-switch-disabled-selected-track-color', '#f5f5f5', 'var(--theme-background-x-high)'));
slideToggleTransformers.push(replaceVar('mdc-switch-disabled-unselected-track-color', '#f5f5f5', 'var(--theme-background-x-high)'));
slideToggleTransformers.push(replaceVar('mdc-switch-unselected-focus-state-layer-color', '#f5f5f5', 'var(--theme-background-x-high)'));
slideToggleTransformers.push(replaceVar('mdc-switch-unselected-pressed-state-layer-color', '#f5f5f5', 'var(--theme-background-x-high)'));
slideToggleTransformers.push(replaceVar('mdc-switch-unselected-hover-state-layer-color', '#f5f5f5', 'var(--theme-background-x-high)'));

slideToggleTransformers.push(replaceVar('mdc-switch-unselected-focus-handle-color', '#fafafa', 'var(--theme-surface-x-high)'));
slideToggleTransformers.push(replaceVar('mdc-switch-unselected-hover-handle-color', '#fafafa', 'var(--theme-surface-x-high)'));
slideToggleTransformers.push(replaceVar('mdc-switch-unselected-pressed-handle-color', '#fafafa', 'var(--theme-surface-x-high)'));

slideToggleTransformers.push(replaceVar('mdc-switch-handle-surface-color', 'var(--mdc-theme-surface, #fff)', 'var(--theme-surface)'));

slideToggleTransformers.push(replaceVar('mdc-switch-selected-icon-color', '#212121', 'var(--theme-background-low)'));
slideToggleTransformers.push(replaceVar('mdc-switch-disabled-selected-icon-color', '#212121', 'var(--theme-background-low)'));
slideToggleTransformers.push(replaceVar('mdc-switch-disabled-unselected-icon-color', '#212121', 'var(--theme-background-low)'));
slideToggleTransformers.push(replaceVar('mdc-switch-unselected-icon-color', '#212121', 'var(--theme-background-low)'));

slideToggleTransformers.push(replaceVar('mdc-switch-unselected-handle-color', '#9e9e9e', 'var(--theme-surface-high)'));


/*
  --BG-Xlow: #000000;
  --BG-low: #212121;
  --BG: #303030;
  --BG-high: #616161;
  --BG-Xhigh: #f5f5f5;

  --surface-xlow: #212121;
  --surface-low: #303030;
  --surface: #424242;
  --surface-high: #9e9e9e;
  --surface-Xhigh: #fafafa;

*/