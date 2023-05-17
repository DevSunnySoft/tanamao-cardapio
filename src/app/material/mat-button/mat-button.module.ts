import { NgModule } from "@angular/core";
import { MatButtonDirective } from "./mat-button.directive";

@NgModule({
  declarations: [MatButtonDirective],
  exports: [MatButtonDirective]
})
export class MatButtonModule {}