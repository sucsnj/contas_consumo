import { describe, expect, it } from 'vitest'
import type { ContasState } from '../../types/domain'
import {
  PORCENTAGEM_PADRAO,
  ajustar,
  arredondarMoeda,
  calcularTotal,
  confirmarEntrada,
  confirmarEntrada2,
  criarEstadoInicial,
  definirPorcentagem,
  devolucaoPossivel,
  devolver,
  entradaValida,
  pagamentoValido,
  pagar,
  pagamentoPossivel,
  previaEntrada,
  previaEntrada2,
  porcentagemValida,
  reservaNecessaria,
  saldoAposPagamento,
  valorDevolucao,
} from './engine'

function contas(dados: Omit<ContasState, 'emprestado'> & Partial<Pick<ContasState, 'emprestado'>>): ContasState {
  return { emprestado: 0, ...dados }
}

describe('criarEstadoInicial', () => {
  it('comeca zerado com 30% de padrao', () => {
    expect(criarEstadoInicial()).toEqual({
      saldo: 0,
      saldo2: 0,
      reserva: 0,
      porcentagem1: PORCENTAGEM_PADRAO,
      emprestado: 0,
    })
  })
})

describe('calcularTotal', () => {
  it('soma saldo e saldo2, sem a reserva', () => {
    const estado = contas({ saldo: 350, saldo2: 150, reserva: 900, porcentagem1: 0.3 })

    expect(calcularTotal(estado)).toBe(500)
  })

  it('nao considera o emprestado, que e uma divida entre saldo e reserva', () => {
    const estado = contas({ saldo: 0, saldo2: 150, reserva: 450, porcentagem1: 0.3, emprestado: -50 })

    expect(calcularTotal(estado)).toBe(150)
  })
})

describe('arredondarMoeda', () => {
  it('evita zero negativo', () => {
    expect(Object.is(arredondarMoeda(-0.004), 0)).toBe(true)
  })
})

describe('previaEntrada', () => {
  it('reproduz o exemplo de referencia do ADR-0002', () => {
    const estado = contas({ saldo: 350, saldo2: 0, reserva: 150, porcentagem1: 0.3 })
    const previa = previaEntrada(estado, 700)

    expect(previa.diferenca).toBe(550)
    expect(previa.porcentagem2).toBe(0.7)
    expect(previa.porcentagemReserva).toBe(165)
    expect(previa.porcentagemSaldo).toBe(385)
    expect(previa.novoReserva).toBe(315)
    expect(previa.novoSaldo).toBe(735)
    expect(previa.total).toBe(735)
  })

  it('manda 30% para a reserva e 70% para o saldo', () => {
    const previa = previaEntrada(criarEstadoInicial(), 500)

    expect(previa.diferenca).toBe(500)
    expect(previa.novoReserva).toBe(150)
    expect(previa.novoSaldo).toBe(350)
  })

  it('respeita percentual customizado', () => {
    const estado = definirPorcentagem(criarEstadoInicial(), 0.5)
    const previa = previaEntrada(estado, 500)

    expect(previa.novoReserva).toBe(250)
    expect(previa.novoSaldo).toBe(250)
  })

  it('zera a diferenca quando a entrada iguala a reserva', () => {
    const estado = contas({ saldo: 350, saldo2: 0, reserva: 150, porcentagem1: 0.3 })
    const previa = previaEntrada(estado, 150)

    expect(previa.diferenca).toBe(0)
    expect(previa.novoSaldo).toBe(350)
    expect(previa.novoReserva).toBe(150)
  })

  it('nao altera o estado na previa', () => {
    const estado = criarEstadoInicial()
    previaEntrada(estado, 500)

    expect(estado.saldo).toBe(0)
    expect(estado.reserva).toBe(0)
  })

  it('arredonda para centavos', () => {
    const previa = previaEntrada(criarEstadoInicial(), 100.5)

    expect(previa.novoReserva).toBe(30.15)
    expect(previa.novoSaldo).toBe(70.35)
  })
})

describe('entradaValida', () => {
  it('rejeita entrada menor que a reserva', () => {
    const estado = contas({ saldo: 350, saldo2: 0, reserva: 150, porcentagem1: 0.3 })

    expect(entradaValida(estado, 150)).toBe(true)
    expect(entradaValida(estado, 700)).toBe(true)
    expect(entradaValida(estado, 149.99)).toBe(false)
  })

  it('aceita entrada menor que o saldo quando a reserva permite', () => {
    const estado = contas({ saldo: 900, saldo2: 0, reserva: 150, porcentagem1: 0.3 })

    expect(entradaValida(estado, 200)).toBe(true)
  })
})

describe('confirmarEntrada', () => {
  it('aplica novo saldo e nova reserva', () => {
    const estado = contas({ saldo: 350, saldo2: 100, reserva: 150, porcentagem1: 0.3 })
    const resultado = confirmarEntrada(estado, 700)

    expect(resultado).toEqual({
      saldo: 735,
      saldo2: 100,
      reserva: 315,
      porcentagem1: 0.3,
      emprestado: 0,
    })
    expect(calcularTotal(resultado!)).toBe(835)
  })

  it('devolve null quando a entrada e menor que a reserva', () => {
    const estado = contas({ saldo: 350, saldo2: 0, reserva: 150, porcentagem1: 0.3 })

    expect(confirmarEntrada(estado, 100)).toBeNull()
  })
})

describe('entrada2', () => {
  it('substitui o saldo2 pelo valor absoluto', () => {
    const estado = contas({ saldo: 350, saldo2: 300, reserva: 0, porcentagem1: 0.3 })
    const previa = previaEntrada2(estado, 1000)

    expect(previa.saldo2).toBe(1000)
    expect(previa.total).toBe(1350)

    const resultado = confirmarEntrada2(estado, 1000)
    expect(resultado.saldo2).toBe(1000)
    expect(calcularTotal(resultado)).toBe(1350)
  })

  it('aceita valor negativo', () => {
    const resultado = confirmarEntrada2(criarEstadoInicial(), -200)

    expect(resultado.saldo2).toBe(-200)
    expect(calcularTotal(resultado)).toBe(-200)
  })
})

describe('pagamentos', () => {
  const estado = contas({ saldo: 595, saldo2: 200, reserva: 255, porcentagem1: 0.3 })

  it('paga do saldo', () => {
    const resultado = pagar(estado, 'saldo', 95)

    expect(resultado).toEqual({ ...estado, saldo: 500 })
  })

  it('paga da reserva sem alterar o total', () => {
    const resultado = pagar(estado, 'reserva', 55)

    expect(resultado).toEqual({ ...estado, reserva: 200 })
    expect(calcularTotal(resultado!)).toBe(calcularTotal(estado))
  })

  it('paga do saldo2', () => {
    const resultado = pagar(estado, 'saldo2', 100)

    expect(resultado).toEqual({ ...estado, saldo2: 100 })
  })

  it('paga acima do saldo usando a reserva e registrando o emprestado', () => {
    const base = contas({ saldo: 150, saldo2: 0, reserva: 500, porcentagem1: 0.3 })
    const resultado = pagar(base, 'saldo', 200)

    expect(resultado).toEqual({
      saldo: 0,
      saldo2: 0,
      reserva: 450,
      porcentagem1: 0.3,
      emprestado: -50,
    })
  })

  it('acumula o emprestado em pagamentos sucessivos', () => {
    const base = contas({ saldo: 0, saldo2: 0, reserva: 500, porcentagem1: 0.3, emprestado: -50 })
    const resultado = pagar(base, 'saldo', 30)

    expect(resultado?.emprestado).toBe(-80)
    expect(resultado?.reserva).toBe(470)
  })

  it('bloqueia quando a reserva nao cobre o excedente', () => {
    const base = contas({ saldo: 150, saldo2: 0, reserva: 30, porcentagem1: 0.3 })

    expect(pagamentoValido(base, 'saldo', 200)).toBe(false)
    expect(pagar(base, 'saldo', 200)).toBeNull()
    expect(pagamentoValido(base, 'saldo', 180)).toBe(true)
  })

  it('permite pagar mais que o disponivel na reserva e no saldo2', () => {
    expect(pagar(estado, 'reserva', 256)).toEqual({ ...estado, reserva: -1 })
    expect(pagar(estado, 'saldo2', 201)).toEqual({ ...estado, saldo2: -1 })
  })

  it('bloqueia pagamento zero ou negativo', () => {
    expect(pagamentoPossivel(0)).toBe(false)
    expect(pagamentoPossivel(-10)).toBe(false)
    expect(pagar(estado, 'saldo', -10)).toBeNull()
    expect(pagar(estado, 'saldo', 0)).toBeNull()
  })

  it('saldoAposPagamento antecipa o valor sem alterar o estado', () => {
    expect(saldoAposPagamento(estado, 'saldo', 95)).toBe(500)
    expect(saldoAposPagamento(estado, 'saldo', 1500)).toBe(0)
    expect(saldoAposPagamento(estado, 'reserva', 95)).toBe(160)
    expect(estado.saldo).toBe(595)
  })

  it('aceita pagar exatamente o disponivel, deixando zero', () => {
    const resultado = pagar(estado, 'saldo', 595)

    expect(resultado).toEqual({ ...estado, saldo: 0 })
  })
})

describe('reservaNecessaria', () => {
  it('calcula quanto a reserva precisa cobrir', () => {
    const estado = contas({ saldo: 150, saldo2: 0, reserva: 500, porcentagem1: 0.3 })

    expect(reservaNecessaria(estado, 100)).toBe(0)
    expect(reservaNecessaria(estado, 150)).toBe(0)
    expect(reservaNecessaria(estado, 200)).toBe(50)
  })
})

describe('devolucao', () => {
  it('devolve tudo quando o saldo cobre o emprestado', () => {
    const base = contas({ saldo: 300, saldo2: 0, reserva: 200, porcentagem1: 0.3, emprestado: -70 })

    expect(valorDevolucao(base)).toBe(70)
    expect(devolucaoPossivel(base)).toBe(true)
    expect(devolver(base)).toEqual({
      saldo: 230,
      saldo2: 0,
      reserva: 270,
      porcentagem1: 0.3,
      emprestado: 0,
    })
  })

  it('devolve parcialmente quando o saldo nao cobre', () => {
    const base = contas({ saldo: 50, saldo2: 0, reserva: 200, porcentagem1: 0.3, emprestado: -100 })

    expect(valorDevolucao(base)).toBe(50)
    expect(devolver(base)).toEqual({
      saldo: 0,
      saldo2: 0,
      reserva: 250,
      porcentagem1: 0.3,
      emprestado: -50,
    })
  })

  it('nao devolve sem emprestado negativo ou sem saldo', () => {
    expect(devolver(criarEstadoInicial())).toBeNull()
    expect(
      devolver(contas({ saldo: 0, saldo2: 0, reserva: 100, porcentagem1: 0.3, emprestado: -30 })),
    ).toBeNull()
    expect(valorDevolucao(criarEstadoInicial())).toBe(0)
    expect(devolucaoPossivel(criarEstadoInicial())).toBe(false)
  })

  it('devolve no maximo o valor emprestado', () => {
    const base = contas({ saldo: 500, saldo2: 0, reserva: 200, porcentagem1: 0.3, emprestado: -70 })

    expect(valorDevolucao(base)).toBe(70)
    expect(devolver(base)?.saldo).toBe(430)
    expect(devolver(base)?.reserva).toBe(270)
  })
})

describe('ajustes', () => {
  it('ajusta cada campo livremente', () => {
    const inicial = criarEstadoInicial()

    expect(ajustar(inicial, 'saldo', 123.456)).toEqual({ ...inicial, saldo: 123.46 })
    expect(ajustar(inicial, 'saldo2', -50)).toEqual({ ...inicial, saldo2: -50 })
    expect(ajustar(inicial, 'reserva', 999)).toEqual({ ...inicial, reserva: 999 })
  })

  it('rejeita porcentagem fora de 0 a 1', () => {
    const inicial = criarEstadoInicial()

    expect(porcentagemValida(0)).toBe(true)
    expect(porcentagemValida(1)).toBe(true)
    expect(porcentagemValida(-0.01)).toBe(false)
    expect(porcentagemValida(1.01)).toBe(false)
    expect(ajustar(inicial, 'porcentagem1', 1.5)).toBeNull()
  })

  it('definirPorcentagem ignora valor invalido', () => {
    const inicial = criarEstadoInicial()

    expect(definirPorcentagem(inicial, 0.6).porcentagem1).toBe(0.6)
    expect(definirPorcentagem(inicial, 2)).toEqual(inicial)
  })
})
