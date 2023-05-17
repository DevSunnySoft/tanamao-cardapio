import { NgModule } from "@angular/core";
import { MatInputDirective } from "./mat-input.directive";

@NgModule({
  declarations: [MatInputDirective],
  exports: [MatInputDirective]
})
export class MatInputModule {}