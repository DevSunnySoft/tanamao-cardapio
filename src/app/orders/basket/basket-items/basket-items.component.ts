import { TitleCasePipe } from "@angular/common";
import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";
import { map, Observable, of, Subscription } from "rxjs";
import { AppService } from "src/app/app.service";
import { StyleService } from "src/app/utils/styles/styles.service";
import { OrderOdsService } from "../../order.ods.service";

@Component({
  selector: 'app-basket-items',
  templateUrl: 'basket-items.component.html',
  styleUrls: ['basket-items.component.sass']
})
export class BasketItemsComponent implements OnInit, OnDestroy {
  @Output() public isValidState = new EventEmitter<boolean>()

  private _subscriptions: Array<Subscription> = []

  public isValid: boolean = false
  public demanding = true
  public items$: Observable<Array<any>> = this._orderOdsService.items$.pipe(
    map(items => {
      let data = items.map((item, index) => {
        return { item: { ...item, qtd: of(item.qtd) }, index }
      })

      return data.sort((a, b) => {
        if ('header' in a.item.product && !('header' in b.item.product))
          return -1
        else
          if (!('header' in a.item.product) && 'header' in b.item.product)
            return 1
          else
            return 0
      })
    })
  )

  constructor(
    private _orderOdsService: OrderOdsService,
    private _appService: AppService,
    private _cdr: ChangeDetectorRef,
    private _router: Router,
    private titleCasePipe: TitleCasePipe,
    styleService: StyleService
  ) {
    this._cdr.detach()
    styleService.loadStyle('mat-menu')
  }

  public removeOrderItem(basketindex: number, basketlength: number): void {
    this._orderOdsService.removeItem(basketindex)

    if (basketlength === 1)
      this.onClickKeep()
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

  public editOrderSelector(data: any, basketindex: number): void {
    data.header.basketindex = basketindex
    if (window)
      window.sessionStorage.setItem('_OS', btoa(JSON.stringify(data)))

    this._router.navigate([`preferences`], {
      queryParams: { gotodrinks: 'true' }
    })
  }

  public onChangeQtd(qtd: number, i: number): void {
    if (qtd)
      this._orderOdsService.addItem(i, qtd)

    this._cdr.detectChanges()
  }

  public onClickDetails(id: string) {
    this._router.navigate([`${id}`])
  }

  public onClickKeep(): void {
    this._router.navigate([''])
  }

  ngOnInit(): void {
    this._subscriptions.push(
      this.items$.subscribe(items => {
        this.demanding = false
        this._cdr.detectChanges()
      })
    )

    this._cdr.detectChanges()
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach(sub => sub.unsubscribe())
  }


}