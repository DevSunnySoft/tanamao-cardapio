import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[matPrefix]'
})
export class MatPrefixDirective {

  constructor(public el: ElementRef<HTMLElement>) {
    el.nativeElement.classList.add('mat-prefix')
  }

}
