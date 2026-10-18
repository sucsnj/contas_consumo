import { describe, expect, it } from 'vitest'
import {
  PORCENTAGEM_PADRAO,
  ajustar,
  calcularTotal,
  confirmarEntrada,
  confirmarEntrada2,
  criarEstadoInicial,
  definirPorcentagem,
  entradaValida,
  pagar,
  pagamentoPossivel,
  previaEntrada,
  previaEntrada2,
  porcentagemValida,
} from './engine'

describe('criarEstadoInicial', () => {
  it('comeca zerado com 30% de padrao', () => {
    expect(criarEstadoInicial()).toEqual({
      saldo: 0,
      saldo2: 0,
      reserva: 0,
      porcentagem1: PORCENTAGEM_PADRAO,
    })
  })
})

describe('calcularTotal', () => {
  it('soma saldo e saldo2, sem a reserva', () => {
    const estado = { saldo: 350, saldo2: 150, reserva: 900, porcentagem1: 0.3 }

    expect(calcularTotal(estado)).toBe(500)
  })
})

describe('previaEntrada', () => {
  it('reproduz o exemplo de referencia do ADR-0002', () => {
    const estado = { saldo: 350, saldo2: 0, reserva: 150, porcentagem1: 0.3 }
    const previa = previaEntrada(estado, 700)

    expect(previa.diferenca).toBe(350)
    expect(previa.porcentagem2).toBe(0.7)
    expect(previa.porcentagemReserva).toBe(105)
    expect(previa.porcentagemSaldo).toBe(245)
    expect(previa.novoReserva).toBe(255)
    expect(previa.novoSaldo).toBe(595)
    expect(previa.total).toBe(595)
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

  it('zera a diferenca quando a entrada iguala o saldo', () => {
    const estado = { saldo: 350, saldo2: 0, reserva: 150, porcentagem1: 0.3 }
    const previa = previaEntrada(estado, 350)

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
  it('rejeita entrada menor que o saldo', () => {
    const estado = { saldo: 350, saldo2: 0, reserva: 0, porcentagem1: 0.3 }

    expect(entradaValida(estado, 350)).toBe(true)
    expect(entradaValida(estado, 700)).toBe(true)
    expect(entradaValida(estado, 349.99)).toBe(false)
  })
})

describe('confirmarEntrada', () => {
  it('aplica novo saldo e nova reserva', () => {
    const estado = { saldo: 350, saldo2: 100, reserva: 150, porcentagem1: 0.3 }
    const resultado = confirmarEntrada(estado, 700)

    expect(resultado).toEqual({ saldo: 595, saldo2: 100, reserva: 255, porcentagem1: 0.3 })
    expect(calcularTotal(resultado!)).toBe(695)
  })

  it('devolve null quando a entrada e invalida', () => {
    const estado = { saldo: 350, saldo2: 0, reserva: 0, porcentagem1: 0.3 }

    expect(confirmarEntrada(estado, 100)).toBeNull()
  })
})

describe('entrada2', () => {
  it('substitui o saldo2 pelo valor absoluto', () => {
    const estado = { saldo: 350, saldo2: 300, reserva: 0, porcentagem1: 0.3 }
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
  const estado = { saldo: 595, saldo2: 200, reserva: 255, porcentagem1: 0.3 }

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

  it('bloqueia pagamento maior que o disponivel', () => {
    expect(pagar(estado, 'saldo', 600)).toBeNull()
    expect(pagar(estado, 'reserva', 256)).toBeNull()
    expect(pagar(estado, 'saldo2', 201)).toBeNull()
  })

  it('bloqueia pagamento zero ou negativo', () => {
    expect(pagamentoPossivel(estado, 'saldo', 0)).toBe(false)
    expect(pagar(estado, 'saldo', -10)).toBeNull()
  })

  it('aceita pagar exatamente o disponivel, deixando zero', () => {
    const resultado = pagar(estado, 'saldo', 595)

    expect(resultado).toEqual({ ...estado, saldo: 0 })
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