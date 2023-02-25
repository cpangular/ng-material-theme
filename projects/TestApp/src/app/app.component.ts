import { Component } from '@angular/core';
import { ThemeManager } from '@cpangular/ng-material-theme';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  protected readonly themeManager = ThemeManager.default;

  public constructor() {
    // const a = {
    //   a: 1,
    //   qq: [1, 2, 3],
    //   asdf: {
    //     dfsd: 2,
    //     sad: [
    //       { sds: 1 }
    //     ]
    //   }
    // };
    const a = [1, 2, 3];

    const aStr = JSON.stringify(a);
    const scssStr = aStr.replaceAll(/[\{\[]/g, '(').replaceAll(/[\}\]]/g, ')');

    console.log(scssStr);
  }
}

`
(
  "a": 1,
  "qq": (
   1,
   2,
   3
   ),
  "asdf": (
   "dfsd": 2,
   "sad": (
    (
     "sds": 1
     )
    )

   )
 )


`;
