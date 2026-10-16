import type { ContaId, ContasState, PreviaEntrada } from '../../types/domain'

export const PERCENTUAL_PADRAO = 0.3

export function arredondarMoeda(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100
}

export function criarEstadoInicial(percentual: number = PERCENTUAL_PADRAO): ContasState {
  return {
    percentual,
    valorAtual: 0,
    valorReserva: 0,
    valorDisponivelConta1: 0,
    valorDisponivelConta2: 0,
    totalContas: 0,
  }
}

export function calcularTotalContas(
  valorDisponivelConta1: number,
  valorDisponivelConta2: number,
): number {
  return arredondarMoeda(valorDisponivelConta1 + valorDisponivelConta2)
}

export function definirPercentual(estado: ContasState, percentual: number): ContasState {
  return { ...estado, percentual }
}

export function previaEntradaConta1(estado: ContasState, entrada: number): PreviaEntrada {
  const valor = arredondarMoeda(Math.max(0, entrada))
  const diferenca = arredondarMoeda(Math.max(0, valor - estado.valorAtual))
  const valorPorcentagem1 = arredondarMoeda(diferenca * estado.percentual)
  const valorPorcentagem2 = arredondarMoeda(diferenca - valorPorcentagem1)
  const valorAtual = arredondarMoeda(estado.valorAtual + valorPorcentagem1)
  const valorReserva = arredondarMoeda(estado.valorReserva + valorPorcentagem2)

  return {
    conta: 1,
    valor,
    diferenca,
    valorPorcentagem1,
    valorPorcentagem2,
    valorAtual,
    valorReserva,
    valorDisponivelConta1: valorReserva,
    valorDisponivelConta2: estado.valorDisponivelConta2,
    totalContas: calcularTotalContas(valorReserva, estado.valorDisponivelConta2),
  }
}

export function previaEntradaConta2(estado: ContasState, entrada: number): PreviaEntrada {
  const valor = arredondarMoeda(entrada)
  const valorDisponivelConta2 = arredondarMoeda(estado.valorDisponivelConta2 + valor)

  return {
    conta: 2,
    valor,
    diferenca: 0,
    valorPorcentagem1: 0,
    valorPorcentagem2: 0,
    valorAtual: estado.valorAtual,
    valorReserva: estado.valorReserva,
    valorDisponivelConta1: estado.valorDisponivelConta1,
    valorDisponivelConta2,
    totalContas: calcularTotalContas(estado.valorDisponivelConta1, valorDisponivelConta2),
  }
}

export function confirmarEntradaConta1(estado: ContasState, entrada: number): ContasState {
  const previa = previaEntradaConta1(estado, entrada)
  return {
    ...estado,
    valorAtual: previa.valorAtual,
    valorReserva: previa.valorReserva,
    valorDisponivelConta1: previa.valorDisponivelConta1,
    valorDisponivelConta2: previa.valorDisponivelConta2,
    totalContas: previa.totalContas,
  }
}

export function confirmarEntradaConta2(estado: ContasState, entrada: number): ContasState {
  const previa = previaEntradaConta2(estado, entrada)
  return {
    ...estado,
    valorAtual: previa.valorAtual,
    valorReserva: previa.valorReserva,
    valorDisponivelConta1: previa.valorDisponivelConta1,
    valorDisponivelConta2: previa.valorDisponivelConta2,
    totalContas: previa.totalContas,
  }
}

export function aplicarPagamento(
  estado: ContasState,
  conta: ContaId,
  valor: number,
): ContasState {
  const pagamento = arredondarMoeda(valor)

  if (conta === 1) {
    const valorDisponivelConta1 = arredondarMoeda(estado.valorDisponivelConta1 - pagamento)
    return {
      ...estado,
      valorDisponivelConta1,
      totalContas: calcularTotalContas(valorDisponivelConta1, estado.valorDisponivelConta2),
    }
  }

  const valorDisponivelConta2 = arredondarMoeda(estado.valorDisponivelConta2 - pagamento)
  return {
    ...estado,
    valorDisponivelConta2,
    totalContas: calcularTotalContas(estado.valorDisponivelConta1, valorDisponivelConta2),
  }
}
