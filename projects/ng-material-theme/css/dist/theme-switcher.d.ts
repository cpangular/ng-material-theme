/**
 * Theme Switcher
 * Pure TypeScript theme discovery and switching system
 * Detects themes defined as [theme="name"] selectors in CSS
 */
export type ThemeChangeCallback = (
  themes: string[],
  currentTheme: string | null,
) => void;
export declare class ThemeSwitcher {
  private themes;
  private observers;
  private mutationObserver?;
  constructor();
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
   */
  setTheme(themeName: string | null): void;
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
