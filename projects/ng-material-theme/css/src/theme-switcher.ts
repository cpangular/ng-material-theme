/**
 * Theme Switcher
 * Pure TypeScript theme discovery and switching system
 * Detects themes defined as [theme="name"] selectors in CSS
 */

export type ThemeChangeCallback = (
  themes: string[],
  currentTheme: string | null,
) => void;

export class ThemeSwitcher {
  private themes: Set<string> = new Set();
  private observers: ThemeChangeCallback[] = [];
  private mutationObserver?: MutationObserver;

  constructor() {
    // Discover initial themes
    this.discoverThemes();

    // Watch for new style tags being added
    this.observeStyleChanges();

    // Restore saved theme from localStorage
    this.restoreTheme();
  }

  /**
   * Discover themes by parsing CSS rules for [theme="..."] selectors
   */
  public discoverThemes(): string[] {
    const newThemes = new Set<string>();

    try {
      // Iterate through all stylesheets
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          // Skip cross-origin stylesheets we can't access
          if (!sheet.cssRules) continue;

          // Look through all CSS rules
          for (const rule of Array.from(sheet.cssRules)) {
            if (
              "selectorText" in rule &&
              typeof rule.selectorText === "string"
            ) {
              // Match [theme="name"] pattern
              const matches = rule.selectorText.matchAll(
                /\[theme=["']([^"']+)["']\]/g,
              );
              for (const match of matches) {
                const themeName = match[1];
                if (themeName && themeName !== "") {
                  newThemes.add(themeName);
                }
              }
            }
          }
        } catch (e) {
          // Cross-origin or other access issues - skip this sheet
          console.debug("Cannot access stylesheet:", sheet.href, e);
        }
      }
    } catch (e) {
      console.error("Error discovering themes:", e);
    }

    // Update themes set and notify if changed
    const themesChanged =
      newThemes.size !== this.themes.size ||
      !Array.from(newThemes).every((t) => this.themes.has(t));

    if (themesChanged) {
      this.themes = newThemes;
      this.notifyObservers();
    }

    return Array.from(this.themes).sort();
  }

  /**
   * Watch for new style tags or link elements being added to the document
   */
  private observeStyleChanges(): void {
    this.mutationObserver = new MutationObserver((mutations) => {
      let shouldRediscover = false;

      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          // Check if added node is a style or link element
          if (
            node instanceof HTMLElement &&
            (node.tagName === "STYLE" ||
              (node.tagName === "LINK" &&
                node.getAttribute("rel") === "stylesheet"))
          ) {
            shouldRediscover = true;
            break;
          }
        }
        if (shouldRediscover) break;
      }

      if (shouldRediscover) {
        // Small delay to let browser parse the stylesheet
        setTimeout(() => this.discoverThemes(), 50);
      }
    });

    // Observe head for style/link additions
    this.mutationObserver.observe(document.head, {
      childList: true,
      subtree: false,
    });
  }

  /**
   * Get list of available themes
   */
  public getThemes(): string[] {
    return Array.from(this.themes).sort();
  }

  /**
   * Get currently active theme
   */
  public getCurrentTheme(): string | null {
    return document.documentElement.getAttribute("theme") || null;
  }

  /**
   * Set active theme
   */
  public setTheme(themeName: string | null): void {
    if (themeName === null || themeName === "" || themeName === "none") {
      document.documentElement.removeAttribute("theme");
      this.removeFromStorage("selectedTheme");
    } else {
      document.documentElement.setAttribute("theme", themeName);
      this.saveToStorage("selectedTheme", themeName);
    }

    this.notifyObservers();
  }

  /**
   * Restore theme from localStorage
   */
  private restoreTheme(): void {
    const saved = this.getFromStorage("selectedTheme");
    if (saved && this.themes.has(saved)) {
      this.setTheme(saved);
    }
  }

  /**
   * Register a callback to be notified when themes change
   */
  public onChange(callback: ThemeChangeCallback): void {
    this.observers.push(callback);
    // Immediately call with current state
    callback(this.getThemes(), this.getCurrentTheme());
  }

  /**
   * Unregister a callback
   */
  public removeObserver(callback: ThemeChangeCallback): void {
    const index = this.observers.indexOf(callback);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  /**
   * Notify all observers of theme changes
   */
  private notifyObservers(): void {
    const themes = this.getThemes();
    const current = this.getCurrentTheme();
    for (const callback of this.observers) {
      try {
        callback(themes, current);
      } catch (e) {
        console.error("Theme observer error:", e);
      }
    }
  }

  /**
   * Clean up observers
   */
  public destroy(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    this.observers = [];
  }

  // Storage helpers with SSR safety
  private saveToStorage(key: string, value: string): void {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.debug("Cannot save to localStorage:", e);
    }
  }

  private getFromStorage(key: string): string | null {
    try {
      if (typeof localStorage !== "undefined") {
        return localStorage.getItem(key);
      }
    } catch (e) {
      console.debug("Cannot read from localStorage:", e);
    }
    return null;
  }

  private removeFromStorage(key: string): void {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.debug("Cannot remove from localStorage:", e);
    }
  }
}

// Create and export a singleton instance
export const themeSwitcher = new ThemeSwitcher();

// Also export to window for non-module usage
if (typeof window !== "undefined") {
  (window as any).themeSwitcher = themeSwitcher;
}
