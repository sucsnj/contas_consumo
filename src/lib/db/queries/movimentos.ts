import { escrever, ler } from '../client'
import type { Movimento } from '../../../types/domain'

const CHAVE_MOVIMENTOS = 'contas:historico'

function validarMovimento(dados: unknown): dados is Movimento {
  if (typeof dados !== 'object' || dados === null) return false

  const movimento = dados as Record<string, unknown>
  return (
    typeof movimento.id === 'string' &&
    typeof movimento.tipo === 'string' &&
    typeof movimento.valor === 'number' &&
    typeof movimento.em === 'string' &&
    typeof movimento.antes === 'object' &&
    typeof movimento.depois === 'object'
  )
}

export async function obterMovimentos(): Promise<Movimento[]> {
  const bruto = ler(CHAVE_MOVIMENTOS)
  if (bruto === null) return []

  try {
    const dados: unknown = JSON.parse(bruto)
    return Array.isArray(dados) ? dados.filter(validarMovimento) : []
  } catch {
    return []
  }
}

export async function registrarMovimento(movimento: Movimento): Promise<void> {
  const movimentos = await obterMovimentos()
  escrever(CHAVE_MOVIMENTOS, JSON.stringify([...movimentos, movimento]))
}

export async function limparMovimentos(): Promise<void> {
  escrever(CHAVE_MOVIMENTOS, JSON.stringify([]))
}