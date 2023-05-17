import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { AppService } from '../app.service';
import { IProduct } from '../products/product';
import { IOrderBasketItem } from './order-basket';
import { IOrderSelector } from './order-selector';
import { LocalOrder, LocalOrderStatus, LocalOrderSyncStatus } from './local-order';
import { OrderService } from './order.service';
import { Injectable } from '@angular/core';
import { SummaryOrderPocType } from './summary-order';

interface IOrderOds {
  readonly items$: Observable<Array<IOrderBasketItem>>
  readonly total$: Observable<number>
  readonly price$: Observable<number>

  isCreated: boolean

  clear(): void
  create(): void
  addItem(value: IProduct | IOrderSelector | number, qtd?: number, obs?: string): void
  editItemByIndex(value: IProduct | IOrderSelector, index: number): void
  removeItem(index: number): void
  addItemObs(obs: string, index: number): void
  getItemIndexByProductId(id: string): number
  save(userid: string): Observable<any>
  retrieveOrder(): void
}

@Injectable({
  providedIn: "root"
})
export class OrderOdsService implements IOrderOds {
  private readonly _tag = '_LO'
  

  private _order?: LocalOrder
  private _items: BehaviorSubject<Array<IOrderBasketItem>> = new BehaviorSubject(<Array<IOrderBasketItem>>[])
  private _total: BehaviorSubject<number> = new BehaviorSubject(0)
  private _price: BehaviorSubject<number> = new BehaviorSubject(0)

  public recoveOrder?: LocalOrder
  public readonly items$: Observable<Array<IOrderBasketItem>> = this._items.asObservable()
  public readonly total$: Observable<number> = this._total.asObservable()
  public readonly price$: Observable<number> = this._price.asObservable()

  get isCreated(): boolean {
    return this._order ? true : false
  }

  constructor(
    private _appService: AppService,
    private _orderService: OrderService
  ) {}

  private strToObject(data: string): any {
    try {
      return JSON.parse(data)
    } catch (e) {
      return
    }
  }

  private retrieveStoredData(): {storedData: any, orderIndex: number} {
    let response: any = {
      storedData: null,
      orderIndex: -1
    }

    if (window) {
      const strstoreddata = window.localStorage.getItem(this._tag)

      if (strstoreddata) {
        response.storedData = this.strToObject(atob(strstoreddata))

        if (response.storedData && response.storedData.length > 0)
          response.orderIndex = response.storedData.findIndex((item: any) =>
            this._appService.company && item.companyid === this._appService.company._id
          )
      }
    }
    

    return response
  }

  private store(): void {
    const data = this._order

    const {storedData, orderIndex} = this.retrieveStoredData()
    if (window) {
      if (storedData) {
        if (orderIndex >= 0)
          storedData[orderIndex] = data
        else
          storedData.push(data)
  
        window.localStorage.setItem(this._tag, btoa(JSON.stringify(storedData)))
      } else
        window.localStorage.setItem(this._tag, btoa(JSON.stringify([data])))
    }
    
  }

  public retrieveOrder(): void {
    const {storedData, orderIndex} = this.retrieveStoredData()

    if (!storedData || orderIndex < 0)
      this.create()
    else {
      const retrievedData = storedData[orderIndex]

      this._order = LocalOrder.deserialize(retrievedData)
      this._items.next(this._order.basket.items)
      this._total.next(this._order.basket.total)
      this._price.next(this._order.basket.price)
    }
  }

  public clear(): void {
    delete this._order
    this._items.next([])
    this._total.next(0)
    this._price.next(0)

    const {storedData, orderIndex} = this.retrieveStoredData()

    if (storedData && orderIndex >= 0 && window) {
      storedData.splice(orderIndex, 1)
      window.localStorage.setItem(this._tag, btoa(JSON.stringify(storedData)))
    }
  }

  create(): void {
    if (this._appService.company && this._appService.company.pocid) {
      this._order = new LocalOrder(this._appService.company._id, this._appService.company.pocid, this._appService.company.poctype)
      this._items.next([])
      this._total.next(0)
      this._price.next(0)
    }
  }

  addItem(value: IProduct | IOrderSelector | number, qtd?: number, obs?: string): void {
    this._order!.basket.addItem(value, qtd ? qtd : 1, obs)
    this.store()

    this._items.next(this._order!.basket.items)
    this._total.next(this._order!.basket.total)
    this._price.next(this._order!.basket.price)
  }

  editItemByIndex(value: IProduct | IOrderSelector, index: number): void {
    if (this._order) {
      this._order!.basket.editItemByIndex(value, index)
      this.store()

      this._items.next(this._order!.basket.items)
      this._total.next(this._order!.basket.total)
      this._price.next(this._order!.basket.price)
    }

  }

  removeItem(index: number): void {
    if (this._order) {
      this._order.basket.removeItem(index)

      this.store()

      this._items.next(this._order.basket.items)
      this._total.next(this._order.basket.total)
      this._price.next(this._order.basket.price)
    }
  }

  addItemObs(obs: string, index: number): void {
    if (this._order) {
      this._order.basket.items[index].obs = obs

      this.store()
      this._items.next(this._order.basket.items)
    }
  }

  getItemIndexByProductId(id: string): number {
    return this._order ? this._order.basket.findBasketItemIndexByProductId(id) : -1
  }

  changePoc(pocId: string, poctype: SummaryOrderPocType) {
    if (this._order) {
      this._order.pocid = pocId
      this._order.poctype = poctype
    }
  }

  save(userid: string, location?: number): Observable<any> {
    if (this._order) {
      if (!this._order.hash) {
        this._order.hash = `${new Date().getTime()}${userid}`
        this.store()
      }

      return this._orderService.saveOrder(this._order, location).pipe(
        take(1),
        tap(response => {
          if (response)
            this.clear()
        })
      )
    } else
      return EMPTY
  }

  recover(location?: number): Observable<any> {
    if (this.recoveOrder) {
      const deltas: any = {
        orderstatus: LocalOrderStatus.pendent,
        syncstatus: LocalOrderSyncStatus.pendent
      }
      
      return this._orderService.updateOrder(this.recoveOrder, deltas, location).pipe(
        take(1),
        tap(() => delete this.recoveOrder)
      )
    } else
      return EMPTY
  }
}