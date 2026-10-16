import type { ContaId, ContasState } from '../../types/domain'

export const PERCENTUAL_PADRAO = 0.3

export function arredondarMoeda(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100
}

export function criarEstadoInicial(percentual: number = PERCENTUAL_PADRAO): ContasState {
  return {
    percentual,
    valorAtual: 0,
    valorReserva: 0,
    valorNovoConta1: 0,
    valorNovoConta2: 0,
    valorDiferenca: 0,
    valorPorcentagem1: 0,
    valorPorcentagem2: 0,
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

export function preverEntradaConta1(estado: ContasState, entrada: number): ContasState {
  const valor = arredondarMoeda(Math.max(0, entrada))
  const valorDiferenca = arredondarMoeda(Math.max(0, valor - estado.valorAtual))
  const valorPorcentagem1 = arredondarMoeda(valorDiferenca * estado.percentual)
  const valorPorcentagem2 = arredondarMoeda(valorDiferenca - valorPorcentagem1)
  const valorAtual = arredondarMoeda(estado.valorAtual + valorPorcentagem1)
  const valorReserva = arredondarMoeda(estado.valorReserva + valorPorcentagem2)

  return {
    ...estado,
    valorNovoConta1: valor,
    valorDiferenca,
    valorPorcentagem1,
    valorPorcentagem2,
    valorAtual,
    valorReserva,
    valorDisponivelConta1: valorReserva,
    totalContas: calcularTotalContas(valorReserva, estado.valorDisponivelConta2),
  }
}

export function confirmarEntradaConta1(estado: ContasState, entrada: number): ContasState {
  return {
    ...preverEntradaConta1(estado, entrada),
    valorNovoConta1: 0,
    valorDiferenca: 0,
    valorPorcentagem1: 0,
    valorPorcentagem2: 0,
  }
}

export function preverEntradaConta2(estado: ContasState, entrada: number): ContasState {
  const valor = arredondarMoeda(entrada)
  const valorDisponivelConta2 = arredondarMoeda(estado.valorDisponivelConta2 + valor)

  return {
    ...estado,
    valorNovoConta2: valor,
    valorDisponivelConta2,
    totalContas: calcularTotalContas(estado.valorDisponivelConta1, valorDisponivelConta2),
  }
}

export function confirmarEntradaConta2(estado: ContasState, entrada: number): ContasState {
  return { ...preverEntradaConta2(estado, entrada), valorNovoConta2: 0 }
}

export function aplicarPagamento(
  estado: ContasState,
  conta: ContaId,
  valor: number,
): ContasState {
  const pagamento = arredondarMoeda(valor)

  if (conta === 1) {
    const valorDisponivelConta1 = arredondarMoeda(
      estado.valorDisponivelConta1 - pagamento,
    )
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