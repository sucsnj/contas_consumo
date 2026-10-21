import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { criarEstadoInicial } from '../lib/calc/engine.ts'
import { abrirRepositorio } from './repositorio.ts'
import type { Repositorio } from './repositorio.ts'
import type { EstadoHistorico, Movimento } from '../types/domain.ts'

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

describe('repositorio SQLite', () => {
  let repositorio: Repositorio

  beforeEach(() => {
    repositorio = abrirRepositorio(':memory:')
  })

  afterEach(() => {
    repositorio.fechar()
  })

  it('comeca sem estado', () => {
    expect(repositorio.lerEstado()).toBeNull()
  })

  it('grava e sobrescreve o estado', () => {
    repositorio.salvarEstado(criarEstadoInicial())
    expect(repositorio.lerEstado()).toEqual(criarEstadoInicial())

    repositorio.salvarEstado({ saldo: 10, saldo2: 20, reserva: 30, porcentagem1: 0.4 })
    expect(repositorio.lerEstado()).toEqual({ saldo: 10, saldo2: 20, reserva: 30, porcentagem1: 0.4 })
  })

  it('substitui a lista de estados de backup', () => {
    repositorio.substituirEstados([estado('a'), estado('b')])
    expect(repositorio.lerEstados().map((registro) => registro.id)).toEqual(['a', 'b'])

    repositorio.substituirEstados([estado('c')])
    expect(repositorio.lerEstados().map((registro) => registro.id)).toEqual(['c'])
  })

  it('registra, lista e limpa movimentos', () => {
    expect(repositorio.lerMovimentos()).toEqual([])

    repositorio.adicionarMovimento(movimento('a'))
    repositorio.adicionarMovimento(movimento('b'))

    const movimentos = repositorio.lerMovimentos()
    expect(movimentos.map((registro) => registro.id)).toEqual(['a', 'b'])
    expect(movimentos[0].antes).toEqual(criarEstadoInicial())

    repositorio.limparMovimentos()
    expect(repositorio.lerMovimentos()).toEqual([])
  })
})
