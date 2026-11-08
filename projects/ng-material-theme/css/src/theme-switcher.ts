/**
 * ThemeSwitcher: the library's whole JavaScript surface.
 *
 * - Discovers themes: every `[theme="name"]` selector in any stylesheet the
 *   page can read, now and as stylesheets are added.
 * - Switches the page theme (the `theme` attribute on `<html>`) and the colour
 *   scheme (an inline `color-scheme` on `<html>`; "auto" removes it, and
 *   core.css's `color-scheme: light dark` follows the OS).
 * - Persists both in localStorage under
 *   `@cpangular/ng-material-theme.selectedTheme` and
 *   `@cpangular/ng-material-theme.colorScheme`, and restores them when created.
 * - Defines and removes themes at runtime from a flat map of the input
 *   variables (`defineTheme` / `removeTheme`), through the CSSOM.
 *
 * No colour maths happens here: a theme is a few input variables and core.css
 * derives everything else.
 */

export type ThemeChangeCallback = (
  themes: string[],
  currentTheme: string | null,
) => void;

export type ColorSchemeMode = "light" | "dark" | "auto";

export type ColorSchemeChangeCallback = (mode: ColorSchemeMode) => void;

export interface ThemeSwitcherOptions {
  /** Persist the theme and colour scheme in localStorage. Default true. */
  persist?: boolean;
}

/**
 * The input variables a runtime theme may set: the light and dark colour of
 * each of the six standard palettes, and the theme-level tuning variables.
 * Values are plain CSS values, e.g. `{ "--theme--light--color--primary": "#3f51b5" }`.
 */
export type ThemeVars = Record<`--theme--${string}`, string>;

const STORAGE_THEME = "@cpangular/ng-material-theme.selectedTheme";
const STORAGE_SCHEME = "@cpangular/ng-material-theme.colorScheme";

const COLOUR_INPUT =
  /^--theme--(?:light|dark)--color--(primary|secondary|tertiary|neutral|neutral-variant|error)$/;

export class ThemeSwitcher {
  private themes: Set<string> = new Set();
  private observers: ThemeChangeCallback[] = [];
  private colorSchemeObservers: ColorSchemeChangeCallback[] = [];
  private mutationObserver?: MutationObserver;
  private persist: boolean;

  constructor(options: ThemeSwitcherOptions = {}) {
    this.persist = options.persist ?? true;
    this.discoverThemes();
    this.observeStyleChanges();
    if (this.persist) {
      this.restoreTheme();
      this.restoreColorScheme();
    } else {
      this.setColorScheme("auto", false);
    }
  }

  // ── Discovery ──────────────────────────────────────────────────────────────

  /** Scan every readable stylesheet for `[theme="name"]` selectors. */
  public discoverThemes(): string[] {
    const found = new Set<string>();
    for (const sheet of Array.from(document.styleSheets)) {
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules;
      } catch {
        continue; // cross-origin stylesheet
      }
      for (const rule of Array.from(rules)) {
        if (!(rule instanceof CSSStyleRule)) continue;
        for (const m of rule.selectorText.matchAll(
          /\[theme=["']([^"']+)["']\]/g,
        ))
          found.add(m[1]);
      }
    }
    const changed =
      found.size !== this.themes.size ||
      ![...found].every((t) => this.themes.has(t));
    if (changed) {
      this.themes = found;
      this.notifyObservers();
    }
    return this.getThemes();
  }

  /** Rediscover when a `<style>` or stylesheet `<link>` is added to `<head>`. */
  private observeStyleChanges(): void {
    this.mutationObserver = new MutationObserver((mutations) => {
      const added = mutations.some((m) =>
        Array.from(m.addedNodes).some(
          (n) =>
            n instanceof HTMLStyleElement ||
            (n instanceof HTMLLinkElement && n.rel === "stylesheet"),
        ),
      );
      // A <link> has no rules until it has loaded; give it a moment.
      if (added) setTimeout(() => this.discoverThemes(), 50);
    });
    this.mutationObserver.observe(document.head, { childList: true });
  }

  public getThemes(): string[] {
    return [...this.themes].sort();
  }

  public getCurrentTheme(): string | null {
    return document.documentElement.getAttribute("theme") || null;
  }

  // ── Theme ──────────────────────────────────────────────────────────────────

  /**
   * Set the page theme: the `theme` attribute on `<html>`. The name need not be
   * a discovered theme; if its rule arrives later (a stylesheet still loading,
   * a `defineTheme` call), CSS picks it up then. `null` removes the attribute.
   */
  public setTheme(themeName: string | null, persist?: boolean): void {
    const shouldPersist = persist ?? this.persist;
    if (!themeName) {
      document.documentElement.removeAttribute("theme");
      if (shouldPersist) this.removeFromStorage(STORAGE_THEME);
    } else {
      document.documentElement.setAttribute("theme", themeName);
      if (shouldPersist) this.saveToStorage(STORAGE_THEME, themeName);
    }
    this.notifyObservers();
  }

  private restoreTheme(): void {
    const saved = this.getFromStorage(STORAGE_THEME);
    if (saved) this.setTheme(saved, false);
  }

  // ── Colour scheme ──────────────────────────────────────────────────────────

  public getCurrentColorScheme(): ColorSchemeMode {
    if (this.persist) {
      const saved = this.getFromStorage(STORAGE_SCHEME);
      if (saved === "light" || saved === "dark") return saved;
      return "auto";
    }
    const inline = document.documentElement.style.colorScheme;
    return inline === "light" || inline === "dark" ? inline : "auto";
  }

  /**
   * Force light or dark on `<html>`, or "auto": remove the inline declaration
   * so core.css's `color-scheme: light dark` follows the OS. No media-query
   * listener is needed; the browser re-resolves `light-dark()` itself.
   */
  public setColorScheme(mode: ColorSchemeMode, persist?: boolean): void {
    const shouldPersist = persist ?? this.persist;
    if (shouldPersist) this.saveToStorage(STORAGE_SCHEME, mode);
    if (mode === "auto")
      document.documentElement.style.removeProperty("color-scheme");
    else document.documentElement.style.colorScheme = mode;
    this.notifyColorSchemeObservers();
  }

  /** light → dark → auto → light */
  public cycleColorScheme(): void {
    const current = this.getCurrentColorScheme();
    this.setColorScheme(
      current === "light" ? "dark" : current === "dark" ? "auto" : "light",
    );
  }

  private restoreColorScheme(): void {
    const saved = this.getFromStorage(STORAGE_SCHEME);
    this.setColorScheme(
      saved === "light" || saved === "dark" ? saved : "auto",
      false,
    );
  }

  // ── Data-driven themes ─────────────────────────────────────────────────────

  /**
   * Define (or redefine) a theme from a flat map of input variables, e.g.
   * `{ "--theme--light--color--primary": "#3f51b5", "--theme--dark--color--primary": "#aab4ff" }`.
   *
   * Allowed keys are the light and dark colour inputs of the six standard
   * palettes (primary, secondary, tertiary, neutral, neutral-variant, error)
   * and the `--theme--*` tuning variables. A colour that `CSS.supports` rejects,
   * a palette outside the six (custom palettes are Sass-only) or a key outside
   * `--theme--` is skipped with a console warning; the rest of the theme is
   * still applied. Returns the skipped keys.
   *
   * The rule is written through the CSSOM: one `<style data-theme>` element in
   * `<head>` holding `[theme="name"] { … }`, with each declaration set by
   * `setProperty`, so no CSS text is built from the data.
   */
  public defineTheme(name: string, vars: ThemeVars): string[] {
    this.styleFor(name)?.remove();
    const style = document.createElement("style");
    style.dataset.theme = name;
    document.head.append(style);
    const sheet = style.sheet!;
    const rule = sheet.cssRules[
      sheet.insertRule(`[theme="${CSS.escape(name)}"]{}`)
    ] as CSSStyleRule;
    const skipped: string[] = [];
    for (const [key, value] of Object.entries(vars)) {
      let why = "";
      if (!key.startsWith("--theme--")) why = "is not a --theme-- input";
      else if (key.includes("--color--") && !COLOUR_INPUT.test(key))
        why =
          "is not one of the six standard palettes (custom palettes are Sass-only)";
      else if (COLOUR_INPUT.test(key) && !CSS.supports("color", value))
        why = `has an invalid colour "${value}"`;
      if (why) {
        skipped.push(key);
        console.warn(`defineTheme("${name}"): ${key} ${why}; skipped`);
        continue;
      }
      rule.style.setProperty(key, value);
    }
    this.discoverThemes();
    return skipped;
  }

  /**
   * Remove a theme defined with `defineTheme`. If it is the page theme, the
   * attribute is cleared too. Themes from stylesheets are not affected.
   */
  public removeTheme(name: string): void {
    this.styleFor(name)?.remove();
    if (this.getCurrentTheme() === name) this.setTheme(null);
    this.discoverThemes();
  }

  private styleFor(name: string): HTMLStyleElement | null {
    return document.head.querySelector(
      `style[data-theme="${CSS.escape(name)}"]`,
    );
  }

  // ── Observers ──────────────────────────────────────────────────────────────

  /** Called now and whenever the theme list or the page theme changes. */
  public onChange(callback: ThemeChangeCallback): void {
    this.observers.push(callback);
    callback(this.getThemes(), this.getCurrentTheme());
  }

  public removeObserver(callback: ThemeChangeCallback): void {
    const i = this.observers.indexOf(callback);
    if (i > -1) this.observers.splice(i, 1);
  }

  private notifyObservers(): void {
    const themes = this.getThemes();
    const current = this.getCurrentTheme();
    for (const cb of this.observers) {
      try {
        cb(themes, current);
      } catch (e) {
        console.error("Theme observer error:", e);
      }
    }
  }

  /** Called now and whenever the colour scheme mode changes. */
  public onColorSchemeChange(callback: ColorSchemeChangeCallback): void {
    this.colorSchemeObservers.push(callback);
    callback(this.getCurrentColorScheme());
  }

  public removeColorSchemeObserver(callback: ColorSchemeChangeCallback): void {
    const i = this.colorSchemeObservers.indexOf(callback);
    if (i > -1) this.colorSchemeObservers.splice(i, 1);
  }

  private notifyColorSchemeObservers(): void {
    const mode = this.getCurrentColorScheme();
    for (const cb of this.colorSchemeObservers) {
      try {
        cb(mode);
      } catch (e) {
        console.error("Color scheme observer error:", e);
      }
    }
  }

  public destroy(): void {
    this.mutationObserver?.disconnect();
    this.observers = [];
    this.colorSchemeObservers = [];
  }

  // ── Storage (fails quietly where storage is blocked) ───────────────────────

  private saveToStorage(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* storage unavailable */
    }
  }

  private getFromStorage(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private removeFromStorage(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      /* storage unavailable */
    }
  }
}

/**
 * The shared switcher. Created when this module is evaluated in a browser;
 * importing the module during server-side rendering is safe, and there the
 * value is undefined. Also published as `window.themeSwitcher` for pages
 * without modules.
 */
export const themeSwitcher: ThemeSwitcher =
  typeof document !== "undefined"
    ? new ThemeSwitcher()
    : (undefined as unknown as ThemeSwitcher);

if (typeof window !== "undefined") {
  (window as unknown as { themeSwitcher: ThemeSwitcher }).themeSwitcher =
    themeSwitcher;
}
