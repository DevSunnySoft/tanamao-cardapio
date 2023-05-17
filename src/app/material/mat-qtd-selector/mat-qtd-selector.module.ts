import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "../mat-button/mat-button.module";
import { MatFormFieldModule } from "../mat-form-field/mat-form-field.module";
import { MatInputModule } from "../mat-input/mat-input.module";
import { MatLabelModule } from "../mat-label/mat-label.module";
import { MatMenuModule } from "../mat-menu/mat-menu.module";
import { MatQtdSelectorComponent } from "./mat-qtd-selector.component";

@NgModule({
  declarations: [MatQtdSelectorComponent],
  exports: [ MatQtdSelectorComponent],
  imports: [
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatLabelModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatButtonModule
  ]
})
export class MatQtdSelectorModule {}