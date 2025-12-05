import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ThemeVisComponent } from "../../../ng-material-theme/src/lib/theme-vis/theme-vis.component";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, ThemeVisComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  title = "test-theme";
}
