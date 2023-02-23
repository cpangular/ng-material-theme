import { combineLatest, Observable, fromEvent } from "rxjs";
import { distinctUntilChanged, map, shareReplay, startWith } from "rxjs/operators";
import { ThemeMode } from "./models";
import { getMode, getModeSetting, getPreferredMode, setModeSetting } from "./theme-mode";
import { scanForThemes } from "./theme-scanner";
import { getActiveTheme, getDefaultTheme, getThemeSetting, isValidTheme, setThemeSetting } from "./theme-selection";

export class ThemeManager {
  private static readonly _themeManagers: Map<HTMLElement, ThemeManager> = new Map();

  public static get default(): RootThemeManager {
    return ThemeManager.forElement(document.documentElement) as RootThemeManager;
  }

  public static forElement(elm: HTMLElement): ThemeManager {
    if (!ThemeManager._themeManagers.has(elm)) {
      ThemeManager._themeManagers.set(elm, elm === document.documentElement ? new RootThemeManager(elm) : new ThemeManager(elm));
    }
    return ThemeManager._themeManagers.get(elm)!;
  }

  protected constructor(private readonly forElement: HTMLElement) {}

  protected readonly _headChange$ = new Observable<void>((observer) => {
    observer.next();
    const mutation = new MutationObserver(() => {
      observer.next();
    });
    mutation.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => {
      mutation.disconnect();
    };
  }).pipe(shareReplay(1));

  protected readonly _htmlThemeChange$ = new Observable<void>((observer) => {
    observer.next();
    const mutation = new MutationObserver(() => {
      observer.next();
    });
    mutation.observe(this.forElement, { attributes: true, attributeFilter: ["theme"] });
    return () => {
      mutation.disconnect();
    };
  }).pipe(
    map((_) => getThemeSetting(this.forElement)),
    distinctUntilChanged(),
    shareReplay(1)
  );

  protected readonly _htmlThemeModeChange$ = new Observable<void>((observer) => {
    observer.next();
    const mutation = new MutationObserver(() => {
      observer.next();
    });
    mutation.observe(document.documentElement, { attributes: true, attributeFilter: ["theme-mode"] });
    return () => {
      mutation.disconnect();
    };
  }).pipe(
    map((_) => getModeSetting()),
    distinctUntilChanged(),
    shareReplay(1)
  );

  protected readonly _prefersColorSchemeChange$ = fromEvent(window.matchMedia("(prefers-color-scheme: dark)"), "change").pipe(
    startWith(getPreferredMode()),
    map((_) => getPreferredMode()),
    distinctUntilChanged(),
    shareReplay(1)
  );

  protected readonly _themes$ = this._headChange$.pipe(map((_) => scanForThemes()));

  protected readonly _defaultTheme$ = this._themes$.pipe(
    map((themes) => getDefaultTheme(themes)?.id),
    distinctUntilChanged()
  );

  protected readonly _mode$ = combineLatest([this._htmlThemeModeChange$, this._prefersColorSchemeChange$]).pipe(map((_) => getMode()));

  protected readonly _activeTheme$ = combineLatest([this._themes$, this._htmlThemeChange$]).pipe(
    map(([themes, _]) => {
      const activeId = getActiveTheme(themes, this.forElement);
      return activeId && isValidTheme(activeId, themes) ? activeId : null;
    }),
    distinctUntilChanged()
  );

  public get themes$() {
    return this._themes$;
  }

  public get defaultTheme$() {
    return this._defaultTheme$;
  }

  public get activeTheme$() {
    return this._activeTheme$;
  }

  public get themeSetting$() {
    return this._htmlThemeChange$;
  }

  public get mode$() {
    return this._mode$;
  }

  public setTheme(mode: string | undefined) {
    return setThemeSetting(mode, this.forElement);
  }

  public get prefersColorScheme$() {
    return this._prefersColorSchemeChange$;
  }
}

export class RootThemeManager extends ThemeManager {
  public get modeSetting$() {
    return this._htmlThemeModeChange$;
  }

  public setMode(mode: ThemeMode) {
    return setModeSetting(mode);
  }
}
