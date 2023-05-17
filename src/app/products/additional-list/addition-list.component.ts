import { DOCUMENT } from "@angular/common"
import { AfterViewInit, ChangeDetectorRef, Component, HostListener, Inject, Input, OnDestroy, Output, EventEmitter, ViewChild, ElementRef } from "@angular/core"
import { AppService } from "src/app/app.service"
import { OrderSelectorOdsService } from "src/app/catalog/order-selector.ods.service"
import { IOrderItemComponentData } from "src/app/orders/order-selector"
import { slideXToggleAnimation } from "src/app/utils/animations/slide-x-toggle.animation"
import { IProductSettingsAdditional } from "../product"

@Component({
  selector: 'app-aditionals',
  templateUrl: 'addition-list.component.html',
  styleUrls: ['../../utils/styles/menu-catalog.sass'],
  animations: [slideXToggleAnimation]
})
export class AdditionalListComponent implements AfterViewInit, OnDestroy {
  @ViewChild('dialog') dialog?: ElementRef<HTMLDivElement>
  @Input() public data: any
  @Output() close: EventEmitter<void> = new EventEmitter()

  public show = false

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private _orderSelectorOdsService: OrderSelectorOdsService,
    private _appService: AppService,
    private _cdr: ChangeDetectorRef
  ) {
    this._cdr.detach()
  }

  private resize() {
    if (this.dialog && window)
      this.dialog.nativeElement.style.height = `${(window as Window).innerHeight}px`

    this._cdr.detectChanges()
  }
  
  public isAdditionalSelected(additionalid: string): boolean {
    return (this.data.data.components.findIndex((item: any) => item.action === 'A' && item.data[0].componentid === additionalid) < 0)
  }

  public loadImage(images: Array<string>): string {
    if (images && images.length)
      return this._appService.getMiniatureImage(images[0])

    return ''
  }

  public onClickAddComponentAdditional(additional: IProductSettingsAdditional, qtd: number, orderindex: number, ev: Event): void {
    let target = ev.target as HTMLButtonElement | null
    const data: IOrderItemComponentData = {
      componentid: additional.product._id,
      product: additional.product,
      value: additional.product.prices.cashpayment,
      qtd
    }

    if (target) {
      target.disabled = true
      target.classList.add("loading")
      this._cdr.detectChanges()

      this._orderSelectorOdsService.addComponent(orderindex, 'A', additional.product.product, [data])

      target.classList.remove("loading")
      target.disabled = false
      this._cdr.detectChanges()
    }
  }

  public onClickRevertOrderComponent(componentid: string, orderitemindex: number): void {
    this._orderSelectorOdsService.revertComponentByActionAndId('A', componentid, orderitemindex)
    this._cdr.detectChanges()
  }

  public onClickClose() {
    this.show = false
    this._cdr.detectChanges()
    
    setTimeout(() => {
      if (this.data.close)
        this.data.close()
    }, 200)
    
  }
  
  @HostListener("window:resize") onResize() {
    this.resize()
  }

  ngOnDestroy(): void {
    this._document.body.classList.remove('no-scroll')
  }

  ngOnInit(): void {
    this.show = true
    this._cdr.detectChanges()
  }

  ngAfterViewInit(): void {
    this._document.body.classList.add('no-scroll')

    if (this.dialog) {
      this.dialog.nativeElement.className = `mat-dialog`
      this.dialog.nativeElement.style.zIndex = this.data.style.zIndex

      this.resize()
    }
  }

}