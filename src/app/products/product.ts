export interface IProductsSearchQuery {
  page?: number
  limit?: number
  search?: string | null
  categoryid?: string
  categorytype?: 'D' | 'F'
  orderby?: string | null
  ordertype?: OrderType
}

export enum CatalogType {
  menu,
  retail
}

export const CatalogTypeList = {
  menu: CatalogType.menu,
  retail: CatalogType.retail
}

export enum ProductType {
  drink,
  food
}

export enum OrderType {
  delivery,
  local
}

export type TCategoryType = 'D' | 'F';
export interface IProductCategory {
  _id: string;
  companyid?: string;
  sunnyid?: string;
  name: string;
  qtdselection: number;
  qtdselchargehigher: number;
  categorytype: TCategoryType;
  parentcategory?: string;
  children: Array<IProductCategory>
  version?: string;
  createat?: string;
  updatedat?: string;
  uriicon?: string;
}

export interface IProductPrice {
  cashpayment: number;
  defpayment?: number;
}

export type TMeasure = 'UN' | 'KG' | 'LT' | 'CB';

export interface IProductSettingsIngredients {
  componentid?: string
  qtd: number
  isdefault: boolean
  isvisible: boolean
  iseditable: boolean
  product: IProduct
}

export interface IProductSettingsAdditional {
  additionalid: string
  type: 'B' | 'Q' | 'N'
  maxqtd: number
  product: IProduct
}

export interface IProductSettingsComponent {
  name: string
  data: Array<any>
  qtdselection: number
  settingsid?: string
  selected: Array<any>
  action: 'N' | 'C'
}

export interface IProductsSettingsObs {
  name: string
  data: Array<string>
  selected: number
}

export interface IProductSettings {
  _id: string
  specification?: string
  components: Array<IProductSettingsComponent>
  additional: Array<IProductSettingsAdditional>
  minqtd: number
  productid: string
  obs: Array<IProductsSettingsObs>
}

export interface IProduct {
  _id: string
  categoryid?: string
  companyid?: string
  sunnyid?: number
  barcode: string
  product: string
  measure: TMeasure
  supplymanagement: boolean
  prices: IProductPrice
  stock: number
  isavailable: boolean
  campaign?: {
    _id: string
    cashpayment: number
    oldcashpayment: number
    defpayment: number
    olddefpayment: number
    discount: number
    name: string
  }
  images: Array<string>
  producttype?: string
  inventory?: number
  createat?: string
  updatedat?: string
  version?: string
  description?: string
  productsettingsid: string
  settings?: IProductSettings
  category?: IProductCategory
}