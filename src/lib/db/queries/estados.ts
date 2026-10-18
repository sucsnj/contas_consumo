import { escrever, ler } from '../client'
import type { EstadoHistorico } from '../../../types/domain'

const CHAVE_ESTADOS = 'contas:estados'

function validarLista(bruto: string): EstadoHistorico[] {
  const dados: unknown = JSON.parse(bruto)
  if (!Array.isArray(dados)) return []

  return dados.filter((item: unknown): item is EstadoHistorico => {
    if (typeof item !== 'object' || item === null) return false
    const registro = item as Record<string, unknown>
    return typeof registro.id === 'string' && typeof registro.em === 'string'
  })
}

export async function obterEstados(): Promise<EstadoHistorico[]> {
  const bruto = ler(CHAVE_ESTADOS)
  if (bruto === null) return []

  try {
    return validarLista(bruto)
  } catch {
    return []
  }
}

export async function persistirEstados(estados: EstadoHistorico[]): Promise<void> {
  escrever(CHAVE_ESTADOS, JSON.stringify(estados))
}