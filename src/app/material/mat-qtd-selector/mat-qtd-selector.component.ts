import { Component, Input, OnDestroy, Output, EventEmitter, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core'
import { FormControl } from '@angular/forms'
import { Observable, of } from 'rxjs'
import { TMeasure } from 'src/app/products/product'
import { MatMenuDirective } from '../mat-menu/mat-menu.directive'

@Component({
  selector: 'mat-qtd-selector',
  templateUrl: 'mat-qtd-selector.component.html'
})
export class MatQtdSelectorComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatMenuDirective) matMenu?: MatMenuDirective

  @Input() minqtd: number = 1
  @Input() stock: number = 1
  @Input() supplymanagement: boolean = true
  @Input() measure: TMeasure = 'UN'
  @Input() localquantity$: Observable<number> = of(0)
  @Output() qtd: EventEmitter<number> = new EventEmitter()
  
  public quantityControl = new FormControl(0)

  private _subscribers: Array<any> = []

  quantityoptions: Array<any> = []
  minqtderror: boolean = false

  constructor(private _cdr: ChangeDetectorRef
  ) {
    this._cdr.detach()
  }

  private emitChanges(value: number) {
    this.qtd.emit(value)
    this.matMenu?.close()

    setTimeout(() => this._cdr.detectChanges(), 0)
  }

  private setQuantityOptions(): Array<any> {
    let max, inc
    const response = []

    if (this.measure === 'KG') {
      if (this.supplymanagement === true && this.stock < .6)
        max = this.stock * 100 + 100
      else
        max = this.minqtd * 100 + 500

      inc = 50
    } else {
      if (this.supplymanagement === true) {

        if (this.stock < 5)
          max = this.stock * 100 + 100
        else
          max = 500
      } else
        max = 500;

      inc = 100
    }

    for (let i = this.minqtd * 100; i < max; i = i + inc) {
      response.push({
        key: i / 100,
        caption: this.getQuantityDescription(i / 100)
      });
    }

    return response
  }

  getQuantityDescription(quantity: number | null): string {
    if (quantity) {
      let response: string;
      switch (this.measure) {
        case 'KG':
          response = quantity < 1 ? `${quantity * 1000} g` : `${String(quantity.toFixed(1)).replace('.', ',')} kg`
          break;
        default:
          response = quantity > 1 ? `${quantity} unidades` : `1 unidade`
          break;
      }

      if (response)
        return response
    }

    return '0'
  }

  onSubmitQuantity(ev: any) {
    ev.preventDefault()
    let value: number = ev.target[0].value
    this.minqtderror = false

    if (this.supplymanagement === true && value > this.stock)
      value = this.stock

    let response: number = Number(String(ev.target[0].value).replace(',', '.'))

    if (response >= this.minqtd)
      this.emitChanges(response)
    else
      this.minqtderror = true

    this._cdr.detectChanges()
  }

  onClickChangeLocalQuantity(value: number): void {
    this.emitChanges(value)
  }

  onMenuShow() {
    this._cdr.detectChanges()
  }

  ngOnInit() {
    if (this.minqtd === 0)
      this.minqtd = 1

    this.quantityoptions = this.setQuantityOptions()
    this._cdr.detectChanges()
  }

  ngOnDestroy() {
    this._subscribers.forEach(item => item.unsubscribe())
  }

  ngAfterViewInit(): void {
    this._subscribers.push(
      this.localquantity$.subscribe(value => {
        this.quantityControl.setValue(value)
        this._cdr.detectChanges()
      })
    )
  }

}
