import { Component } from '@angular/core';
import { ThemeManager } from '@cpangular/ng-material-theme';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  protected readonly themeManager = ThemeManager.default;

  public constructor() {}
}
