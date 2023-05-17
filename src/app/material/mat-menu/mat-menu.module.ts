import { NgModule } from "@angular/core";
import { MatMenuContentDirective, MatMenuDirective } from "./mat-menu.directive";

@NgModule({
  declarations: [
    MatMenuDirective,
    MatMenuContentDirective
  ],
  exports: [
    MatMenuDirective,
    MatMenuContentDirective
  ]
})
export class MatMenuModule {}