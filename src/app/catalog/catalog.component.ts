import { DOCUMENT } from "@angular/common";
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { FormControl } from "@angular/forms";
import { HammerGestureConfig } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject, firstValueFrom, Subscription } from "rxjs";
import { AppService } from "../app.service";
import { IOrderBasketItem } from "../orders/order-basket";
import { OrderOdsService } from "../orders/order.ods.service";
import { OrderService } from "../orders/order.service";
import { ISummaryOrder, SummaryOrderPocStatus } from "../orders/summary-order";
import { IProduct, IProductCategory, IProductSettings, IProductsSearchQuery, OrderType, ProductType } from "../products/product";
import { ProductsService } from "../products/products.service";
import { UsersService } from "../users/users.service";
import { ApiSearchResponse } from "../utils/global";
import { CategoriesListComponents } from "./categories/categories.component";
import { OrderSelectorOdsService } from "./order-selector.ods.service";

@Component({
  templateUrl: 'catalog.component.html',
  styleUrls: ['catalog.component.sass', '../utils/styles/menu-catalog.sass']
})
export class CatalogComponent  implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('categoriesElement') categoriesElement!: CategoriesListComponents
  @ViewChildren('catalog') catalogElements?: QueryList<ElementRef>

  private productsSubscription?: Subscription
  private _subscriptions: Subscription[] = []
  private _limitdefault: number = 9

  public demandingCategories = true
  public demanding = true

  public selectedCategory?: IProductCategory
  public selectedItems: Array<IProduct> = []
  public qtdselection: number = -1
  public txproductsearch: FormControl = new FormControl()
  public products: ApiSearchResponse<IProduct, any> = { totalCount: 0, data: [] }
  public categories: Array<IProductCategory> = []
  public filters: IProductsSearchQuery
  public items: IOrderBasketItem[] = []
  public thatsAllFolks = false
  public summaryOrder?: ISummaryOrder
  public selecteddrinks: {[key: string]: BehaviorSubject<number>} = {}
  public ordertype: OrderType = OrderType.local
  
  public readonly company = this._appService.company!
  public readonly SummaryOrderPocStatus = SummaryOrderPocStatus
  public readonly ProductType = ProductType
  public readonly sortList = [
    { label: 'A-Z', value: 'name' },
    { label: 'Menor preço', value: 'lowerprice' },
    { label: 'Maior preço', value: 'higherprice' },
    { label: 'Maior desconto', value: 'higherdiscount' }
  ]

  public readonlyCatalog: boolean = this.company.islocalreadonly || false

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private _productsService: ProductsService,
    private _orderSelectorODSService: OrderSelectorOdsService,
    private _appService: AppService,
    private _cdr: ChangeDetectorRef,
    private _router: Router,
    private _route: ActivatedRoute,
    private _hammerGestureConfig: HammerGestureConfig,
    private _orderOdsService: OrderOdsService,
    private _orderService: OrderService,
    private _userService: UsersService
  ) {
    this._cdr.detach()
    this.filters = {
      limit: this._limitdefault,
      page: 0,
      search: '',
      ordertype: this.ordertype
    }
  }

  private navigateToPreferencesIfNeeds() {
    this._appService.log = null

    if (this.selectedCategory && this.selectedItems.length === this.qtdselection) {
      this.demanding = true
      this._cdr.detectChanges()

      this._orderSelectorODSService.create(this.selectedCategory, this.qtdselection, this.selectedItems).then(() => {
        this.goToPreference()
      })
    } else {
      if (this.selectedItems.length === 0)
        this._appService.log = `Selecione o primeiro sabor`
      else
        this._appService.log = `Selecione o próximo sabor`

      this._cdr.detectChanges()
    }
  }

  private goToPreference() {
    this._router.navigate([`preferences`])
  }

  private addProduct(product: IProduct): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.selectedCategory && this.selectedCategory.qtdselection <= 1)
        this.qtdselection = 1

      if (this.qtdselection > 0) {
        this._orderSelectorODSService.getSettingsAndComponents(product).subscribe((settings: IProductSettings) => {
          product.settings = settings

          const qtd = (1000 / this.qtdselection) / 1000

          resolve()

          if (product.settings && product.settings.minqtd > 0 && qtd < product.settings.minqtd)
            this._appService.log = `O produto ${product.product} não pode ser divido por ${this.qtdselection}`
          else {
            product.settings = settings
            this.selectedItems.push(product)
            this.navigateToPreferencesIfNeeds()
          }

        })
      } else {
        resolve()
        this._appService.detachElement('Em quantos sabores você quer dividir?', 'division-list')
      }

    })
  }

  private selectCategory(categoryid: string | null): void {
    if (categoryid === null)
      return

    this.productsSubscription?.unsubscribe()
    
    this.demanding = true
    this.products = { totalCount: 0, data: [] }
    this.filters.page = 0

    if (
      (this.selectedCategory && this.selectedCategory._id !== categoryid) ||
      !this.selectedCategory
    ) {
      this.selectedItems = []
      this.qtdselection = -1
    }

    this._cdr.detectChanges()

    firstValueFrom(this._productsService.getCategoryById(categoryid)).then(category => {
      this.filters.categoryid = categoryid
      this.selectedCategory = category
      this._cdr.detectChanges()
      this.getProducts()
    })
  }

  private selectFirstCategory() {
    if (this.categories.length === 0)
      setTimeout(() => this.selectFirstCategory(), 100)
    else {
      if (this.categories[0].children && this.categories[0].children.length > 0)
        this.selectCategory(this.categories[0].children[0]._id)
      else
        this.selectCategory(this.categories[0]._id)
    }
  }

  private productDemandNext() {
    if (!this.demanding) {
      const next = Number(this.filters.page) + 1

      if (this.products.totalCount > next * (this.filters.limit ? this.filters.limit : this._limitdefault)) {
        this.demanding = true
        this.filters.page = next
        this._cdr.detectChanges()

        this.getProducts()
      } else
        this.thatsAllFolks = true
    }
  }

  private getProducts() {
    this.thatsAllFolks = false

    this.productsSubscription = this._productsService
      .getProducts(this.filters)
      .subscribe((response: ApiSearchResponse<IProduct, IProductsSearchQuery>) => {
      if (response) {
        this.products.data.push(...response.data)
        this.products.totalCount = response.totalCount
        this.demanding = false

        if (response.filters)
          this.filters = response.filters

        this._cdr.detectChanges()
      }
    })
  }

  private getCategories(): void {
    firstValueFrom(this._productsService.getCategories()).then(response => {
      this.categories = response
      this.demandingCategories = false

      this._cdr.detectChanges()
    })
  }

  private catalogScroll() {
    const appBook = this._document.getElementById('app-book')

    if (appBook) {
      appBook.onscroll = (ev) => {
        if (appBook.scrollHeight - 70 <= appBook.scrollTop + appBook.clientHeight) {
          if (!this.thatsAllFolks)
            this.productDemandNext()
        }
      }
    }
  }

  private getSummaryOrder(summaryOrderId: string) {
    this._subscriptions.push(this._orderService.getSummaryOrder(summaryOrderId).subscribe(summaryOrder => {
      if (summaryOrder && summaryOrder.pocstatus >= SummaryOrderPocStatus.close_request) {
        //this.readonlyCatalog = true
        this._cdr.detectChanges()
      }
    }))
  }

  private addDrink(product: IProduct, qtd: number): void {
    const index = this._orderOdsService.getItemIndexByProductId(product._id)

    if (index >= 0)
      this._orderOdsService.addItem(index, qtd)
    else
      this._orderOdsService.addItem(product, 1)
  }

  private deleteDrink(productid: string) {
    const index = this._orderOdsService.getItemIndexByProductId(productid)

    if (index >= 0)
      this._orderOdsService.removeItem(index)

    this._cdr.detectChanges()
  }

  public onClickAddDrink(product: IProduct, qtd: number = 1): void {
    if (qtd <= 0)
      return

    this.addDrink(product, qtd)
    this.selecteddrinks[product._id].next(qtd)
    this._cdr.detectChanges()
  }

  public onSelectCategory(category: IProductCategory): void {
    this.demanding = true
    this._cdr.detectChanges()

    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {
        category: category._id
      },
      queryParamsHandling: 'merge'
    })
  }

  public onClickSelectQtdSelection(qtd: any): void {
    this.qtdselection = qtd
    this.selectedItems = []
    this._appService.log = 'Selecione os sabores'
    this.navigateToPreferencesIfNeeds()
  }

  public onSubmitFormSearch(event: any): void {
    event.preventDefault()
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {
        search: this.txproductsearch.value
      },
      queryParamsHandling: 'merge'
    })
  }

  public getProductImage(images: Array<string>): string {
    return images.length > 0 ? this._appService.getMediumImages(images[0]) : ''
  }

  public getProductMiniature(images: Array<string>): string {
    return images.length > 0 ? this._appService.getMiniatureImage(images[0]) : ''
  }

  public hasProductInOrder(products: Array<IProduct>, productid: string): boolean {
    return products.findIndex(item => item._id === productid) >= 0
  }

  public onClickOrderBy(orderby: string) {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: { orderby },
      queryParamsHandling: 'merge'
    })
  }

  public onClickDeleteProduct(productid: string): void {
    this.selectedItems = this.selectedItems.filter(item => item._id !== productid)
  }

  public onClickProduct(ev: Event, product: IProduct): void {
    if (this.selectedCategory?.categorytype === 'F') {
      const button: HTMLButtonElement = ev.target as HTMLButtonElement

      button.disabled = true;
      button.classList.add("loading")

      this._appService.log = null
      this._cdr.detectChanges()

      this.addProduct(product).then(() => {
        button.disabled = false
        button.classList.remove("loading")
      })
    } else
      if (this.selectedCategory?.categorytype === 'D')
        this._router.navigate([`/product/${product._id}`])
  }

  public onClickQrScanner(): void {
    this._router.navigate(['scanner'])
  }

  public onClickHome(): void {
    this._router.navigate([``])
  }

  public onClickBasket(): void {
    this._router.navigate(['basket'])
  }

  public onClickOrder() {
    this._router.navigate(['order'])
  }

  public onClickUser(): void {
    this._router.navigate(['me'])
  }

  public onClickDeleteDrink(id: string): void {
    this.deleteDrink(id)
    delete this.selecteddrinks[id]
    //this.order.deleteDrink(id)
  }

  ngAfterViewInit(): void {
    if (this.catalogElements) {
      this._subscriptions.push(
        this.catalogElements?.changes.subscribe(sub => {
          if (sub.first) {

            const hammer = this._hammerGestureConfig.buildHammer(sub.first.nativeElement)
            
            hammer.on('swiperight', (event: any) =>
              this.categoriesElement.prev()
            )

            hammer.on('swipeleft', (event: any) =>
              this.categoriesElement.next()
            )
          }
        }),

        this._orderOdsService.items$.subscribe(value => {
          this.items = value
          this._cdr.detectChanges()
        }),

        this._appService.user$.subscribe(user => {
          if (user?.localorder && !this.readonlyCatalog)
            this.getSummaryOrder(user.localorder._id)

          this._cdr.detectChanges()
        })
      )
    }

    this.catalogScroll()
  }

  ngOnInit(): void {
    if (this._appService.isBrowser && window) {
      console.log(window.innerWidth);
      if (window && window.innerWidth > 800)
        this._limitdefault = 18
    }
    this._cdr.detectChanges()
    this.getCategories()

    if (this._appService.auth)
      Promise.resolve(firstValueFrom(this._userService.getLogged()))

    this._subscriptions.push(
      this._route.queryParamMap.subscribe(params => {
        this.filters = {
          ...this.filters,
          limit: this._limitdefault,
          page: 0
        }

        this.products.totalCount = 0;
        this.products.data = []

        if (params.has('search')) {
          this.filters.search = params.get('search')
          this.txproductsearch.setValue(this.filters.search)
        }

        if (params.has('orderby') !== null)
          this.filters.sortName = params.get('orderby');

        if (params.has('category'))
          this.selectCategory(params.get('category'))
        //else if(this._orderSelectorODSService.header.category)
        //  this.selectCategory(this._orderSelectorODSService.header.category._id)
        else
          this.selectFirstCategory()

        this._cdr.detectChanges()
      })
    )

    this._subscriptions.push(
      this._orderOdsService.items$.subscribe(response => {
        this.selecteddrinks = {}
        //this.selecteddrinkslength = 0
        //this.drinkvalue = 0
        

        response.forEach(item => {
          if (
            (item.product as IProduct).category &&
            (item.product as IProduct).category?.categorytype === 'D'
          ) {
            this.selecteddrinks[(item.product as IProduct)._id] = new BehaviorSubject(item.qtd)
              //this.selecteddrinkslength++
              //this.drinkvalue += ((item.product as IProduct).prices.cashpayment * 100) * item.qtd / 100
              /*
              this.onChange.emit({
                selecteddrinksvalue: this.drinkvalue,
                selecteddrinkslength: this.selecteddrinkslength
              })
              */
            }
        })
      })
    )
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach(item => item.unsubscribe())
  }
}