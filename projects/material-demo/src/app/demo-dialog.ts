import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";

export interface DemoDialogData {
  /** The theme of the region that opened the dialog, if any. */
  theme: string | null;
}

@Component({
  selector: "app-demo-dialog",
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Dialog</h2>
    <mat-dialog-content>
      @if (data.theme) {
        <p>
          This dialog was opened from the <code>{{ data.theme }}</code> region.
          Its container carries <code>theme="{{ data.theme }}"</code>, so it is
          drawn in that theme although it renders outside the region.
        </p>
      } @else {
        <p>
          This dialog renders in the overlay container at the end of
          <code>&lt;body&gt;</code>, so it takes the page theme from
          <code>&lt;html&gt;</code>.
        </p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton mat-dialog-close>Cancel</button>
      <button matButton="filled" [mat-dialog-close]="true">OK</button>
    </mat-dialog-actions>
  `,
})
export class DemoDialog {
  readonly data = inject<DemoDialogData>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<DemoDialog>);
}
