import { ICity } from "../utils/city";

export interface ICredential {
  username: string
  password: string
}

export interface IAuthJWT {
  iat?: any
  exp?: any
  token: string
}

export interface  IAddress {
  cep: string
  street: string
  city: ICity
  number: string
  neighborhood?: string
  complement?: string
  reference?: string
}

export default interface IUser {
  _id: string,
  username: string,
  name: string,
  cpf: string,
  phone: string
  companyid?: any,
  customer?: any,
  photourl: string,
  method?: string,
  addresses?: Array<IAddress>
  localorder?: any
}

export interface IAuth {
  jwt: IAuthJWT
}

export interface INotification {
  _id?: string
  userid: string
  read: boolean
  subject: string
  text: string
  html: string
  href?: string
  version: string
  orderid?: string
  createdat: Date
  updatedat?: Date
}