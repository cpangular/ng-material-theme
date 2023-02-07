import { ThemeTokens } from "../ThemeTokens";
import { CssTransform } from "../CssTransform";
import { replaceVar } from "../replaceVar";

export const chipTransformers: CssTransform[] = [];

// backgrounds
chipTransformers.push(replaceVar('mdc-chip-elevated-container-color', '#f21f22', 'var(--theme-background-high)'));
chipTransformers.push(replaceVar('mdc-chip-elevated-disabled-container-color', '#f21f22', 'var(--theme-background-high)'));

// foregrounds
chipTransformers.push(replaceVar('mdc-chip-label-text-color', '#fafafa', 'var(--theme-foreground-text-secondary)'));
chipTransformers.push(replaceVar('mdc-chip-disabled-label-text-color', '#fafafa', 'var(--theme-foreground-text-secondary)'));
chipTransformers.push(replaceVar('mdc-chip-with-icon-icon-color', '#fafafa', 'var(--theme-foreground-text-secondary)'));
chipTransformers.push(replaceVar('mdc-chip-with-icon-disabled-icon-color', '#fafafa', 'var(--theme-foreground-text-secondary)'));
chipTransformers.push(replaceVar('mdc-chip-with-trailing-icon-disabled-trailing-icon-color', '#fafafa', 'var(--theme-foreground-text-secondary)'));
chipTransformers.push(replaceVar('mdc-chip-with-trailing-icon-trailing-icon-color', '#fafafa', 'var(--theme-foreground-text-secondary)'));
chipTransformers.push(replaceVar('mdc-chip-with-icon-selected-icon-color', '#fafafa', 'var(--theme-foreground-text-secondary)'));


