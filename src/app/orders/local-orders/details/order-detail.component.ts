import { TitleCasePipe } from "@angular/common";
import { Component, ElementRef, ViewChild, Input, ChangeDetectorRef, Output, EventEmitter, AfterViewInit, OnInit, HostListener } from "@angular/core";
import { AppService } from "src/app/app.service";
import { slideXToggleAnimation } from "src/app/utils/animations/slide-x-toggle.animation";

@Component({
  templateUrl: 'order-detail.component.html',
  styleUrls: ['../../basket/basket-items/basket-items.component.sass'],
  animations: [slideXToggleAnimation]
})
export class OrderDetailComponent implements AfterViewInit, OnInit {
  @ViewChild('dialog') dialog?: ElementRef<HTMLDivElement>
  @Input() public data: any
  @Output() close: EventEmitter<void> = new EventEmitter()

  public show = true

  constructor(
    private _cdr: ChangeDetectorRef,
    private titleCasePipe: TitleCasePipe,
    private _appService: AppService
  ) {
    this._cdr.detach()
  }

  private resize(): void {
    if (this.dialog && window)
      this.dialog.nativeElement.style.height = `${(window as Window).innerHeight}px`

    this._cdr.detectChanges()
  }

  public onClickClose(): void {
    this.show = false
    this._cdr.detectChanges()
    
    setTimeout(() => {
      if (this.data.close)
        this.data.close()
        
    }, 200)
    
  }

  public getRelevant(componentlist: Array<any>): string {
    const response: Array<string> = []

    componentlist.forEach(component => {
      if (component.action === 'C') {
        const ingredients: Array<any> = []

        component.selected.forEach((idx: number) => {
          ingredients.push(this.titleCasePipe.transform(component.data[idx].product.product))
        })

        response.push(`${this.titleCasePipe.transform(component.name)}: ${ingredients.join(', ')}`)
      } else
        if (component.action === 'A')
          response.push(`+${this.titleCasePipe.transform(component.name)}`)
        else
          if (component.action === `R`)
            response.push(`sem ${this.titleCasePipe.transform(component.name)}`)

      if (component.action == 'N' || component.action === 'A')
        component.data.forEach((item: any) => {

          if (item.product.settings)
            item.product.settings.obs.forEach((obs: any) => {
              if ('selected' in obs && obs.selected >= 0) {
                response.push(`${this.titleCasePipe.transform(obs.name)}: ${this.titleCasePipe.transform(obs.data[obs.selected])}`)
              }
            })

        })
    })


    return response.join(', ')
  }

  public loadImage(images?: string): string {
    if (images) {
      return this._appService.getMiniatureImage(images)
    } else
      return ''
  }

  public getQuantityDescription(quantity: number | null, measure: string): string {
    if (quantity) {
      let response: string;
      switch (measure) {
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

  ngOnInit(): void {
    this._cdr.detectChanges()
  }

  ngAfterViewInit(): void {
    if (this.dialog) {
      this.dialog.nativeElement.className = `mat-dialog`
      this.dialog.nativeElement.style.zIndex = this.data.style.zIndex
    }
  }

  @HostListener("window:resize") onResize() {
    this.resize()
  }

}