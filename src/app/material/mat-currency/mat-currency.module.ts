import { CurrencyPipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatCurrencyDirective } from "./mat-currency.directive";

@NgModule({
  declarations: [
    MatCurrencyDirective
  ],
  providers: [
    CurrencyPipe
  ],
  exports: [
    MatCurrencyDirective
  ]
})
export class MatCurrencyModule {}