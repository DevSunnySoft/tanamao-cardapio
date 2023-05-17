export enum SummaryOrderSyncStatus { pendent, syncronized }
export enum SummaryOrderPocStatus { pendent, opened, close_request, pre_closed, closed }

export const SummaryOrderPocStatusText = [
  'Aguardando comunicação', 'Aberta', 'Executando pré-fechamento', 'Em pré-fechamento', 'Fechada'
]

export type ISummaryOrderSummaryItemSchema = {
  total: number,
  couverttax?: number
  servicetax?: number
  subtotal?: number
  items: {
    product: string
    quantity: number
    valueun: number
    value: number
    user: string
  }[]
}

export type ISummaryOrderSummary = {
  total: number
  pendent: ISummaryOrderSummaryItemSchema,
  billed: ISummaryOrderSummaryItemSchema
}

export type SummaryOrderPocType = 'M' | 'C'
export enum SummaryOrderPocTypes {
  table = 'M',
  command =  'C'
}

export interface ISummaryOrder {
  _id: string
  companyid: string
  createdat: Date
  version: string
  updatedat?: Date
  users: string[]
  lastsyncat?: string
  pocid: string
  summary?: ISummaryOrderSummary
  syncstatus: SummaryOrderSyncStatus
  pocstatus: SummaryOrderPocStatus
  resume: any,
  poctype: SummaryOrderPocType,
  location?: string
  scanhash: string
}