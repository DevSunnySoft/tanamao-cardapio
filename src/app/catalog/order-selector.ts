import { IProduct, IProductCategory, IProductSettings } from "../products/product"

export type TOrderComponentAction = 'A' | 'R' | 'C' | 'N' // Add, Remove, Choise, nothing

export interface IOrderItemComponentData {
  componentid: string
  qtd: number
  product: IProduct
  value: number
  iseditable?: boolean
  isvisible?: boolean
}

export interface IOrderItemComponents {
  _id?: string
  name: string
  action: TOrderComponentAction
  data: Array<IOrderItemComponentData>
  settingsid?: string
  selected: Array<number>
  qtdselection: number
}

export interface IOrderSelectorItem {
  qtd?: number
  price?: number
  product: IProduct
  components: Array<IOrderItemComponents>
  settings?: IProductSettings
  obs?: string
  additionalsnumber?: number
}

export interface IOrderSelectorDrink {
  qtd: number
  product: IProduct
}

export interface IOrderSelectorHeader {
  category?: IProductCategory
  qtdselection: number
  basketindex: number
}

export interface IOrderSelector {
  header: IOrderSelectorHeader
  data: Array<IOrderSelectorItem>
  drinks: Array<IOrderSelectorDrink>
  price: number
  border?: IProduct
  companyid: string
  obs?: string
}