import { CurrencyPipe } from '@angular/common'
import { Directive, ElementRef, HostListener, Input } from '@angular/core'
import { NgControl } from '@angular/forms'
import { Observable, of, Subscription } from 'rxjs'

@Directive({
  selector: '[appMatCurrency]'
})
export class MatCurrencyDirective {
  @Input() initvalue$: Observable<number> = of(1)
  private _subscription: Array<Subscription> = [] 

  constructor(
    private el: ElementRef,
    private currencyPipe: CurrencyPipe,
    private _control: NgControl
  ) {
    this.el.nativeElement.className += ' currency-input';
  }
  
  @HostListener('keydown', ['$event']) onKeydown(args: any): any {
    const keycode = args.which;
    if(
        (keycode > 64 && keycode < 91) ||
        (keycode > 185)) {
      return false;
    }
  }

  @HostListener('keyup', ['$event']) onKeyup(args: any): any {
    let value = this.el.nativeElement.value.replace(/\./g, '').replace(/,/, '');
    if(this._control.control)
      this._control.control.setValue(this.currencyPipe.transform((value/100), 'BRL', '', '1.2-2', 'pt'))

    return false
  }

  ngOnInit() {
    if( this.initvalue$ )
      this._subscription.push(this.initvalue$.subscribe(value => {
        if( this._control.control)
          this._control.control.setValue(this.currencyPipe.transform(value,  'BRL', '', '1.2-2', 'pt'))
      }))

    this.el.nativeElement.focus()
  }

  ngOnDestroy() {
    if( this._subscription)
      this._subscription.forEach(item => item.unsubscribe())
  }
}