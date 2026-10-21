import { ler, remover } from './client'
import { migrarContasAntigas, validarContas, validarEstadoHistorico, validarMovimento } from './validacao'
import { obterEstado, persistirEstado } from './queries/estado'
import { persistirEstados } from './queries/estados'
import { obterMovimentos, registrarMovimento } from './queries/movimentos'
import type { EstadoHistorico, Movimento } from '../../types/domain'

const CHAVE_ESTADO = 'contas:estado'
const CHAVE_ESTADOS = 'contas:estados'
const CHAVE_MOVIMENTOS = 'contas:historico'

function lerJson(chave: string): unknown {
  const bruto = ler(chave)
  if (bruto === null || bruto.trim() === '') return null

  try {
    return JSON.parse(bruto) as unknown
  } catch {
    return null
  }
}

function colecao<T>(dados: unknown, validar: (item: unknown) => T | null): T[] {
  if (!Array.isArray(dados)) return []
  return dados.map((item) => validar(item)).filter((item): item is T => item !== null)
}

export async function migrarDadosLegados(): Promise<void> {
  const estadoBruto = lerJson(CHAVE_ESTADO)
  const estadosBrutos = lerJson(CHAVE_ESTADOS)
  const movimentosBrutos = lerJson(CHAVE_MOVIMENTOS)

  const estado = validarContas(estadoBruto) ?? migrarContasAntigas(estadoBruto)
  const estados = colecao<EstadoHistorico>(estadosBrutos, validarEstadoHistorico)
  const movimentos = colecao<Movimento>(movimentosBrutos, validarMovimento)

  if (estado === null && estados.length === 0 && movimentos.length === 0) return

  try {
    if ((await obterEstado()) !== null) return
    if ((await obterMovimentos()).length > 0) return

    if (estado !== null) await persistirEstado(estado)
    if (estados.length > 0) await persistirEstados(estados)
    for (const movimento of movimentos) await registrarMovimento(movimento)
  } catch {
    return
  }

  remover(CHAVE_ESTADO)
  remover(CHAVE_ESTADOS)
  remover(CHAVE_MOVIMENTOS)
}
