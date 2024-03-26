import { Injectable, PLATFORM_ID, Signal, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import {
  Observable,
  distinctUntilChanged,
  fromEvent,
  map,
  startWith,
} from "rxjs";
import {
  ThemeMode,
  getActiveTheme,
  getActiveThemeMode,
  getPreferredMode,
  setTheme,
  setThemeMode,
} from "./theme";
import { getDocumentElement } from "./util";
import { isPlatformBrowser } from "@angular/common";

const config: MutationObserverInit = { attributes: true };

const observeOnMutation = (
  target: Node | undefined,
  config: MutationObserverInit,
): Observable<MutationRecord[]> => {
  return new Observable((observer) => {
    if (typeof MutationObserver === "undefined") {
      return () => {};
    }
    const mutation = new MutationObserver((mutations) => {
      observer.next(mutations);
    });
    if (target) {
      mutation.observe(target, config);
    }
    const unsubscribe = () => {
      mutation.disconnect();
    };
    return unsubscribe;
  });
};

@Injectable({
  providedIn: "root",
})
export class NgMaterialThemeService {
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _docMutations$ = observeOnMutation(
    getDocumentElement(),
    config,
  );
  private readonly _activeTheme$ = this._docMutations$.pipe(
    map((m) => getActiveTheme()),
    distinctUntilChanged(),
  );
  private readonly _activeThemeMode$ = this._docMutations$.pipe(
    map((m) => getActiveThemeMode()),
    distinctUntilChanged(),
  );

  public readonly theme = toSignal(this._activeTheme$, {
    initialValue: getActiveTheme(),
  });
  public readonly mode = toSignal(this._activeThemeMode$, {
    initialValue: getActiveThemeMode(),
  });

  public readonly prefersColorMode = this._isBrowser
    ? toSignal(
        fromEvent(
          window.matchMedia("(prefers-color-scheme: dark)"),
          "change",
        ).pipe(
          map((_) => getPreferredMode()),
          distinctUntilChanged(),
        ),
        { initialValue: getPreferredMode() },
      )
    : signal<ThemeMode.LIGHT>(ThemeMode.LIGHT).asReadonly();

  public setTheme(theme: string | undefined) {
    setTheme(theme);
  }

  public setMode(mode: ThemeMode) {
    setThemeMode(mode);
  }
}
