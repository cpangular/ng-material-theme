import { Injectable } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Observable, distinctUntilChanged, map } from "rxjs";
import {
  ThemeMode,
  getActiveTheme,
  getActiveThemeMode,
  setTheme,
  setThemeMode,
} from "./theme";
import { getDocumentElement } from "./util";

const config: MutationObserverInit = { attributes: true };

console.clear();

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

  public setTheme(theme: string | undefined) {
    setTheme(theme);
  }

  public setMode(mode: ThemeMode) {
    setThemeMode(mode);
  }
}
