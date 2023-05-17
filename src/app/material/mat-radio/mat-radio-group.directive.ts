import { AfterContentInit, ContentChildren, Directive, ElementRef, forwardRef, Input, Output, QueryList, EventEmitter } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { MatRadioDirective } from './mat-radio.directive'

@Directive({
  selector: 'mat-radio-group',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => MatRadioGroupDirective),
  }]
})
export class MatRadioGroupDirective implements ControlValueAccessor, AfterContentInit {
  @Input() name: string = ''
  @ContentChildren(MatRadioDirective, {
    descendants: true
  }) matRadioDirective: QueryList<MatRadioDirective> = new QueryList()
  @Output() change: EventEmitter<any> =  new EventEmitter<any>()
  @Input() set value(value: any) {
    this.writeValue(value)
  }
  
  private _value: any

  public onChange = (value: any): void => {}
  onTouched = () => {}

  touched = false
  disabled = false

  constructor(private el: ElementRef) {
    this.el.nativeElement.classList.add('mat-radio-group')
  }

  public writeValue(value: any): void {
    if( this._value !== value) {
      this._value = value
      this.toggle()
    }
  }

  public registerOnChange(onChange: any): void {
    this.onChange = onChange
  }

  public toggle(): void {
    if (this.matRadioDirective)
      this.matRadioDirective.forEach(item => {
        if (item.value === this._value)
          item.el.nativeElement.classList.add('active')
        else
          item.el.nativeElement.classList.remove('active')
      })

    this.onChange(this._value)
    this.change.emit(this._value)
  }

  public markAsTouched(): void {
    if(!this.touched) {
      this.onTouched()
      this.touched = true
    }
  }

  public setDisabledState(disabled: boolean): void {
    this.disabled = disabled
  }

  public registerOnTouched(onTouched: any): void {
    this.onTouched = onTouched
  }

  ngAfterContentInit(): void {
    this.matRadioDirective.forEach((item: MatRadioDirective) => {
      if( !this.disabled )
        item.registerOnChange((value: any) => this.writeValue(value))
    })

    if(typeof(this._value) !== undefined)
      this.toggle()
  }
}