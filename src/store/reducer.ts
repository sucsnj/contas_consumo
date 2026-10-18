import { ajustar as ajustarValor, arredondarMoeda, calcularTotal, confirmarEntrada, confirmarEntrada2, pagar } from '../lib/calc/engine'
import { criarId } from '../lib/id'
import type {
  CampoAjustavel,
  ContasState,
  DestinoPagamento,
  EstadoHistorico,
  Movimento,
  MovimentoTipo,
} from '../types/domain'

export const MAXIMO_ESTADOS = 3

export interface AppState {
  contas: ContasState
  movimentos: Movimento[]
  estados: EstadoHistorico[]
}

export type Acao =
  | { tipo: 'hidratar'; contas: ContasState; movimentos: Movimento[]; estados: EstadoHistorico[] }
  | { tipo: 'confirmarEntrada'; entrada: number }
  | { tipo: 'confirmarEntrada2'; entrada2: number }
  | { tipo: 'pagar'; destino: DestinoPagamento; valor: number }
  | { tipo: 'ajustar'; campo: CampoAjustavel; valor: number }
  | { tipo: 'reverter'; estado: ContasState }
  | { tipo: 'reiniciar' }

export const ESTADO_INICIAL: AppState = {
  contas: { saldo: 0, saldo2: 0, reserva: 0, porcentagem1: 0.3 },
  movimentos: [],
  estados: [],
}

function comOperacao(
  estado: AppState,
  tipo: MovimentoTipo,
  campo: Movimento['campo'],
  valor: number,
  depois: ContasState,
  rotulo: string,
): AppState {
  const agora = new Date().toISOString()
  const movimento: Movimento = {
    id: criarId(),
    tipo,
    campo,
    valor: arredondarMoeda(valor),
    em: agora,
    antes: estado.contas,
    depois,
  }
  const snapshot: EstadoHistorico = { id: criarId(), em: agora, rotulo, estado: depois }

  return {
    contas: depois,
    movimentos: [...estado.movimentos, movimento],
    estados: [...estado.estados, snapshot].slice(-MAXIMO_ESTADOS),
  }
}

function comReversao(estado: AppState, destino: ContasState): AppState {
  const movimento: Movimento = {
    id: criarId(),
    tipo: 'reversao',
    campo: null,
    valor: arredondarMoeda(calcularTotal(destino) - calcularTotal(estado.contas)),
    em: new Date().toISOString(),
    antes: estado.contas,
    depois: destino,
  }

  return {
    ...estado,
    contas: destino,
    movimentos: [...estado.movimentos, movimento],
  }
}

export function reducerContas(estado: AppState, acao: Acao): AppState {
  switch (acao.tipo) {
    case 'hidratar':
      return { contas: acao.contas, movimentos: acao.movimentos, estados: acao.estados }

    case 'confirmarEntrada': {
      const depois = confirmarEntrada(estado.contas, acao.entrada)
      if (depois === null) return estado
      return comOperacao(estado, 'entrada', 'saldo', acao.entrada, depois, 'Entrada na conta 1')
    }

    case 'confirmarEntrada2': {
      const depois = confirmarEntrada2(estado.contas, acao.entrada2)
      return comOperacao(estado, 'entrada2', 'saldo2', acao.entrada2, depois, 'Entrada na conta 2')
    }

    case 'pagar': {
      const depois = pagar(estado.contas, acao.destino, acao.valor)
      if (depois === null) return estado
      const rotulo = `Pagamento de ${acao.destino}`
      return comOperacao(estado, `pagamento-${acao.destino}`, acao.destino, acao.valor, depois, rotulo)
    }

    case 'ajustar': {
      const depois = ajustarValor(estado.contas, acao.campo, acao.valor)
      if (depois === null) return estado
      return comOperacao(estado, 'ajuste', acao.campo, acao.valor, depois, `Ajuste de ${acao.campo}`)
    }

    case 'reverter':
      return comReversao(estado, acao.estado)

case 'reiniciar':
      return {
        contas: { saldo: 0, saldo2: 0, reserva: 0, porcentagem1: estado.contas.porcentagem1 },
        movimentos: [],
        estados: [],
      }
  }
}