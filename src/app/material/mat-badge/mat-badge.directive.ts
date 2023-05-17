import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[matBadgeHidden]'
})
export class MatBadgeDirective {
  private _hidden = false
  
  @Input('matBadgeHidden') set matBadgeHidden(value: boolean) {
    this._hidden = value
    this.changeHide()
  }

  constructor(private el: ElementRef<HTMLElement>) {
    this.changeHide()
  }

  private changeHide() {
    if( this._hidden === true )
      this.el.nativeElement.classList.remove('mat-badge')
    else
      this.el.nativeElement.classList.add('mat-badge')
  }

}
