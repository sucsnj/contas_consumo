import { requisicao } from '../http'
import type { ContasState } from '../../../types/domain'

export async function obterEstado(): Promise<ContasState | null> {
  return requisicao<ContasState | null>('/estado')
}

export async function persistirEstado(estado: ContasState): Promise<void> {
  await requisicao<void>('/estado', { method: 'PUT', body: JSON.stringify(estado) })
}
