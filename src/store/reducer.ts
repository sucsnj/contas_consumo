import {
  aplicarPagamento,
  arredondarMoeda,
  confirmarEntradaConta1,
  confirmarEntradaConta2,
  criarEstadoInicial,
  definirPercentual,
  previaEntradaConta1,
  previaEntradaConta2,
} from '../lib/calc/engine'
import { criarId } from '../lib/id'
import type { ContaId, ContasState, Movimento, MovimentoTipo, PreviaEntrada } from '../types/domain'

export interface AppState {
  contas: ContasState
  previa: PreviaEntrada | null
  movimentos: Movimento[]
}

export type Acao =
  | { tipo: 'hidratar'; contas: ContasState; movimentos: Movimento[] }
  | { tipo: 'preverEntrada'; conta: ContaId; valor: number }
  | { tipo: 'limparPrevia' }
  | { tipo: 'confirmarEntradaConta1'; valor: number }
  | { tipo: 'confirmarEntradaConta2'; valor: number }
  | { tipo: 'pagamento'; conta: ContaId; valor: number }
  | { tipo: 'percentual'; valor: number }
  | { tipo: 'reiniciar' }

export const ESTADO_INICIAL: AppState = {
  contas: criarEstadoInicial(),
  previa: null,
  movimentos: [],
}

function comMovimento(
  estado: AppState,
  tipo: MovimentoTipo,
  conta: ContaId | null,
  valor: number,
  depois: ContasState,
): AppState {
  const movimento: Movimento = {
    id: criarId(),
    tipo,
    conta,
    valor: arredondarMoeda(valor),
    percentual: depois.percentual,
    em: new Date().toISOString(),
    antes: estado.contas,
    depois,
  }

  return { contas: depois, previa: null, movimentos: [...estado.movimentos, movimento] }
}

export function reducerContas(estado: AppState, acao: Acao): AppState {
  switch (acao.tipo) {
    case 'hidratar':
      return { contas: acao.contas, previa: null, movimentos: acao.movimentos }

    case 'preverEntrada':
      return {
        ...estado,
        previa:
          acao.conta === 1
            ? previaEntradaConta1(estado.contas, acao.valor)
            : previaEntradaConta2(estado.contas, acao.valor),
      }

    case 'limparPrevia':
      return estado.previa === null ? estado : { ...estado, previa: null }

    case 'confirmarEntradaConta1':
      return comMovimento(
        estado,
        'entrada-conta1',
        1,
        acao.valor,
        confirmarEntradaConta1(estado.contas, acao.valor),
      )

    case 'confirmarEntradaConta2':
      return comMovimento(
        estado,
        'entrada-conta2',
        2,
        acao.valor,
        confirmarEntradaConta2(estado.contas, acao.valor),
      )

    case 'pagamento':
      return comMovimento(
        estado,
        acao.conta === 1 ? 'pagamento-conta1' : 'pagamento-conta2',
        acao.conta,
        acao.valor,
        aplicarPagamento(estado.contas, acao.conta, acao.valor),
      )

    case 'percentual':
      return comMovimento(
        estado,
        'percentual',
        null,
        acao.valor,
        definirPercentual(estado.contas, acao.valor),
      )

    case 'reiniciar':
      return { contas: criarEstadoInicial(estado.contas.percentual), previa: null, movimentos: [] }
  }
}
