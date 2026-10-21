import { describe, expect, it } from 'vitest'
import { criarEstadoInicial } from '../calc/engine'
import {
  migrarContasAntigas,
  validarContas,
  validarEstadoHistorico,
  validarMovimento,
} from './validacao'

describe('validarContas', () => {
  it('aceita o estado completo', () => {
    expect(validarContas({ saldo: 10, saldo2: 20, reserva: 30, porcentagem1: 0.4 })).toEqual({
      saldo: 10,
      saldo2: 20,
      reserva: 30,
      porcentagem1: 0.4,
    })
  })

  it('rejeita campos ausentes ou invalidos', () => {
    expect(validarContas({ saldo: 'dez' })).toBeNull()
    expect(validarContas({ saldo: 1, saldo2: 2, reserva: 3 })).toBeNull()
    expect(validarContas(null)).toBeNull()
  })
})

describe('migrarContasAntigas', () => {
  it('migra o modelo antigo para o novo', () => {
    const antigo = {
      percentual: 0.3,
      valorAtual: 150,
      valorReserva: 350,
      valorDisponivelConta1: 350,
      valorDisponivelConta2: 200,
      totalContas: 550,
    }

    expect(migrarContasAntigas(antigo)).toEqual({
      saldo: 150,
      saldo2: 200,
      reserva: 350,
      porcentagem1: 0.3,
    })
  })

  it('usa o padrao quando a porcentagem antiga e invalida', () => {
    const antigo = { percentual: 5, valorAtual: 1, valorReserva: 2, valorDisponivelConta2: 3 }

    expect(migrarContasAntigas(antigo)?.porcentagem1).toBe(0.3)
  })
})

describe('validarMovimento', () => {
  const movimento = {
    id: 'a',
    tipo: 'ajuste',
    campo: 'saldo',
    valor: 10,
    em: '2026-01-01T00:00:00.000Z',
    antes: criarEstadoInicial(),
    depois: criarEstadoInicial(),
  }

  it('aceita um movimento completo', () => {
    expect(validarMovimento(movimento)).toEqual(movimento)
  })

  it('aceita campo nulo e rejeita tipo desconhecido', () => {
    expect(validarMovimento({ ...movimento, campo: null })).not.toBeNull()
    expect(validarMovimento({ ...movimento, tipo: 'inexistente' })).toBeNull()
  })

  it('rejeita antes/depois invalidos', () => {
    expect(validarMovimento({ ...movimento, depois: { saldo: 'x' } })).toBeNull()
  })
})

describe('validarEstadoHistorico', () => {
  const registro = {
    id: 'a',
    em: '2026-01-01T00:00:00.000Z',
    rotulo: 'Entrada',
    estado: criarEstadoInicial(),
  }

  it('aceita um snapshot completo', () => {
    expect(validarEstadoHistorico(registro)).toEqual(registro)
  })

  it('rejeita snapshot sem estado valido', () => {
    expect(validarEstadoHistorico({ ...registro, estado: {} })).toBeNull()
  })
})
