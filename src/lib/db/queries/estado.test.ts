import { beforeEach, describe, expect, it } from 'vitest'
import { obterEstado, persistirEstado } from './estado'
import { escrever } from '../client'
import { criarEstadoInicial } from '../../calc/engine'

describe('query de estado', () => {
  beforeEach(async () => {
    await persistirEstado(criarEstadoInicial())
    escrever('contas:estado', '')
  })

  it('le o estado gravado', async () => {
    await persistirEstado({ saldo: 10, saldo2: 20, reserva: 30, porcentagem1: 0.4 })

    expect(await obterEstado()).toEqual({ saldo: 10, saldo2: 20, reserva: 30, porcentagem1: 0.4 })
  })

  it('devolve null quando nao ha estado', async () => {
    expect(await obterEstado()).toBeNull()
  })

  it('ignora dados invalidos', async () => {
    escrever('contas:estado', JSON.stringify({ saldo: 'dez' }))

    expect(await obterEstado()).toBeNull()
  })

  it('migra o modelo antigo para o novo', async () => {
    escrever(
      'contas:estado',
      JSON.stringify({
        percentual: 0.3,
        valorAtual: 150,
        valorReserva: 350,
        valorDisponivelConta1: 350,
        valorDisponivelConta2: 200,
        totalContas: 550,
      }),
    )

    expect(await obterEstado()).toEqual({ saldo: 150, saldo2: 200, reserva: 350, porcentagem1: 0.3 })
  })

  it('usa o padrao quando a porcentagem antiga e invalida', async () => {
    escrever(
      'contas:estado',
      JSON.stringify({ percentual: 5, valorAtual: 1, valorReserva: 2, valorDisponivelConta2: 3 }),
    )

    const estado = await obterEstado()
    expect(estado?.porcentagem1).toBe(0.3)
  })
})