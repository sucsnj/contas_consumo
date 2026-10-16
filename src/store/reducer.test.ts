import { describe, expect, it } from 'vitest'
import { ESTADO_INICIAL, reducerContas } from './reducer'

describe('reducerContas', () => {
  it('prever entrada na conta 1 nao altera o estado confirmado', () => {
    const estado = reducerContas(ESTADO_INICIAL, {
      tipo: 'preverEntrada',
      conta: 1,
      valor: 500,
    })

    expect(estado.contas).toEqual(ESTADO_INICIAL.contas)
    expect(estado.previa?.diferenca).toBe(500)
    expect(estado.previa?.valorPorcentagem1).toBe(150)
    expect(estado.previa?.valorPorcentagem2).toBe(350)
    expect(estado.movimentos).toHaveLength(0)
  })

  it('confirmar entrada registra movimento e zera a previa', () => {
    const comPrevia = reducerContas(ESTADO_INICIAL, {
      tipo: 'preverEntrada',
      conta: 1,
      valor: 500,
    })
    const estado = reducerContas(comPrevia, { tipo: 'confirmarEntradaConta1', valor: 500 })

    expect(estado.previa).toBeNull()
    expect(estado.contas.valorAtual).toBe(150)
    expect(estado.contas.valorReserva).toBe(350)
    expect(estado.movimentos).toHaveLength(1)
    expect(estado.movimentos[0]).toMatchObject({
      tipo: 'entrada-conta1',
      conta: 1,
      valor: 500,
    })
    expect(estado.movimentos[0].antes.valorAtual).toBe(0)
    expect(estado.movimentos[0].depois.valorAtual).toBe(150)
  })

  it('preve e confirma entradas negativas na conta 2', () => {
    const comSaldo = reducerContas(ESTADO_INICIAL, {
      tipo: 'confirmarEntradaConta2',
      valor: 400,
    })
    const comPrevia = reducerContas(comSaldo, { tipo: 'preverEntrada', conta: 2, valor: -700 })

    expect(comPrevia.previa?.valorDisponivelConta2).toBe(-300)
    expect(comSaldo.contas.valorDisponivelConta2).toBe(400)

    const estado = reducerContas(comPrevia, { tipo: 'confirmarEntradaConta2', valor: -700 })
    expect(estado.contas.valorDisponivelConta2).toBe(-300)
  })

  it('pagamento registra o movimento correspondente', () => {
    const comSaldo = reducerContas(ESTADO_INICIAL, {
      tipo: 'confirmarEntradaConta1',
      valor: 500,
    })
    const estado = reducerContas(comSaldo, { tipo: 'pagamento', conta: 1, valor: 100 })

    expect(estado.contas.valorDisponivelConta1).toBe(250)
    expect(estado.contas.totalContas).toBe(250)
    expect(estado.movimentos.at(-1)).toMatchObject({
      tipo: 'pagamento-conta1',
      conta: 1,
      valor: 100,
    })
  })

  it('percentual altera apenas a configuracao', () => {
    const estado = reducerContas(ESTADO_INICIAL, { tipo: 'percentual', valor: 0.5 })

    expect(estado.contas.percentual).toBe(0.5)
    expect(estado.contas.valorAtual).toBe(0)
    expect(estado.movimentos.at(-1)?.tipo).toBe('percentual')
  })

  it('reiniciar zera contas e movimentos preservando o percentual', () => {
    const comDados = reducerContas(
      reducerContas(ESTADO_INICIAL, { tipo: 'percentual', valor: 0.4 }),
      { tipo: 'confirmarEntradaConta1', valor: 500 },
    )
    const estado = reducerContas(comDados, { tipo: 'reiniciar' })

    expect(estado.contas).toMatchObject({ percentual: 0.4, totalContas: 0 })
    expect(estado.movimentos).toHaveLength(0)
    expect(estado.previa).toBeNull()
  })

  it('hidratar substitui contas e movimentos', () => {
    const estado = reducerContas(ESTADO_INICIAL, {
      tipo: 'hidratar',
      contas: { ...ESTADO_INICIAL.contas, valorAtual: 42 },
      movimentos: [],
    })

    expect(estado.contas.valorAtual).toBe(42)
  })

  it('limparPrevia remove somente a previa', () => {
    const comPrevia = reducerContas(ESTADO_INICIAL, {
      tipo: 'preverEntrada',
      conta: 1,
      valor: 500,
    })
    const estado = reducerContas(comPrevia, { tipo: 'limparPrevia' })

    expect(estado.previa).toBeNull()
    expect(estado.contas).toEqual(ESTADO_INICIAL.contas)
  })
})
