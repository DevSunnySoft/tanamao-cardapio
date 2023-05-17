import { IProduct } from '../products/product'
import { IOrderSelector } from './order-selector'
import * as currency from 'currency.js'

export interface IOrderBasketItem {
  product: IProduct | IOrderSelector,
  qtd: number
  price: number
  obs?: string
}

export interface ICoupon {
  _id: string
  name: string
}

export class OrderBasket {
  items: Array<IOrderBasketItem> = []
  total: number
  price: number
  discount: number
  cashpaid: number
  change: number
  coupons: Array<ICoupon>

  constructor() {
    this.discount = 0
    this.total = 0
    this.cashpaid = 0
    this.change = 0
    this.price = 0
    this.coupons = []
  }

  private calcTotal(): void {
    let value: currency = this.items.reduce((prev: any, item: IOrderBasketItem) => prev.add(item.price), currency(0))

    this.price = value.value

    let total = currency(this.price).subtract(this.discount)
    this.total = total.value

    if (this.cashpaid > 0)
      this.change = currency(this.cashpaid).subtract(this.total).value
  }

  findBasketItemIndexByProductId(productid: string): number {
    return this.items.findIndex(item => 'header' in item.product ? false : item.product._id === productid)
  }

  addItem(value: IProduct | IOrderSelector | number, qtd: number, obs?: string): void {
    if (typeof (value) === 'number') {
      const item = this.items[value]
      item.obs = obs
      item.qtd = qtd
      this.items[value].price = currency('header' in item.product ? item.product.price : item.product.prices.cashpayment).multiply(qtd).value
    } else {
      const price = currency('header' in value ? value.price : value.prices.cashpayment).multiply(qtd).value
      this.items.push({ product: value, price, qtd, obs })
    }

    this.calcTotal()
  }

  editItemByIndex(value: IProduct | IOrderSelector, index: number) {
    if (this.items.length > 0)
      this.items[index].product = value
    else
      this.addItem(value, 1)
  }

  setCashPaid(value: number) {
    this.cashpaid = value
    this.calcTotal()
  }

  removeItem(value: number) {
    this.items.splice(value, 1)
    this.calcTotal()
  }
}