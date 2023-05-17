import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatAccordionComponent } from "./mat-accordion.component";

@NgModule({
  imports: [CommonModule],
  declarations: [MatAccordionComponent],
  exports: [MatAccordionComponent]
})
export class MatAccordionModule {}