import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject, debounceTime, distinctUntilChanged, firstValueFrom, Subscription } from "rxjs";
import { AppService } from "src/app/app.service";
import { IOrderBasketItem } from "src/app/orders/order-basket";
import { OrderOdsService } from "src/app/orders/order.ods.service";
import { UsersService } from "src/app/users/users.service";
import { StyleService } from "src/app/utils/styles/styles.service";
import { IProduct } from "../product";
import { ProductsService } from "../products.service";

@Component({
  templateUrl: 'product-details.component.html',
  styleUrls: ['product-details.component.sass']
})
export class ProductDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  private _subscriptions: Subscription[] = []
  private readonly productid: string
  private _localquantity = new BehaviorSubject<number>(0)
  private _item?: IOrderBasketItem

  public readonly user$ = this._appService.user$
  public readonly items$ = this._orderOdsService.items$
  public readonly localquantity$ = this._localquantity.asObservable()
  public itemindex: number = -1
  public product?: IProduct
  public txobs: FormControl = new FormControl('')
  public demanding = true
  public isobsexpanded = true

  set localquantity(value: number) {
    this._localquantity.next(value)
  }

  constructor(
    private _appService: AppService,
    private _productsService: ProductsService,
    private _route: ActivatedRoute,
    private _cdr: ChangeDetectorRef,
    private _orderOdsService: OrderOdsService,
    private _router: Router,
    private _userService: UsersService,
    styleService: StyleService
  ) {
    this._cdr.detach()
    this.productid = this._route.snapshot.params['productid']
    styleService.loadStyle('mat-menu')
  }

  private subscribeItem() {
    this._subscriptions.push(
      this.items$.subscribe((items: Array<IOrderBasketItem>) => {
        this.itemindex = items.findIndex((item: any) => 'header' in item.product ? false : item.product._id === this.productid)

        if (this.itemindex >= 0) {
          this._item = <IOrderBasketItem>items[this.itemindex]
          this.localquantity = this._item.qtd

          if (this._item.obs)
            this.txobs.setValue(this._item.obs, { emitEvent: false })
        }

      })
    )
  }


  private getProduct() {
    if (this.productid)
      firstValueFrom(this._productsService.getProductById(this.productid)).then((response: IProduct) => {
        this.product = response

        if (response.settings)
          this.localquantity = response.settings && response.settings.minqtd && response.measure === 'KG' ? response.settings.minqtd : 1

        this.subscribeItem()
        this.demanding = false
        this._cdr.detectChanges()
      })
  }

  public onChangeQtd(qtd: number): void {
    if (this.itemindex >= 0)
      this._orderOdsService.addItem(this.itemindex, qtd)
    else
      this.localquantity = qtd

    this._cdr.detectChanges()
  }

  public onClickRemove(): void {
    if (this.itemindex >= 0) {
      this._orderOdsService.removeItem(this.itemindex)
      this.txobs.setValue('', { emitEvent: false })

      if (this.product?.settings)
        this.localquantity = this.product?.settings?.minqtd | 1

      this._cdr.detectChanges()
    }
  }

  public loadImage(images: Array<string>): string {
    if (images && (images.length || 0) > 0) {
      return this._appService.getMediumImages(images[0])
    } else
      return ''
  }

  public onClickBasket(): void {
    this._router.navigate([`basket`])
  }

  public onClickKeep(): void {
    this._router.navigate([``])
  }

  public onClickBuy(): void {
    if (this.product) {
      this.demanding = true
      this._cdr.detectChanges()
      this._orderOdsService.addItem(this.product, this._localquantity.value, this.txobs.value)
      this.onClickBasket()
    }
  }

  public onClickCategory(categoryid?: string): void {
    if (categoryid)
      this._router.navigate([``], {
        queryParams: { category: categoryid }
      })
  }

  ngOnInit(): void {
    this.getProduct()

    if (this._appService.auth)
      Promise.resolve(firstValueFrom(this._userService.getLogged()))

    this._cdr.detectChanges()
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach(item => item.unsubscribe())
  }

  ngAfterViewInit(): void {
    this._subscriptions.push(
      this.txobs.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
      ).subscribe(value => {
        if (this.itemindex >= 0 && typeof (value) !== 'undefined')
          this._orderOdsService.addItemObs(value, this.itemindex)
      }),

      this.localquantity$.subscribe(v =>
        this._cdr.detectChanges()
      )
    )
  }


}