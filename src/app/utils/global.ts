export interface ApiSearchResponse<TData, TFilters> {
  data: Array<TData>,
  totalCount: number,
  filters?: TFilters
}

export const shortDays = ['', 'domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

export const Uflist = [
  { key: 'AC', label: 'Acre' },
  { key: 'AL', label: 'Alagoas' },
  { key: 'AM', label: 'Amazonas' },
  { key: 'AP', label: 'Amapá' },
  { key: 'BA', label: 'Bahia' },
  { key: 'CE', label: 'Ceará ' },
  { key: 'DF', label: 'Distrito Federal' },
  { key: 'ES', label: 'Espírito Santo' },
  { key: 'GO', label: 'Goiás' },
  { key: 'MA', label: 'Maranhão' },
  { key: 'MT', label: 'Mato Grosso' },
  { key: 'MS', label: 'Mato Grosso do Sul' },
  { key: 'MG', label: 'Minas Gerais' },
  { key: 'PA', label: 'Pará' },
  { key: 'PB', label: 'Paraíba' },
  { key: 'PR', label: 'Paraná' },
  { key: 'PE', label: 'Pernambuco' },
  { key: 'PI', label: 'Piauí' },
  { key: 'RJ', label: 'Rio de Janeiro' },
  { key: 'RN', label: 'Rio Grande do Norte' },
  { key: 'RS', label: 'Rio Grande do Sul' },
  { key: 'RO', label: 'Rondônia' },
  { key: 'RR', label: 'Roraima' },
  { key: 'SC', label: 'Roraima' },
  { key: 'SC', label: 'Santa Catarina' },
  { key: 'SP', label: 'São Paulo' },
  { key: 'SE', label: 'Sergipe' },
  { key: 'TO', label: 'Tocantins' },
]

export const ORDER_STATUS = [
  'O Pedido foi cancelado',
  'Aguardando aprovação', 
  'Pedido em preparação',
  ['Pedido está a caminho','Pedido está pronto'],
  'Pedido finalizado'
]

export const ORDER_STATUS_COLOR = [
  'canceled',
  'pendent', 
  'accepted',
  'deliver',
  'done'
]

export interface ILog {
  message: string
  type: 'E'|'I'
}