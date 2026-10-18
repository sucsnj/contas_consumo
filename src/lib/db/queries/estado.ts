import { escrever, ler } from '../client'
import type { ContasState } from '../../../types/domain'

const CHAVE_ESTADO = 'contas:estado'

interface EstadoAntigo {
  valorReserva?: unknown
  valorAtual?: unknown
  valorDisponivelConta2?: unknown
  percentual?: unknown
}

function numero(valor: unknown): number | null {
  return typeof valor === 'number' && Number.isFinite(valor) ? valor : null
}

function validar(dados: unknown): ContasState | null {
  if (typeof dados !== 'object' || dados === null) return null

  const campos = ['saldo', 'saldo2', 'reserva', 'porcentagem1'] as const
  const registro = dados as Record<string, unknown>
  if (campos.some((campo) => numero(registro[campo]) === null)) return null

  return {
    saldo: numero(registro.saldo) as number,
    saldo2: numero(registro.saldo2) as number,
    reserva: numero(registro.reserva) as number,
    porcentagem1: numero(registro.porcentagem1) as number,
  }
}

function migrar(dados: unknown): ContasState | null {
  if (typeof dados !== 'object' || dados === null) return null

  const antigo = dados as EstadoAntigo
  const reserva = numero(antigo.valorReserva)
  const saldo = numero(antigo.valorAtual)
  const saldo2 = numero(antigo.valorDisponivelConta2)
  const porcentagem1 = numero(antigo.percentual)

  if (reserva === null || saldo === null || saldo2 === null || porcentagem1 === null) return null

  return { saldo, saldo2, reserva, porcentagem1: porcentagem1 >= 0 && porcentagem1 <= 1 ? porcentagem1 : 0.3 }
}

export async function obterEstado(): Promise<ContasState | null> {
  const bruto = ler(CHAVE_ESTADO)
  if (bruto === null) return null

  try {
    const dados: unknown = JSON.parse(bruto)
    return validar(dados) ?? migrar(dados)
  } catch {
    return null
  }
}

export async function persistirEstado(estado: ContasState): Promise<void> {
  escrever(CHAVE_ESTADO, JSON.stringify(estado))
}