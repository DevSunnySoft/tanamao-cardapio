import { Component, ElementRef, forwardRef, HostListener, Input, ViewChild, EventEmitter, Output, AfterViewInit, ChangeDetectorRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatMenuDirective } from '../mat-menu/mat-menu.directive';

@Component({
  selector: 'mat-select',
  templateUrl: 'mat-select.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => MatSelectComponent)
  }]
})
export class MatSelectComponent implements ControlValueAccessor, AfterViewInit, OnInit {
  @ViewChild(MatMenuDirective, {static: true}) menu!: MatMenuDirective
  @ViewChild('input') input!: ElementRef<HTMLInputElement>

  @Input() labelkey: string = 'label'
  @Input() valuekey?: string
  @Input() mattabindex?: number

  @Input() titlelabel: string = 'Selecione uma oção'
  @Input() emptylabel: string = 'Não há opções'

  @Output() blur: EventEmitter<any> = new EventEmitter()
  @Output() focus: EventEmitter<any> = new EventEmitter()

  @Input() set data(value: Array<any>) {
    this._data = value
    this.validateData()
  }

  private _data: Array<any> = []
  private _value: any
  private _disabled = false
  private entryvalue: any
  private block = false

  // getters/setters

  get data(): Array<any> {
    return this._data
  }

  get label(): string {
    return this._value ? this._value[this.labelkey] : ''
  }

  constructor(
    private _cdr: ChangeDetectorRef
  ) {
    this._cdr.detach()
  }

  // private

  private onChange = (value: any) => {}
  private onTouch = (value: any) => {}

  private validateData(): void {
    if(this.entryvalue !== undefined) {
      const index = this._data.findIndex(item => {

        if( this.valuekey )
          return item[this.valuekey] === this.entryvalue
        else
          return item === this.entryvalue
      })

      if(index >= 0 ) {
        this._value = this._data[index]
        this.onChange(this.valuekey ? this._value[this.valuekey] : this._value)
      } else {
        this._value = undefined
        this.onChange(undefined)
      }

      this._cdr.detectChanges()
    }
  }

  closeMenu() {
    this.menu?.close()
    this.onTouch(null)
  }

  // public

  onMenuShow() {
    this._cdr.detectChanges()
  }

  registerOnChange(fn: any): void {
    this.onChange = fn
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn
  }

  setDisabledState(value: boolean): void {
    this._disabled = value
  }

  writeValue(value: any): void {
    this.entryvalue = value
    this.validateData()
  }


  // events

  onClickOption(item: any): void {
    if(this.valuekey)
      this.writeValue(item[this.valuekey])
    else
      this.writeValue(item)

    this.closeMenu()
  }

  onMouseDownCombo(): void {
    this.block = true
  }

  ngOnInit() {
    this._cdr.detectChanges()
  }

  ngAfterViewInit() {
    if( this.mattabindex )
      this.input.nativeElement.tabIndex = this.mattabindex
      
    this.input.nativeElement.onblur = (ev: any) => {
      ev.preventDefault()
      
      if(!this.block) {
        this.blur.emit(ev)
        this.closeMenu()
      } else
        this.block = false
    }

    this.input.nativeElement.onfocus = (ev: any) => {
      ev.preventDefault()
      
      if(!this._disabled) {
        this.menu?.show(-1, this.input.nativeElement.offsetHeight + 2, this.input.nativeElement.offsetWidth - 8, false)
        this.focus.emit(ev)
      }
    }
  }
}