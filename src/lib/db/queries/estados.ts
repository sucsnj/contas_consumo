import { requisicao } from '../http'
import type { EstadoHistorico } from '../../../types/domain'

export async function obterEstados(): Promise<EstadoHistorico[]> {
  return requisicao<EstadoHistorico[]>('/estados')
}

export async function persistirEstados(estados: EstadoHistorico[]): Promise<void> {
  await requisicao<void>('/estados', { method: 'PUT', body: JSON.stringify(estados) })
}
