/**
 * Theme Switcher
 * Pure TypeScript theme discovery and switching system
 * Detects themes defined as [theme="name"] selectors in CSS
 * Manages both theme selection and color scheme (light/dark/auto)
 */
export class ThemeSwitcher {
    constructor(options = {}) {
        var _a;
        this.themes = new Set();
        this.observers = [];
        this.colorSchemeObservers = [];
        this.mediaQueryListener = null;
        this.persist = (_a = options.persist) !== null && _a !== void 0 ? _a : true;
        // Discover initial themes
        this.discoverThemes();
        // Watch for new style tags being added
        this.observeStyleChanges();
        // Restore saved theme and color scheme from localStorage if persistence enabled
        if (this.persist) {
            this.restoreTheme();
            this.restoreColorScheme();
        }
        else {
            // If not persisting, initialize to auto mode
            this.setColorScheme("auto", false);
        }
    }
    /**
     * Discover themes by parsing CSS rules for [theme="..."] selectors
     */
    discoverThemes() {
        const newThemes = new Set();
        try {
            // Iterate through all stylesheets
            for (const sheet of Array.from(document.styleSheets)) {
                try {
                    // Skip cross-origin stylesheets we can't access
                    if (!sheet.cssRules)
                        continue;
                    // Look through all CSS rules
                    for (const rule of Array.from(sheet.cssRules)) {
                        if ("selectorText" in rule &&
                            typeof rule.selectorText === "string") {
                            // Match [theme="name"] pattern
                            const matches = rule.selectorText.matchAll(/\[theme=["']([^"']+)["']\]/g);
                            for (const match of matches) {
                                const themeName = match[1];
                                if (themeName && themeName !== "") {
                                    newThemes.add(themeName);
                                }
                            }
                        }
                    }
                }
                catch (e) {
                    // Cross-origin or other access issues - skip this sheet
                    console.debug("Cannot access stylesheet:", sheet.href, e);
                }
            }
        }
        catch (e) {
            console.error("Error discovering themes:", e);
        }
        // Update themes set and notify if changed
        const themesChanged = newThemes.size !== this.themes.size ||
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
    observeStyleChanges() {
        this.mutationObserver = new MutationObserver((mutations) => {
            let shouldRediscover = false;
            for (const mutation of mutations) {
                for (const node of Array.from(mutation.addedNodes)) {
                    // Check if added node is a style or link element
                    if (node instanceof HTMLElement &&
                        (node.tagName === "STYLE" ||
                            (node.tagName === "LINK" &&
                                node.getAttribute("rel") === "stylesheet"))) {
                        shouldRediscover = true;
                        break;
                    }
                }
                if (shouldRediscover)
                    break;
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
    getThemes() {
        return Array.from(this.themes).sort();
    }
    /**
     * Get currently active theme
     */
    getCurrentTheme() {
        return document.documentElement.getAttribute("theme") || null;
    }
    /**
     * Set active theme
     * @param themeName - Theme name or null to remove theme
     * @param persist - Override default persistence setting for this call
     */
    setTheme(themeName, persist) {
        const shouldPersist = persist !== null && persist !== void 0 ? persist : this.persist;
        if (themeName === null || themeName === "" || themeName === "none") {
            document.documentElement.removeAttribute("theme");
            if (shouldPersist) {
                this.removeFromStorage("@cpangular/ng-material-theme.selectedTheme");
            }
        }
        else {
            document.documentElement.setAttribute("theme", themeName);
            if (shouldPersist) {
                this.saveToStorage("@cpangular/ng-material-theme.selectedTheme", themeName);
            }
        }
        this.notifyObservers();
    }
    /**
     * Get current color scheme mode
     */
    getCurrentColorScheme() {
        if (this.persist) {
            return this.getFromStorage("@cpangular/ng-material-theme.colorScheme") || "auto";
        }
        // If not persisting, check the actual color-scheme style
        const current = document.documentElement.style.colorScheme;
        if (current === "light" || current === "dark") {
            return current;
        }
        return "auto";
    }
    /**
     * Set color scheme mode
     * @param mode - "light", "dark", or "auto" (follows system preference)
     * @param persist - Override default persistence setting for this call
     */
    setColorScheme(mode, persist) {
        const shouldPersist = persist !== null && persist !== void 0 ? persist : this.persist;
        if (shouldPersist) {
            this.saveToStorage("@cpangular/ng-material-theme.colorScheme", mode);
        }
        // Remove previous listener if exists
        if (this.mediaQueryListener) {
            window
                .matchMedia("(prefers-color-scheme: dark)")
                .removeEventListener("change", this.mediaQueryListener);
            this.mediaQueryListener = null;
        }
        if (mode === "auto") {
            // Use system preference
            const systemPref = this.getSystemPreference();
            document.documentElement.style.colorScheme = systemPref;
            // Listen for system preference changes
            this.mediaQueryListener = (e) => {
                document.documentElement.style.colorScheme = e.matches ? "dark" : "light";
                this.notifyColorSchemeObservers();
            };
            window
                .matchMedia("(prefers-color-scheme: dark)")
                .addEventListener("change", this.mediaQueryListener);
        }
        else {
            // Use explicit mode
            document.documentElement.style.colorScheme = mode;
        }
        this.notifyColorSchemeObservers();
    }
    /**
     * Get system color scheme preference
     */
    getSystemPreference() {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    }
    /**
     * Cycle through color scheme modes: light → dark → auto → light
     */
    cycleColorScheme() {
        const current = this.getCurrentColorScheme();
        const next = current === "light" ? "dark" : current === "dark" ? "auto" : "light";
        this.setColorScheme(next);
    }
    /**
     * Register a callback to be notified when color scheme changes
     */
    onColorSchemeChange(callback) {
        this.colorSchemeObservers.push(callback);
        // Immediately call with current state
        callback(this.getCurrentColorScheme());
    }
    /**
     * Unregister a color scheme callback
     */
    removeColorSchemeObserver(callback) {
        const index = this.colorSchemeObservers.indexOf(callback);
        if (index > -1) {
            this.colorSchemeObservers.splice(index, 1);
        }
    }
    /**
     * Notify all color scheme observers
     */
    notifyColorSchemeObservers() {
        const mode = this.getCurrentColorScheme();
        for (const callback of this.colorSchemeObservers) {
            try {
                callback(mode);
            }
            catch (e) {
                console.error("Color scheme observer error:", e);
            }
        }
    }
    /**
     * Restore color scheme from localStorage
     */
    restoreColorScheme() {
        const saved = this.getFromStorage("@cpangular/ng-material-theme.colorScheme");
        if (saved && (saved === "light" || saved === "dark" || saved === "auto")) {
            this.setColorScheme(saved, false); // Don't re-save when restoring
        }
        else {
            this.setColorScheme("auto", false);
        }
    }
    /**
     * Restore theme from localStorage
     */
    restoreTheme() {
        const saved = this.getFromStorage("@cpangular/ng-material-theme.selectedTheme");
        if (saved && this.themes.has(saved)) {
            this.setTheme(saved, false); // Don't re-save when restoring
        }
    }
    /**
     * Register a callback to be notified when themes change
     */
    onChange(callback) {
        this.observers.push(callback);
        // Immediately call with current state
        callback(this.getThemes(), this.getCurrentTheme());
    }
    /**
     * Unregister a callback
     */
    removeObserver(callback) {
        const index = this.observers.indexOf(callback);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }
    /**
     * Notify all observers of theme changes
     */
    notifyObservers() {
        const themes = this.getThemes();
        const current = this.getCurrentTheme();
        for (const callback of this.observers) {
            try {
                callback(themes, current);
            }
            catch (e) {
                console.error("Theme observer error:", e);
            }
        }
    }
    /**
     * Clean up observers
     */
    destroy() {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        if (this.mediaQueryListener) {
            window
                .matchMedia("(prefers-color-scheme: dark)")
                .removeEventListener("change", this.mediaQueryListener);
            this.mediaQueryListener = null;
        }
        this.observers = [];
        this.colorSchemeObservers = [];
    }
    // Storage helpers with SSR safety
    saveToStorage(key, value) {
        try {
            if (typeof localStorage !== "undefined") {
                localStorage.setItem(key, value);
            }
        }
        catch (e) {
            console.debug("Cannot save to localStorage:", e);
        }
    }
    getFromStorage(key) {
        try {
            if (typeof localStorage !== "undefined") {
                return localStorage.getItem(key);
            }
        }
        catch (e) {
            console.debug("Cannot read from localStorage:", e);
        }
        return null;
    }
    removeFromStorage(key) {
        try {
            if (typeof localStorage !== "undefined") {
                localStorage.removeItem(key);
            }
        }
        catch (e) {
            console.debug("Cannot remove from localStorage:", e);
        }
    }
}
// Create and export a singleton instance
export const themeSwitcher = new ThemeSwitcher();
// Also export to window for non-module usage
if (typeof window !== "undefined") {
    window.themeSwitcher = themeSwitcher;
}
