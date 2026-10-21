import { describe, expect, it } from 'vitest'
import { ESTADO_INICIAL, reducerContas } from './reducer'
import { criarEstadoInicial } from '../lib/calc/engine'
import type { AppState } from './reducer'
import type { ContasState } from '../types/domain'

function comContas(contas: ContasState, base: AppState = ESTADO_INICIAL): AppState {
  return { ...base, contas }
}

describe('reducerContas', () => {
  it('confirmar entrada aplica e registra estado', () => {
    const estado = reducerContas(ESTADO_INICIAL, { tipo: 'confirmarEntrada', entrada: 500 })

    expect(estado.contas).toEqual({
      saldo: 350,
      saldo2: 0,
      reserva: 150,
      porcentagem1: 0.3,
      emprestado: 0,
    })
    expect(estado.movimentos).toHaveLength(1)
    expect(estado.estados).toHaveLength(1)
    expect(estado.estados[0].rotulo).toBe('Entrada na conta 1')
  })

  it('confirmar entrada2 substitui o saldo2', () => {
    const estado = reducerContas(ESTADO_INICIAL, { tipo: 'confirmarEntrada2', entrada2: 1000 })

    expect(estado.contas.saldo2).toBe(1000)
    expect(estado.movimentos[0].tipo).toBe('entrada2')
  })

  it('confirmar entrada invalida nao altera nada', () => {
    const base = comContas({ saldo: 500, saldo2: 0, reserva: 200, porcentagem1: 0.3, emprestado: 0 })
    const estado = reducerContas(base, { tipo: 'confirmarEntrada', entrada: 100 })

    expect(estado).toBe(base)
  })

  it('pagar subtrai e registra movimento e estado', () => {
    const base = comContas({ saldo: 595, saldo2: 200, reserva: 255, porcentagem1: 0.3, emprestado: 0 })
    const estado = reducerContas(base, { tipo: 'pagar', destino: 'saldo', valor: 95 })

    expect(estado.contas.saldo).toBe(500)
    expect(estado.movimentos[0].tipo).toBe('pagamento-saldo')
    expect(estado.estados).toHaveLength(1)
  })

  it('pagar da reserva nao altera o total', () => {
    const base = comContas({ saldo: 595, saldo2: 200, reserva: 255, porcentagem1: 0.3, emprestado: 0 })
    const estado = reducerContas(base, { tipo: 'pagar', destino: 'reserva', valor: 55 })

    expect(estado.contas.reserva).toBe(200)
    expect(estado.contas.saldo + estado.contas.saldo2).toBe(base.contas.saldo + base.contas.saldo2)
  })

  it('pagar saldo acima do valor usa a reserva e registra o emprestado', () => {
    const base = comContas({ saldo: 100, saldo2: 100, reserva: 100, porcentagem1: 0.3, emprestado: 0 })
    const estado = reducerContas(base, { tipo: 'pagar', destino: 'saldo', valor: 150 })

    expect(estado.contas).toEqual({
      saldo: 0,
      saldo2: 100,
      reserva: 50,
      porcentagem1: 0.3,
      emprestado: -50,
    })
    expect(estado.movimentos[0].tipo).toBe('pagamento-saldo')
  })

  it('bloqueia pagamento do saldo sem reserva suficiente', () => {
    const base = comContas({ saldo: 10, saldo2: 0, reserva: 20, porcentagem1: 0.3, emprestado: 0 })

    expect(reducerContas(base, { tipo: 'pagar', destino: 'saldo', valor: 150 })).toBe(base)
  })

  it('devolucao cede saldo para a reserva e zera o emprestado', () => {
    const base = comContas({ saldo: 300, saldo2: 0, reserva: 200, porcentagem1: 0.3, emprestado: -70 })
    const estado = reducerContas(base, { tipo: 'devolver' })

    expect(estado.contas).toEqual({
      saldo: 230,
      saldo2: 0,
      reserva: 270,
      porcentagem1: 0.3,
      emprestado: 0,
    })
    expect(estado.movimentos[0].tipo).toBe('devolucao')
    expect(estado.movimentos[0].valor).toBe(70)
    expect(estado.estados[0].rotulo).toBe('Devolução para a reserva')
  })

  it('bloqueia devolucao sem emprestado negativo', () => {
    const base = comContas({ saldo: 300, saldo2: 0, reserva: 200, porcentagem1: 0.3, emprestado: 0 })

    expect(reducerContas(base, { tipo: 'devolver' })).toBe(base)
  })

  it('bloqueia pagamento com valor zero ou negativo', () => {
    const base = comContas({ saldo: 100, saldo2: 100, reserva: 100, porcentagem1: 0.3, emprestado: 0 })

    expect(reducerContas(base, { tipo: 'pagar', destino: 'saldo', valor: 0 })).toBe(base)
    expect(reducerContas(base, { tipo: 'pagar', destino: 'saldo', valor: -10 })).toBe(base)
  })

  it('ajusta campo e registra movimento', () => {
    const estado = reducerContas(ESTADO_INICIAL, { tipo: 'ajustar', campo: 'saldo', valor: 100 })

    expect(estado.contas.saldo).toBe(100)
    expect(estado.movimentos[0].tipo).toBe('ajuste')
  })

  it('bloqueia ajuste de porcentagem invalida', () => {
    const base = comContas(criarEstadoInicial())
    const estado = reducerContas(base, { tipo: 'ajustar', campo: 'porcentagem1', valor: 1.5 })

    expect(estado).toBe(base)
  })

  it('mantem no maximo 3 estados no historico', () => {
    let estado: AppState = ESTADO_INICIAL
    for (let i = 1; i <= 5; i++) {
      estado = reducerContas(estado, { tipo: 'ajustar', campo: 'saldo', valor: i * 100 })
    }

    expect(estado.estados).toHaveLength(3)
    expect(estado.contas.saldo).toBe(500)
  })

  it('reverter restaura estado sem criar novo estado no historico', () => {
    const comSaldo = reducerContas(ESTADO_INICIAL, { tipo: 'ajustar', campo: 'saldo', valor: 100 })
    const alvo = comSaldo.estados[0].estado
    const revertido = reducerContas(comSaldo, { tipo: 'reverter', estado: alvo })

    expect(revertido.contas).toEqual(alvo)
    expect(revertido.estados).toHaveLength(1)
    expect(revertido.movimentos.at(-1)?.tipo).toBe('reversao')
  })

  it('reiniciar zera saldos preservando porcentagem', () => {
    const comDados = comContas({ saldo: 100, saldo2: 50, reserva: 20, porcentagem1: 0.5, emprestado: -30 })
    const estado = reducerContas(comDados, { tipo: 'reiniciar' })

    expect(estado.contas).toEqual({
      saldo: 0,
      saldo2: 0,
      reserva: 0,
      porcentagem1: 0.5,
      emprestado: 0,
    })
    expect(estado.movimentos).toHaveLength(0)
    expect(estado.estados).toHaveLength(0)
  })

  it('hidratar substitui contas, movimentos e estados', () => {
    const estado = reducerContas(ESTADO_INICIAL, {
      tipo: 'hidratar',
      contas: { saldo: 1, saldo2: 2, reserva: 3, porcentagem1: 0.4, emprestado: -1 },
      movimentos: [],
      estados: [],
    })

    expect(estado.contas.saldo).toBe(1)
    expect(estado.contas.emprestado).toBe(-1)
  })
})