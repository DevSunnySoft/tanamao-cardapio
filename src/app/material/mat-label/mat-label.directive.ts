import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: 'mat-label,[mat-label,matLabel]'
})
export class MatLabelDirective {
  constructor(public el: ElementRef<HTMLLabelElement>) { 
    el.nativeElement.className += ` mat-label`
  }
}