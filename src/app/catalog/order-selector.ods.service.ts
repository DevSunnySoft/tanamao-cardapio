import { Injectable } from '@angular/core'
import { BehaviorSubject, firstValueFrom, Observable, ReplaySubject } from 'rxjs'
import { AppService } from '../app.service'
import { IProduct, IProductCategory, IProductSettings, IProductSettingsAdditional, IProductSettingsComponent, IProductsSearchQuery } from '../products/product'
import { ProductsService } from '../products/products.service'
import { ApiSearchResponse } from '../utils/global'
import { OrderOdsService } from '../orders/order.ods.service'
import { IOrderItemComponentData, IOrderItemComponents, IOrderSelector, IOrderSelectorDrink, IOrderSelectorHeader, IOrderSelectorItem, TOrderComponentAction } from './order-selector'

@Injectable({
  providedIn: 'root'
})
export class OrderSelectorOdsService {
  private _orderSelector?: IOrderSelector

  private _drinks: BehaviorSubject<Array<IOrderSelectorDrink>> = new BehaviorSubject(<Array<IOrderSelectorDrink>>[])
  private _price: BehaviorSubject<number> = new BehaviorSubject(0)
  private _border: ReplaySubject<IProduct | undefined> = new ReplaySubject(1)
  private _components: Array<BehaviorSubject<Array<IOrderItemComponents>>> = []
  private _additionals: Array<BehaviorSubject<Array<IProductSettingsAdditional>>> = []
  private _products: BehaviorSubject<Array<IProduct>> = new BehaviorSubject(<Array<IProduct>>[])

  private _borderlist: BehaviorSubject<Array<IProductSettingsAdditional>> = new BehaviorSubject(<Array<IProductSettingsAdditional>>[])
  public _drinklist: BehaviorSubject<ApiSearchResponse<IProduct, IProductsSearchQuery>> = new BehaviorSubject(<ApiSearchResponse<IProduct, IProductsSearchQuery>>{ totalCount: 0, data: [] })

  // lista de bordas adicionaveis que cada produto do combo
  public borders: Array<IProductSettingsAdditional> = []

  // lista de adicionais selecionaveis de cada produto combo
  public additionals: Array<Array<IProductSettingsAdditional>> = []

  public readonly price$: Observable<number> = this._price.asObservable()
  public readonly border$: Observable<IProduct | undefined> = this._border.asObservable()
  public readonly borderlist$: Observable<Array<IProductSettingsAdditional>> = this._borderlist.asObservable()
  public readonly drinks$: Observable<Array<IOrderSelectorDrink>> = this._drinks.asObservable()
  public readonly products$: Observable<Array<IProduct>> = this._products.asObservable()
  public readonly drinklist$: Observable<ApiSearchResponse<IProduct, IProductsSearchQuery>> = this._drinklist.asObservable()

  get hasOrder() {
    return this._orderSelector ? true : false
  }

  get qtdSelection(): number {
    return this._orderSelector ? this._orderSelector.header.qtdselection : 0
  }

  get additionals$(): Array<Observable<Array<IProductSettingsAdditional>>> {
    return this._additionals.map(item => item.asObservable())
  }

  get components$(): Array<Observable<Array<IOrderItemComponents>>> {
    return this._components.map(item => item.asObservable())
  }

  get hasInitialized(): boolean {
    return this._orderSelector ? true : false
  }

  get data(): any {
    return this._orderSelector ? this._orderSelector.data : []
  }

  get price(): number {
    return this._orderSelector ? this._orderSelector.price : 0
  }

  get header(): IOrderSelectorHeader {
    return this._orderSelector ? this._orderSelector.header : {
      qtdselection: 1,
      basketindex: -1
    }
  }

  get border() {
    return this._orderSelector ? this._orderSelector.border : undefined
  }

  get drinks() {
    return this._orderSelector ? this._orderSelector.drinks : []
  }

  get obs(): string {
    return this._orderSelector && this._orderSelector.obs ? this._orderSelector.obs : ''
  }

  set obs(value: string) {
    if (this._orderSelector)
      this._orderSelector.obs = value
  }

  constructor(
    private _appService: AppService,
    private _productsService: ProductsService,
    private orderODSService: OrderOdsService
  ) {}

  // private

  private saveChanges(): void {
    if (window) {
      window.sessionStorage.setItem('_OS', btoa(JSON.stringify(this._orderSelector)))
      window.sessionStorage.setItem('_OSD', new Date().toISOString())
    }
  }

  private getStored(): any {
    if (window) {
      let strdata = window.sessionStorage.getItem('_OS')

      try {
        if (strdata) {
          const response = JSON.parse(atob(strdata))

          if (this._appService.company && response.companyid === this._appService.company._id)
            return response
        }

        return
      } catch (err) {
        return
      }
    }
  }

  private clearStored(): void {
    if (window)
      window.sessionStorage.removeItem('_OS')
  }

  private calculatePrice(): void {
    if (this._orderSelector) {

      if (this._orderSelector.header.category) {
        let value = 0

        const qtdselection = this._orderSelector?.header?.qtdselection ? this._orderSelector.header.qtdselection : 1
        let qtd: number = Number(Number(1 / qtdselection * 1).toFixed(2))
        let unitprice = 0

        if (this._orderSelector.header.qtdselection >= this._orderSelector.header.category.qtdselchargehigher) {
          this._orderSelector.data.forEach(item => {
            if (item.product.prices.cashpayment > unitprice)
              unitprice = item.product.prices.cashpayment
          })
        }

        this._orderSelector.data = this._orderSelector.data.sort((a, b) => b.product.prices.cashpayment - a.product.prices.cashpayment)

        this._orderSelector.data.map((item: IOrderSelectorItem, index: number) => {
          if (this._orderSelector?.header.qtdselection === 3 && index === 2)
            qtd = 0.34


          item.price = unitprice > 0 ? unitprice : item.product.prices.cashpayment
          item.qtd = qtd

          value += ((item.price * 1000) * item.qtd)

          item.components.forEach(component => {
            if (component.action === 'A' || component.action === 'C') {
              component.selected.map((componentIndex, index) => {
                if (component.data[componentIndex]) {
                  if (component.data[componentIndex].product.prices.cashpayment > 0)
                    value += component.data[componentIndex].product.prices.cashpayment * 1000
                } else
                  component.selected.splice(index, 1)

                return component.selected
              })
            }
          })


          return item
        })

        this._orderSelector.drinks.forEach(item => value = value + ((item.product.prices.cashpayment * 1000) * item.qtd))

        if (this._orderSelector.border)
          value = value + (this._orderSelector.border.prices.cashpayment * 1000)

        this._orderSelector.price = value / 1000
      } else
        this._orderSelector.price = 0
    }
  }

  clear() {
    delete this._orderSelector

    this.additionals = []
    this.borders = []
    this._price.next(0)
    this._border.next(undefined)
    this._products.next([])
    this._borderlist.next([])
    this._drinks.next([])
    this._components = []
    this._additionals = []
  }

  async initialize(): Promise<void> {
    this._borderlist.next([])
    this._products.next([])

    if (
      !this._orderSelector ||
      (this._appService.company &&
        this._orderSelector &&
        this._orderSelector.companyid === this._appService.company._id)
    ) {
      let order: IOrderSelector = this.getStored()

      if (!order) {
        this.clear()
        return
      }
      this._orderSelector = order
    }

    this._price.next(this._orderSelector.price)
    this._border.next(this._orderSelector.border)
    this._products.next(this._orderSelector.data.map(data => data.product))
    this._components = this._orderSelector.data.map(data => new BehaviorSubject(data.components))
    this._additionals = []
    this._borderlist.next([])
    this._drinks.next(this._orderSelector.drinks)
  }

  getDrinks(data: ApiSearchResponse<IProduct, IProductsSearchQuery>, cb: any): void {
    let drinklist: Array<any> = []

    drinklist = (data.filters?.page === 0) ? [] : data.data

    const sub = this._productsService
      .getProducts(data.filters ? data.filters : {})
      .subscribe((response: any) => {
        drinklist.push(...response.data)
        this._drinklist.next({
          data: drinklist,
          totalCount: response.totalCount
        })

        cb()
        sub.unsubscribe()
      })
  }

  cancel() {
    if (this._orderSelector && this._orderSelector.header.category) {
      this.create(this._orderSelector.header.category, this._orderSelector.header.qtdselection)
      this.additionals = []
      this.borders = []
      this._price.next(this._orderSelector.price)
      this._border.next(this._orderSelector.border)
      this._products.next([])
      this._borderlist.next([])
      this._drinks.next([])
      this._components = []
      this._additionals = []
    }
  }

  async create(category: IProductCategory, qtdselection: number, items?: Array<IProduct>): Promise<void> {
    this._orderSelector = {
      companyid: this._appService.company ? this._appService.company._id : '',
      header: {
        category,
        qtdselection,
        basketindex: -1
      },
      data: [],
      drinks: [],
      price: 0
    }

    this.saveChanges()

    if (items)
      await Promise.all(items.map(item => this.addItem(item)))
  }

  private filterComponentsIsVisible(components: Array<IProductSettingsComponent>): Array<IProductSettingsComponent> {
    components.forEach((component: IProductSettingsComponent, index: number) => {
      component.data = component.data.filter(it => {
        return it.isvisible === true //&& it.product.isactive === true
      })
      components[index] = component
    })

    return components.filter(value => value.data.length > 0)
  }

  async addItem(product: IProduct): Promise<void> {
    if (this._orderSelector) {
      let components: any[] = []

      if (product.settings)
        components = this.filterComponentsIsVisible(product.settings.components)
      else {
        const settings = await firstValueFrom(this.getSettingsAndComponents(product))
        if (settings)
          components = this.filterComponentsIsVisible(settings.components)
      }

      delete product.settings

      this._orderSelector.data.push({ product, components })

      this.calculatePrice()
      this.saveChanges()

      this._products.next(this._orderSelector.data.map(data => data.product))
    }
  }

  deleteItem(productid: string): void {
    if (this._orderSelector) {
      this._orderSelector.data = this._orderSelector.data.filter(item => item.product._id !== productid)
      this.additionals = []
      this.borders = []

      this.calculatePrice()
      this.saveChanges()

      this._products.next(this._orderSelector.data.map(item => item.product))
      this._price.next(this._orderSelector.price)
    }
  }

  addDrink(product: IProduct): void {
    if (this._orderSelector) {
      const index = this._orderSelector.drinks.findIndex(item => item.product._id === product._id)

      if (index < 0)
        this._orderSelector.drinks.push({ product, qtd: 1 })
      else
        this._orderSelector.drinks[index].qtd++

      this.calculatePrice()
      this.saveChanges()

      this._drinks.next(this._orderSelector.drinks)
      this._price.next(this._orderSelector.price)
    }
  }

  changeDrink(productid: string, qtd: number): void {
    if (this._orderSelector) {
      const index = this._orderSelector.drinks.findIndex(item => item.product._id === productid)

      if (index >= 0) {
        if (qtd > 0)
          this._orderSelector.drinks[index].qtd = qtd
        else
          this._orderSelector.drinks.splice(index, 1)

        this.calculatePrice()
        this.saveChanges()

        this._drinks.next(this._orderSelector.drinks)
        this._price.next(this._orderSelector.price)
      }
    }
  }

  deleteDrink(productid: string): void {
    if (this._orderSelector) {
      const index = this._orderSelector.drinks.findIndex(item => item.product._id === productid)
      if (index >= 0) {
        this._orderSelector.drinks.splice(index, 1)

        this.calculatePrice()
        this.saveChanges()

        this._drinks.next(this._orderSelector.drinks)
        this._price.next(this._orderSelector.price)
      }
    }
  }

  addBorder(product: IProduct): void {
    if (this._orderSelector) {
      this._orderSelector.border = product

      this.calculatePrice()
      this.saveChanges()

      this._border.next(this._orderSelector.border)
      this._price.next(this._orderSelector.price)
    }
  }

  removeBorder(): void {
    if (this._orderSelector) {
      delete this._orderSelector.border

      this.calculatePrice()

      this._border.next(undefined)
      this._price.next(this._orderSelector.price)
    }
  }

  addComponent(orderitemindex: number, action: TOrderComponentAction, name: string, data: Array<IOrderItemComponentData>): void {
    if (this._orderSelector) {
      this._orderSelector.data[orderitemindex].components.push({
        name,
        action,
        data,
        selected: [0],
        qtdselection: 1
      })

      this.calculatePrice()
      this.saveChanges()

      this._components[orderitemindex].next(this._orderSelector.data[orderitemindex].components)
      this._price.next(this._orderSelector.price)
    }
  }

  switchComponent(orderitemindex: number, componentindex: number, selected: number): void {
    if (this._orderSelector) {
      if (this._orderSelector.data[orderitemindex].components[componentindex].action === 'C') {
        const qtdselection = this._orderSelector.data[orderitemindex].components[componentindex].qtdselection

        if (qtdselection === 1)
          this._orderSelector.data[orderitemindex].components[componentindex].selected = [selected]
        else {
          const idx = this._orderSelector.data[orderitemindex].components[componentindex].selected.indexOf(selected)

          if (idx < 0) {
            if (this._orderSelector.data[orderitemindex].components[componentindex].selected.length < qtdselection)
              this._orderSelector
                .data[orderitemindex]
                .components[componentindex]
                .selected.push(selected)
          } else
            this._orderSelector
              .data[orderitemindex]
              .components[componentindex]
              .selected.splice(idx, 1)
        }
      }

      this.calculatePrice()
      this.saveChanges()

      this._components[orderitemindex].next(this._orderSelector.data[orderitemindex].components)
      this._price.next(this._orderSelector.price)
    }
  }

  pullOutComponent(orderitemindex: number, componentindex: number, selected: number): void {
    if (this._orderSelector) {
      const idx = this._orderSelector.data[orderitemindex].components[componentindex].selected.indexOf(selected)
      this._orderSelector.data[orderitemindex].components[componentindex].selected.splice(idx, 1)

      this.calculatePrice()
      this.saveChanges()

      this._components[orderitemindex].next(this._orderSelector.data[orderitemindex].components)
      this._price.next(this._orderSelector.price)
    }
  }

  pushComponent(orderitemindex: number, componentindex: number, selected: number): void {
    if (this._orderSelector) {
      if (this._orderSelector.data[orderitemindex].components[componentindex].selected.length < this._orderSelector.data[orderitemindex].components[componentindex].qtdselection)
        this._orderSelector.data[orderitemindex].components[componentindex].selected.push(selected)

      this.calculatePrice()
      this.saveChanges()

      this._components[orderitemindex].next(this._orderSelector.data[orderitemindex].components)
      this._price.next(this._orderSelector.price)
    }
  }

  countComponentOption(orderitemindex: number, componentindex: number, selected: number): number {
    if (this._orderSelector) {
      const data = this._orderSelector.data[orderitemindex].components[componentindex].selected.filter(it => selected === it)
      if (data.length > 0)
        return data.length
    }
    return 0
  }

  switchObs(orderitemindex: number, componentindex: number, obsindex: number, selected: number): void {
    if (this._orderSelector) {
      if (
        this._orderSelector.data[orderitemindex].components[componentindex].data.length > 0 && 
        this._orderSelector.data[orderitemindex].components[componentindex].data[0].product.settings !== undefined
      ) {
        const settings = this._orderSelector.data[orderitemindex].components[componentindex].data[0].product.settings

        if (settings)
          settings.obs[obsindex].selected = selected
      }

      this.saveChanges()
      this._components[orderitemindex].next(this._orderSelector.data[orderitemindex].components)
    }
  }

  revertComponentByActionAndId(action: TOrderComponentAction, componentid: string, orderitemindex: number): void {
    if (this._orderSelector) {

      const idx = this._orderSelector.data[orderitemindex].components.findIndex(item =>
        (item.action === action && item.data[item.selected[0] || 0].componentid === componentid)
      )

      if (action === 'A')
        this._orderSelector.data[orderitemindex].components.splice(idx, 1)
      else
        if (action === 'N' || action === 'C')
          this._orderSelector.data[orderitemindex].components[idx].action = 'R'
        else
          if (action === 'R')
            this._orderSelector.data[orderitemindex].components[idx].action = 'N'

      this.calculatePrice()
      this.saveChanges()

      this._components[orderitemindex].next(this._orderSelector.data[orderitemindex].components);
      this._price.next(this._orderSelector.price)
    }
  }

  getSettingsAndComponents(product: IProduct): Observable<IProductSettings> {
    return this._productsService.getProductsSettingsByIds(product.productsettingsid, ['components', 'productid', "minqtd", "obs"])
  }

  async getAdditionals(): Promise<void> {
    if (this._orderSelector) {
      if (this._orderSelector) {
        const settingsids: Array<string> = []

        this._orderSelector.data.forEach(item => {
          if (settingsids.indexOf(item.product.productsettingsid) < 0)
            settingsids.push(item.product.productsettingsid)
        })

        await Promise.all(settingsids.map(async id => {
          const response = await firstValueFrom(this._productsService.getProductsSettingsByIdsAdditionals(id))

          if (response && this._orderSelector) {
            this.borders = []

            this._orderSelector.data.forEach((data, itemindex) => {
              //if (data.product.productsettingsid === id) {
                //if (response.additional) {
              this.additionals[itemindex] = response.filter((item: any) => item.additionaltype !== 'B')
              this.borders.push(...response.filter((value: any) => {
                return value.additionaltype === 'B' 
                  && value.product.isavailable
                  && value.product.isactive
                  && this.borders.findIndex((v: any) => String(v.additionalid) === String(value.additionalid)) === -1
              }))
                //}
              //}
            })
          }
        }))

        this._additionals = this.additionals.map((data: any) => new BehaviorSubject(data))
        this._borderlist.next(this.borders)
      }
    }
  }

  buy(): void {
    if (this._orderSelector) {
      if (!this.orderODSService.isCreated)
        this.orderODSService.create()

      if (this._orderSelector.header.basketindex >= 0)
        this.orderODSService.editItemByIndex(this._orderSelector, this._orderSelector.header.basketindex)
      else
        this.orderODSService.addItem(this._orderSelector, 1)

      this.clearStored()
    }
  }

}
