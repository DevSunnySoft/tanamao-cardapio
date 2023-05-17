import { NgModule } from "@angular/core";
import { MatRadioGroupDirective } from "./mat-radio-group.directive";
import { MatRadioDirective } from "./mat-radio.directive";

@NgModule({
  declarations: [
    MatRadioGroupDirective,
    MatRadioDirective
  ],
  exports: [
    MatRadioGroupDirective,
    MatRadioDirective
  ]
})
export class MatRadioModule {}