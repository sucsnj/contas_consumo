import { requisicao } from '../http'
import type { Movimento } from '../../../types/domain'

export async function obterMovimentos(): Promise<Movimento[]> {
  return requisicao<Movimento[]>('/movimentos')
}

export async function registrarMovimento(movimento: Movimento): Promise<void> {
  await requisicao<void>('/movimentos', {
    method: 'POST',
    body: JSON.stringify(movimento),
  })
}

export async function limparMovimentos(): Promise<void> {
  await requisicao<void>('/movimentos', { method: 'DELETE' })
}
