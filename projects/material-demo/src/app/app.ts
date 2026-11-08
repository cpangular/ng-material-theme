import { afterNextRender, Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatMenu, MatMenuModule } from "@angular/material/menu";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatTabsModule } from "@angular/material/tabs";
import { MatToolbarModule } from "@angular/material/toolbar";
import {
  ColorSchemeMode,
  themeSwitcher,
} from "@cpangular/ng-material-theme/theme-switcher";
import { DemoDialog, DemoDialogData } from "./demo-dialog";

@Component({
  selector: "app-root",
  imports: [
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatRadioModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatToolbarModule,
  ],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
})
export class App {
  private readonly dialog = inject(MatDialog);

  /** Themes the switcher found in the page's stylesheets, and the current one. */
  readonly themes = signal<string[]>([]);
  readonly theme = signal<string | null>(null);
  readonly scheme = signal<ColorSchemeMode>("auto");

  /** The nested region's own theme; `[attr.theme]` puts it on the section. */
  readonly nestedTheme = signal("ember");

  constructor() {
    // The switcher touches <html> and localStorage, so it runs only in the
    // browser, after the first render.
    afterNextRender(() => {
      themeSwitcher.onChange((themes, current) => {
        this.themes.set(themes);
        this.theme.set(current);
      });
      themeSwitcher.onColorSchemeChange((mode) => this.scheme.set(mode));
      this.themes.set(themeSwitcher.getThemes());
      this.theme.set(themeSwitcher.getCurrentTheme());
      this.scheme.set(themeSwitcher.getCurrentColorScheme());
    });
  }

  setTheme(name: string | null): void {
    themeSwitcher.setTheme(name || null);
  }

  setScheme(mode: ColorSchemeMode): void {
    themeSwitcher.setColorScheme(mode);
  }

  /**
   * Overlays render in the CDK overlay container at the end of <body>, outside
   * any themed region, so a menu opened from a region must carry the region's
   * theme itself. The panel element has the menu's panelId.
   */
  themeMenu(menu: MatMenu, theme: string | null): void {
    const panel = document.getElementById(menu.panelId);
    if (!panel) return;
    if (theme) panel.setAttribute("theme", theme);
    else panel.removeAttribute("theme");
  }

  /** Same for a dialog: the attribute goes on the dialog container. */
  openDialog(theme: string | null): void {
    const ref = this.dialog.open<DemoDialog, DemoDialogData>(DemoDialog, {
      data: { theme },
    });
    if (theme) {
      const host: HTMLElement = ref.componentRef!.location.nativeElement;
      host.closest("mat-dialog-container")?.setAttribute("theme", theme);
    }
  }
}
