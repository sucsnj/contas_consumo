export interface ContasState {
  saldo: number
  saldo2: number
  reserva: number
  porcentagem1: number
  emprestado: number
}

export type CampoAjustavel = 'saldo' | 'saldo2' | 'reserva' | 'porcentagem1'
export type DestinoPagamento = 'saldo' | 'reserva' | 'saldo2'

export interface PreviaEntrada {
  entrada: number
  diferenca: number
  porcentagem2: number
  porcentagemReserva: number
  porcentagemSaldo: number
  novoReserva: number
  novoSaldo: number
  total: number
}

export interface PreviaEntrada2 {
  entrada2: number
  saldo2: number
  total: number
}

export type MovimentoTipo =
  | 'entrada'
  | 'entrada2'
  | 'pagamento-saldo'
  | 'pagamento-reserva'
  | 'pagamento-saldo2'
  | 'devolucao'
  | 'ajuste'
  | 'reversao'

export interface Movimento {
  id: string
  tipo: MovimentoTipo
  campo: CampoAjustavel | DestinoPagamento | null
  valor: number
  em: string
  antes: ContasState
  depois: ContasState
}

export interface EstadoHistorico {
  id: string
  em: string
  rotulo: string
  estado: ContasState
}