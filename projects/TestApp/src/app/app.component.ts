import { Component } from '@angular/core';
import {
  ThemeBuilder,
  ThemeManager,
} from '@cpangular/ng-material-theme/dist/scss/lib';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  protected readonly themeManager = ThemeManager.default;

  public constructor() {
    const result = ThemeBuilder.run(`
      body{
        color: blue;
      }
    `);
    console.log(result);
  }
}
