import { NgModule } from "@angular/core";
import { MatMaskDirective } from "./mat-mask.directive";

@NgModule({
  declarations: [MatMaskDirective],
  exports: [MatMaskDirective]
}) 
export class MatMaskModule {}