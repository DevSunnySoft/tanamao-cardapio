import { OrderBasket } from "./order-basket";
import { SummaryOrderPocType } from "./summary-order";

export enum LocalOrderSyncStatus {
  pendent,
  syncronized
}
export enum LocalOrderStatus { pendent, success, rejected, error }

export class LocalOrder {
  _id?: string
  basket: OrderBasket
  pocid: string
  companyid: string
  summaryorderid?: string
  syncstatus: LocalOrderSyncStatus
  orderstatus: LocalOrderStatus
  rejection?: {
    code: number,
    detail: any
  }
  hash?: string
  createdat?: Date
  poctype: SummaryOrderPocType

  constructor(companyid: string, pocid: string, poctype: SummaryOrderPocType) {
    this.companyid = companyid
    this.basket = new OrderBasket()
    this.pocid = pocid
    this.syncstatus = LocalOrderSyncStatus.pendent
    this.orderstatus = LocalOrderStatus.pendent
    this.poctype = poctype
  }

  static deserialize(input: any): LocalOrder {
    const response = new LocalOrder(input.companyid, input.pocid, input.poctype)
    const len = <number> input.basket.items.length

    for (let i = 0; i < len; i++ ) {
      let quantity = input.basket.items[i].qtd
      let obs = input.basket.items[i].obs
      response.basket.addItem(input.basket.items[i].product, quantity, obs)
    }

    return response
  }
}