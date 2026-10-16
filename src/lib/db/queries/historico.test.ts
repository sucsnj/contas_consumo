import { beforeEach, describe, expect, it } from 'vitest'
import { criarEstadoInicial } from '../../calc/engine'
import type { Movimento } from '../../../types/domain'
import {
  limparHistorico,
  obterHistorico,
  obterHistoricoDaConta,
  registrarMovimento,
} from './historico'

function movimento(conta: 1 | 2, valor: number): Movimento {
  return {
    id: `id-${conta}-${valor}`,
    tipo: conta === 1 ? 'entrada-conta1' : 'entrada-conta2',
    conta,
    valor,
    percentual: 0.3,
    em: '2026-01-01T00:00:00.000Z',
    antes: criarEstadoInicial(),
    depois: criarEstadoInicial(),
  }
}

describe('queries de historico', () => {
  beforeEach(async () => {
    await limparHistorico()
  })

  it('comeca vazio', async () => {
    expect(await obterHistorico()).toEqual([])
  })

  it('registra e lista movimentos preservando a ordem', async () => {
    await registrarMovimento(movimento(1, 500))
    await registrarMovimento(movimento(2, -200))

    const historico = await obterHistorico()
    expect(historico).toHaveLength(2)
    expect(historico[0].valor).toBe(500)
    expect(historico[1].valor).toBe(-200)
  })

  it('filtra por conta', async () => {
    await registrarMovimento(movimento(1, 500))
    await registrarMovimento(movimento(2, -200))

    expect(await obterHistoricoDaConta(2)).toHaveLength(1)
  })

  it('limpa o historico', async () => {
    await registrarMovimento(movimento(1, 500))
    await limparHistorico()

    expect(await obterHistorico()).toEqual([])
  })
})
