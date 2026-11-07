/**
 * Theme Switcher
 * Pure TypeScript theme discovery and switching system
 * Detects themes defined as [theme="name"] selectors in CSS
 * Manages both theme selection and color scheme (light/dark/auto)
 */
export type ThemeChangeCallback = (themes: string[], currentTheme: string | null) => void;
export type ColorSchemeMode = "light" | "dark" | "auto";
export type ColorSchemeChangeCallback = (mode: ColorSchemeMode) => void;
export interface ThemeSwitcherOptions {
    /** Enable localStorage persistence for theme and color scheme */
    persist?: boolean;
}
export declare class ThemeSwitcher {
    private themes;
    private observers;
    private colorSchemeObservers;
    private mutationObserver?;
    private mediaQueryListener?;
    private persist;
    constructor(options?: ThemeSwitcherOptions);
    /**
     * Discover themes by parsing CSS rules for [theme="..."] selectors
     */
    discoverThemes(): string[];
    /**
     * Watch for new style tags or link elements being added to the document
     */
    private observeStyleChanges;
    /**
     * Get list of available themes
     */
    getThemes(): string[];
    /**
     * Get currently active theme
     */
    getCurrentTheme(): string | null;
    /**
     * Set active theme
     * @param themeName - Theme name or null to remove theme
     * @param persist - Override default persistence setting for this call
     */
    setTheme(themeName: string | null, persist?: boolean): void;
    /**
     * Get current color scheme mode
     */
    getCurrentColorScheme(): ColorSchemeMode;
    /**
     * Set color scheme mode
     * @param mode - "light", "dark", or "auto" (follows system preference)
     * @param persist - Override default persistence setting for this call
     */
    setColorScheme(mode: ColorSchemeMode, persist?: boolean): void;
    /**
     * Get system color scheme preference
     */
    private getSystemPreference;
    /**
     * Cycle through color scheme modes: light → dark → auto → light
     */
    cycleColorScheme(): void;
    /**
     * Register a callback to be notified when color scheme changes
     */
    onColorSchemeChange(callback: ColorSchemeChangeCallback): void;
    /**
     * Unregister a color scheme callback
     */
    removeColorSchemeObserver(callback: ColorSchemeChangeCallback): void;
    /**
     * Notify all color scheme observers
     */
    private notifyColorSchemeObservers;
    /**
     * Restore color scheme from localStorage
     */
    private restoreColorScheme;
    /**
     * Restore theme from localStorage
     */
    private restoreTheme;
    /**
     * Register a callback to be notified when themes change
     */
    onChange(callback: ThemeChangeCallback): void;
    /**
     * Unregister a callback
     */
    removeObserver(callback: ThemeChangeCallback): void;
    /**
     * Notify all observers of theme changes
     */
    private notifyObservers;
    /**
     * Clean up observers
     */
    destroy(): void;
    private saveToStorage;
    private getFromStorage;
    private removeFromStorage;
}
export declare const themeSwitcher: ThemeSwitcher;
