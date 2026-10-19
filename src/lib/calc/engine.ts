import type {
  CampoAjustavel,
  ContasState,
  DestinoPagamento,
  PreviaEntrada,
  PreviaEntrada2,
} from '../../types/domain'

export const PORCENTAGEM_PADRAO = 0.3

export function arredondarMoeda(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100
}

export function criarEstadoInicial(porcentagem1: number = PORCENTAGEM_PADRAO): ContasState {
  return {
    saldo: 0,
    saldo2: 0,
    reserva: 0,
    porcentagem1,
  }
}

export function calcularTotal(estado: ContasState): number {
  return arredondarMoeda(estado.saldo + estado.saldo2)
}

export function valorDoCampo(estado: ContasState, campo: CampoAjustavel): number {
  return estado[campo]
}

export function porcentagemValida(valor: number): boolean {
  return valor >= 0 && valor <= 1
}

export function entradaValida(estado: ContasState, entrada: number): boolean {
  return entrada >= estado.reserva
}

export function previaEntrada(estado: ContasState, entrada: number): PreviaEntrada {
  const diferenca = arredondarMoeda(Math.max(0, entrada - estado.reserva))
  const porcentagem2 = arredondarMoeda(1 - estado.porcentagem1)
  const porcentagemReserva = arredondarMoeda(diferenca * estado.porcentagem1)
  const porcentagemSaldo = arredondarMoeda(diferenca * porcentagem2)

  const novoSaldo = arredondarMoeda(estado.saldo + porcentagemSaldo)
  const novoReserva = arredondarMoeda(estado.reserva + porcentagemReserva)

  return {
    entrada,
    diferenca,
    porcentagem2,
    porcentagemReserva,
    porcentagemSaldo,
    novoReserva,
    novoSaldo,
    total: arredondarMoeda(novoSaldo + estado.saldo2),
  }
}

export function confirmarEntrada(estado: ContasState, entrada: number): ContasState | null {
  if (!entradaValida(estado, entrada)) return null

  const previa = previaEntrada(estado, entrada)
  return { ...estado, saldo: previa.novoSaldo, reserva: previa.novoReserva }
}

export function previaEntrada2(estado: ContasState, entrada2: number): PreviaEntrada2 {
  return {
    entrada2,
    saldo2: arredondarMoeda(entrada2),
    total: arredondarMoeda(estado.saldo + entrada2),
  }
}

export function confirmarEntrada2(estado: ContasState, entrada2: number): ContasState {
  return { ...estado, saldo2: arredondarMoeda(entrada2) }
}

export function pagamentoPossivel(valor: number): boolean {
  return Number.isFinite(valor) && valor > 0
}

export function saldoAposPagamento(estado: ContasState, destino: DestinoPagamento, valor: number): number {
  return arredondarMoeda(valorDoCampo(estado, destino) - valor)
}

export function pagar(
  estado: ContasState,
  destino: DestinoPagamento,
  valor: number,
): ContasState | null {
  if (!pagamentoPossivel(valor)) return null
  return { ...estado, [destino]: saldoAposPagamento(estado, destino, valor) }
}

export function ajustar(
  estado: ContasState,
  campo: CampoAjustavel,
  valor: number,
): ContasState | null {
  const valorArredondado = arredondarMoeda(valor)

  if (campo === 'porcentagem1' && !porcentagemValida(valorArredondado)) return null
  if (!Number.isFinite(valorArredondado)) return null

  return { ...estado, [campo]: valorArredondado }
}

export function definirPorcentagem(estado: ContasState, porcentagem1: number): ContasState {
  return ajustar(estado, 'porcentagem1', porcentagem1) ?? estado
}