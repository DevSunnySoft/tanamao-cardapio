import { NgModule } from "@angular/core";
import { MatDialogDirective } from "./mat-dialog.directive";

@NgModule({
  declarations: [MatDialogDirective],
  exports: [MatDialogDirective]
})
export class MatDialogModule {}