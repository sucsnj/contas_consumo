import { describe, expect, it } from 'vitest'
import {
  aplicarPagamento,
  confirmarEntradaConta1,
  confirmarEntradaConta2,
  criarEstadoInicial,
  definirPercentual,
  previaEntradaConta1,
  previaEntradaConta2,
} from './engine'

describe('criarEstadoInicial', () => {
  it('comeca zerado com 30% de percentual', () => {
    expect(criarEstadoInicial()).toEqual({
      percentual: 0.3,
      valorAtual: 0,
      valorReserva: 0,
      valorDisponivelConta1: 0,
      valorDisponivelConta2: 0,
      totalContas: 0,
    })
  })
})

describe('entrada na conta 1', () => {
  it('previa de 500 reproduz o exemplo da planilha', () => {
    const previa = previaEntradaConta1(criarEstadoInicial(), 500)

    expect(previa.diferenca).toBe(500)
    expect(previa.valorPorcentagem1).toBe(150)
    expect(previa.valorPorcentagem2).toBe(350)
    expect(previa.valorAtual).toBe(150)
    expect(previa.valorReserva).toBe(350)
    expect(previa.valorDisponivelConta1).toBe(350)
    expect(previa.totalContas).toBe(350)
  })

  it('confirmar 500 aplica os valores da planilha', () => {
    const estado = confirmarEntradaConta1(criarEstadoInicial(), 500)

    expect(estado.valorAtual).toBe(150)
    expect(estado.valorReserva).toBe(350)
    expect(estado.valorDisponivelConta1).toBe(350)
    expect(estado.valorDisponivelConta2).toBe(0)
    expect(estado.totalContas).toBe(350)
  })

  it('previa de 700 reproduz o segundo exemplo da planilha', () => {
    const anterior = confirmarEntradaConta1(criarEstadoInicial(), 500)
    const previa = previaEntradaConta1(anterior, 700)

    expect(previa.diferenca).toBe(550)
    expect(previa.valorPorcentagem1).toBe(165)
    expect(previa.valorPorcentagem2).toBe(385)
    expect(previa.valorAtual).toBe(315)
    expect(previa.valorReserva).toBe(735)
  })

  it('confirmar 700 aplica atual 315 e reserva 735', () => {
    const anterior = confirmarEntradaConta1(criarEstadoInicial(), 500)
    const estado = confirmarEntradaConta1(anterior, 700)

    expect(estado.valorAtual).toBe(315)
    expect(estado.valorReserva).toBe(735)
    expect(estado.valorDisponivelConta1).toBe(735)
    expect(estado.totalContas).toBe(735)
  })

  it('mantem a diferenca em zero quando a entrada e menor que o valor atual', () => {
    const anterior = confirmarEntradaConta1(criarEstadoInicial(), 500)
    const previa = previaEntradaConta1(anterior, 100)

    expect(previa.diferenca).toBe(0)
    expect(previa.valorPorcentagem1).toBe(0)
    expect(previa.valorPorcentagem2).toBe(0)
  })

  it('ignora entradas negativas na conta 1', () => {
    const estadoInicial = criarEstadoInicial()

    expect(confirmarEntradaConta1(estadoInicial, -100)).toEqual(estadoInicial)
  })

  it('respeita percentual customizado', () => {
    const estado = confirmarEntradaConta1(
      definirPercentual(criarEstadoInicial(), 0.5),
      500,
    )

    expect(estado.valorAtual).toBe(250)
    expect(estado.valorReserva).toBe(250)
  })

  it('arredonda para centavos', () => {
    const estado = confirmarEntradaConta1(criarEstadoInicial(), 100.5)

    expect(estado.valorAtual).toBe(30.15)
    expect(estado.valorReserva).toBe(70.35)
  })

  it('nao altera o estado confirmado na previa', () => {
    const estadoInicial = criarEstadoInicial()
    previaEntradaConta1(estadoInicial, 500)

    expect(estadoInicial.valorAtual).toBe(0)
    expect(estadoInicial.valorReserva).toBe(0)
  })
})

describe('entrada na conta 2', () => {
  it('soma ao disponivel da conta 2', () => {
    const estado = confirmarEntradaConta2(criarEstadoInicial(), 1000)

    expect(estado.valorDisponivelConta2).toBe(1000)
    expect(estado.totalContas).toBe(1000)
  })

  it('aceita entrada negativa', () => {
    const comSaldo = confirmarEntradaConta2(criarEstadoInicial(), 400)
    const estado = confirmarEntradaConta2(comSaldo, -700)

    expect(estado.valorDisponivelConta2).toBe(-300)
    expect(estado.totalContas).toBe(-300)
  })

  it('previa nao altera o disponivel confirmado', () => {
    const comSaldo = confirmarEntradaConta2(criarEstadoInicial(), 300)
    const previa = previaEntradaConta2(comSaldo, 1000)

    expect(previa.valorDisponivelConta2).toBe(1300)
    expect(comSaldo.valorDisponivelConta2).toBe(300)
  })

  it('mantem o total como soma dos disponiveis', () => {
    const comConta1 = confirmarEntradaConta1(criarEstadoInicial(), 500)
    const comConta2 = confirmarEntradaConta2(comConta1, 1000)

    expect(comConta2.totalContas).toBe(1350)
    expect(comConta2.totalContas).toBe(
      comConta2.valorDisponivelConta1 + comConta2.valorDisponivelConta2,
    )
  })
})

describe('pagamento', () => {
  it('subtrai do disponivel da conta 1 e recalcula o total', () => {
    const comSaldo = confirmarEntradaConta1(criarEstadoInicial(), 500)
    const estado = aplicarPagamento(comSaldo, 1, 100)

    expect(estado.valorDisponivelConta1).toBe(250)
    expect(estado.valorReserva).toBe(350)
    expect(estado.totalContas).toBe(250)
  })

  it('subtrai do disponivel da conta 2 e recalcula o total', () => {
    const comSaldo = confirmarEntradaConta2(criarEstadoInicial(), 1000)
    const estado = aplicarPagamento(comSaldo, 2, 250)

    expect(estado.valorDisponivelConta2).toBe(750)
    expect(estado.totalContas).toBe(750)
  })

  it('permite saldo negativo ao pagar mais que o disponivel', () => {
    const comSaldo = confirmarEntradaConta2(criarEstadoInicial(), 100)
    const estado = aplicarPagamento(comSaldo, 2, 300)

    expect(estado.valorDisponivelConta2).toBe(-200)
    expect(estado.totalContas).toBe(-200)
  })
})
