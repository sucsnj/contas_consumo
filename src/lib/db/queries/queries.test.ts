import { beforeEach, describe, expect, it } from 'vitest'
import { criarEstadoInicial } from '../../../lib/calc/engine'
import { limparMovimentos, obterMovimentos, registrarMovimento } from './movimentos'
import { obterEstados, persistirEstados } from './estados'
import type { EstadoHistorico, Movimento } from '../../../types/domain'

function movimento(id: string): Movimento {
  return {
    id,
    tipo: 'ajuste',
    campo: 'saldo',
    valor: 10,
    em: '2026-01-01T00:00:00.000Z',
    antes: criarEstadoInicial(),
    depois: criarEstadoInicial(),
  }
}

function estado(id: string): EstadoHistorico {
  return { id, em: '2026-01-01T00:00:00.000Z', rotulo: 'Entrada', estado: criarEstadoInicial() }
}

describe('query de movimentos', () => {
  beforeEach(async () => {
    await limparMovimentos()
  })

  it('comeca vazia', async () => {
    expect(await obterMovimentos()).toEqual([])
  })

  it('registra e lista movimentos', async () => {
    await registrarMovimento(movimento('a'))
    await registrarMovimento(movimento('b'))

    const movimentos = await obterMovimentos()
    expect(movimentos.map((m) => m.id)).toEqual(['a', 'b'])
  })

  it('limpa os movimentos', async () => {
    await registrarMovimento(movimento('a'))
    await limparMovimentos()

    expect(await obterMovimentos()).toEqual([])
  })
})

describe('query de estados', () => {
  it('comeca vazia', async () => {
    expect(await obterEstados()).toEqual([])
  })

  it('persiste e le os estados de backup', async () => {
    await persistirEstados([estado('a'), estado('b')])

    const estados = await obterEstados()
    expect(estados.map((e) => e.id)).toEqual(['a', 'b'])
  })
})