import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import { IProduct, IProductSettingsAdditional, IProductsSearchQuery } from "../product";
import { IOrderItemComponentData, TOrderComponentAction } from "src/app/orders/order-selector";
import { concat, debounceTime, distinctUntilChanged, firstValueFrom, Subscription, take } from "rxjs";
import { OrderSelectorOdsService } from "src/app/catalog/order-selector.ods.service";
import { FormControl, FormGroup } from "@angular/forms";
import { ApiSearchResponse } from "src/app/utils/global";
import { AdditionalListComponent } from "../additional-list/addition-list.component";
import { AppService } from "src/app/app.service";
import { Router } from "@angular/router";
import { StyleService } from "src/app/utils/styles/styles.service";
import { UsersService } from "src/app/users/users.service";

@Component({
  templateUrl: 'order-selector.component.html',
  styleUrls: ['order-selector.component.sass']
})
export class OrderSelectorComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscriptions: Subscription[] = []

  public demanding = false
  public demandingadditionals = true
  public selecteddrinksvalue = 0
  public selecteddrinkslength = 0
  public isborderexpanded = true
  public isdrinkexpanded = true
  public componentfilters: Array<string> = []
  public txobs: FormControl = new FormControl()
  public borders: Array<IProductSettingsAdditional> = []
  public drinks: ApiSearchResponse<IProduct, IProductsSearchQuery> = {
    count: 0,
    data: []
  }

  public additionalDialogConfig = { component: AdditionalListComponent }
  public filterComponentForm = new FormGroup({
    search: new FormControl('')
  })

  get order(): OrderSelectorOdsService {
    return this._orderSelectorOdsService
  }

  get obs(): string {
    return this.txobs && this.txobs.value ? this.txobs.value : ''
  }

  constructor(
    private _location: Location,
    private _router: Router,
    private _cdr: ChangeDetectorRef,
    private _appService: AppService,
    private _orderSelectorOdsService: OrderSelectorOdsService,
    private _userService: UsersService,
    styleService: StyleService
  ) {
    this._cdr.detach()

    styleService.loadStyle('mat-radio')
    styleService.loadStyle('mat-dialog')
  }

  private buy() {
    this._orderSelectorOdsService.buy()
    this._router.navigate([`basket`])
  }

  private getAdditionals(): void {
    this._orderSelectorOdsService.getAdditionals().then(() => {
      this.demandingadditionals = false
      this._cdr.detectChanges()
    })
  }

  private checkComponentActions(): void {
    this.subscriptions.push(
      concat(this.order.components$).pipe(take(1)).subscribe(list => {
        this.subscriptions.push(
          concat(list).pipe(take(1)).subscribe(components => {

            const i = components.findIndex(component => {
              if (
                (component.action === 'C' && component.selected.length === 0) ||
                (component.action === 'N' && component.data[0].product.settings && component.data[0].product.settings.obs.findIndex(obs => typeof (obs.selected) === 'undefined') >= 0)
              ) {
                
                if (component._id)
                  this._appService.detachElement('Por favor, escolha uma opção', component._id)

                return true
              } else
                return false
            })

            if (i < 0)
              this.buy()
          })
        )
      })
    )
  }

  public isBorderSelected(current: any, compare: any): boolean {
    return current && current._id === compare.additionalid
  }

  public loadImage(images: Array<string>, size: string): string {
    if (images && (images.length || 0) > 0) {
      return this._appService.getMediumImages(images[0])
    } else
      return ''
  }

  public filterComponent(data: Array<IOrderItemComponentData>, componentindex: number): IOrderItemComponentData[] {
    if (this.componentfilters[componentindex] && this.componentfilters[componentindex].length > 0) {
      const reg = new RegExp(this.componentfilters[componentindex], 'i')

      return data.filter(it => it.product.product.search(reg) >= 0)
    } else
      return data
  }

  public onChangeObsOptions(orderindex: number, componentindex: number, obsindex: number, selected: number): void {
    this._orderSelectorOdsService.switchObs(orderindex, componentindex, obsindex, selected)
    this._cdr.detectChanges()
  }

  public onClickBuy(): void {
    this.checkComponentActions()
  }

  public onClickNavigateToCatalog(): void {
    this._router.navigate([``])
  }

  public onClickRevertOrderComponent(action: TOrderComponentAction, componentid: string, orderitemindex: number): void {
    this._orderSelectorOdsService.revertComponentByActionAndId(action, componentid, orderitemindex)
    this._cdr.detectChanges()
  }

  public onChangeComponentOptions(orderindex: number, componentindex: number, selected: number): void {
    this._orderSelectorOdsService.switchComponent(orderindex, componentindex, selected)
    this._cdr.detectChanges()
  }

  public onPushComponentOptions(orderindex: number, componentindex: number, selected: number): void {
    this._orderSelectorOdsService.pushComponent(orderindex, componentindex, selected)
    this._cdr.detectChanges()
  }

  public onPullOutComponentOptions(orderindex: number, componentindex: number, selected: number): void {
    this._orderSelectorOdsService.pullOutComponent(orderindex, componentindex, selected)
    this._cdr.detectChanges()
  }

  public countComponentOption(orderitemindex: number, componentindex: number, selected: number): number {
    return this._orderSelectorOdsService.countComponentOption(orderitemindex, componentindex, selected)
  }

  public onClickAddBorder(border: IProduct): void {
    this._orderSelectorOdsService.addBorder(border)
    this._cdr.detectChanges()
  }

  public onDrinksChange(ev: any) {
    this.selecteddrinkslength = ev.selecteddrinkslength
    this.selecteddrinksvalue = ev.selecteddrinksvalue

    this._cdr.detectChanges()
  }

  public onCloseAdditional(ev: any) {
    this._cdr.detectChanges()
  }

  public onClickRemoveBorder(): void {
    this._orderSelectorOdsService.removeBorder()
    this._cdr.detectChanges()
  }

  public onSubmitComponentForm(componentindex: number): void {
    this.componentfilters[componentindex] = this.filterComponentForm.value.search || ''
    this._cdr.detectChanges()
  }

  public onClickBack(): void {
    this._location.back()
  }

  ngAfterViewInit(): void {
    this.txobs.setValue(this.order.obs)

    this.subscriptions.push(this.txobs.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => this.order.obs = value))

    if (window)
      window.document.getElementById('app-book')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  ngOnInit(): void {
    this._orderSelectorOdsService.initialize().then(() => {
      this.getAdditionals()
      this.demanding = false
      this._cdr.detectChanges()
    })

    if (this._appService.auth)
      Promise.resolve(firstValueFrom(this._userService.getLogged()))

    this.subscriptions.push(
      this.order.borderlist$.subscribe(borders => {
        this.borders = borders
        this._cdr.detectChanges()
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(ev: any): void {
    ev.preventDefault()
    this._orderSelectorOdsService.cancel()
  }

}