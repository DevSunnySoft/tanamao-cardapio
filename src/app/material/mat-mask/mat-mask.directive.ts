import { Directive, ElementRef, Input } from '@angular/core'
import { NgControl } from '@angular/forms'
import { BehaviorSubject, Subscription } from 'rxjs'

export const maskReg: {[key: string]: RegExp} = {
  '9': /\d/,
  'A': /[a-z]/
}

@Directive({
  selector: '[mask]'
})
export class MatMaskDirective {
  @Input('mask') public _imask: string | Array<string> | BehaviorSubject<string> | BehaviorSubject<Array<string>> = ''
  private _subscriptions: Array<Subscription> = []

  constructor(private _el: ElementRef, private _control: NgControl) {}

  get _mask(): any {
    if(this._imask instanceof Array) {
      return this._el.nativeElement.value.length < 14 ? this._imask[0] : this._imask[1]
    } else 
      return this._imask
  }

  private createMask(value: string): string {
    let len = value.length
    let response = ''
    let x = 0
    
    for(let i=0; i < len; i++) {
      if(this._mask[i]) {
        if(this._mask[i] in maskReg) {
          if(maskReg[this._mask[i]].test(value[x]))
            response += value[x]
          else {
            if(x < len)
              i--
            else
              i = len
          }

          x++
        } else {
          response += this._mask[i]

          if(value[x] === this._mask[i])
            x++
          else
            len++
        }
      }
    }
    
    return response
  }

  ngAfterViewInit() {
    if( this._control.valueChanges )
    this._subscriptions.push(this._control.valueChanges.subscribe((value: any) => {
      const newvalue = this.createMask(value)

      if( this._control.control )
        this._control.control.setValue(newvalue, {emitEvent: false})
    }))
  }

  ngOnDestroy() {
    this._subscriptions.forEach(item => item.unsubscribe())
  }
}