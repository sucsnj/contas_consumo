export type ContaId = 1 | 2

export interface ContasState {
  percentual: number
  valorAtual: number
  valorReserva: number
  valorNovoConta1: number
  valorNovoConta2: number
  valorDiferenca: number
  valorPorcentagem1: number
  valorPorcentagem2: number
  valorDisponivelConta1: number
  valorDisponivelConta2: number
  totalContas: number
}

export type MovimentoTipo =
  | 'entrada-conta1'
  | 'entrada-conta2'
  | 'pagamento-conta1'
  | 'pagamento-conta2'
  | 'percentual'

export interface Movimento {
  id: string
  tipo: MovimentoTipo
  conta: ContaId | null
  valor: number
  percentual: number
  em: string
  antes: ContasState
  depois: ContasState
}