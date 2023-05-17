import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldDirective } from "./mat-form-field.directive";
import { MatPrefixDirective } from "./mat-prefix.directive";
import { MatSuffixDirective } from "./mat-suffix.directive";

@NgModule({
  declarations: [
    MatFormFieldDirective,
    MatSuffixDirective,
    MatPrefixDirective
  ],
  imports: [ReactiveFormsModule],
  exports: [
    MatFormFieldDirective,
    MatSuffixDirective,
    MatPrefixDirective
  ],
})
export class MatFormFieldModule {}