import { SummaryOrderPocType } from "../orders/summary-order";
import { ICity } from "../utils/city";

export interface ICompany {
  _id: string
  createdat?: Date
  updatedat?: Date
  isvisible?: boolean
  name: string
  location: {
    address: string,
    utcoffset: string,
    geo?: {
      type: 'Point',
      coordinates: [number, number]
    }
  }
  paymethods?: Array<{
    code: string
    description: string
    isactive: boolean
    onlinecash: boolean
    spotcash: boolean
    _id: string
  }>
  cities?: Array<ICity>
  usespotcash: boolean
  useonlinecash: boolean
  phone?: string
  uri: string
  urilogo: string 
  cnpj?: string
  minvalue: number
  businesscategoryid: string
  version?: string
  deliveryfee: number
  isactive?: boolean
  wildcards: Array<string>
  avgdelivery: number
  avglocal: number
  businesscatalogs: Array<{
    _id: string,
    name: string,
    hourmin: number,
    hourmax: number,
    now: number,
    dif: number,
    isopened: boolean,
    index: number
  }>
  businesscategory: IBusinessCategory
  isdeliveryactive?: boolean
  islocalactive?: boolean
  islocalreadonly?: boolean
  stylecolor: string
  pocid: string
  poctype: SummaryOrderPocType
  banner: {
    _id: string
    path: string
  }
}

export interface IBusinessCategory {
  _id: string
  createdat?: Date
  category?: string
  businesstype: string
  version: string
  updatedat?: Date
  usemenu: boolean
  urlicon: string
}