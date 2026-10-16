import type { ContasState } from '../../../types/domain'
import { escrever, ler } from '../client'

const CHAVE_ESTADO = 'contas:estado'

function validarEstado(dados: unknown): ContasState | null {
  if (typeof dados !== 'object' || dados === null) return null

  const campos = [
    'percentual',
    'valorAtual',
    'valorReserva',
    'valorDisponivelConta1',
    'valorDisponivelConta2',
    'totalContas',
  ] as const

  const estado = dados as Record<string, unknown>
  const valido = campos.every((campo) => typeof estado[campo] === 'number')
  return valido ? (estado as unknown as ContasState) : null
}

export async function obterEstado(): Promise<ContasState | null> {
  const bruto = ler(CHAVE_ESTADO)
  if (bruto === null) return null

  try {
    return validarEstado(JSON.parse(bruto))
  } catch {
    return null
  }
}

export async function persistirEstado(estado: ContasState): Promise<void> {
  escrever(CHAVE_ESTADO, JSON.stringify(estado))
}

export async function removerEstado(): Promise<void> {
  escrever(CHAVE_ESTADO, '')
}
