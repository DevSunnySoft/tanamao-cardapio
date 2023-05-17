import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[matSuffix]'
})
export class MatSuffixDirective {

  constructor(public el: ElementRef<HTMLElement>) {
    el.nativeElement.classList.add('mat-suffix')
  }

}