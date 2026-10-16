import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { criarEstadoInicial, definirPercentual } from '../lib/calc/engine'
import { ContasContext } from '../store/contasContext'
import type { ValorContas } from '../store/contasContext'
import type { Movimento, PreviaEntrada } from '../types/domain'
import { DashboardPage } from './DashboardPage'

function normalizar(html: string): string {
  return html.replaceAll('\u00a0', ' ')
}

function renderizarCom(estado: ValorContas['estado']): string {
  const valor: ValorContas = { despachar: () => undefined, status: 'pronto', estado }
  return normalizar(
    renderToStaticMarkup(
      <ContasContext.Provider value={valor}>
        <DashboardPage />
      </ContasContext.Provider>,
    ),
  )
}

const movimento: Movimento = {
  id: 'mov-1',
  tipo: 'entrada-conta1',
  conta: 1,
  valor: 500,
  percentual: 0.3,
  em: '2026-01-01T12:00:00.000Z',
  antes: criarEstadoInicial(),
  depois: {
    ...criarEstadoInicial(),
    valorAtual: 150,
    valorReserva: 350,
    valorDisponivelConta1: 350,
    totalContas: 350,
  },
}

const previa: PreviaEntrada = {
  conta: 1,
  valor: 500,
  diferenca: 500,
  valorPorcentagem1: 150,
  valorPorcentagem2: 350,
  valorAtual: 150,
  valorReserva: 350,
  valorDisponivelConta1: 350,
  valorDisponivelConta2: 0,
  totalContas: 350,
}

describe('DashboardPage', () => {
  it('mostra as duas contas e o total', () => {
    const html = renderizarCom({
      contas: {
        ...definirPercentual(criarEstadoInicial(), 0.3),
        valorAtual: 150,
        valorReserva: 350,
        valorDisponivelConta1: 350,
        valorDisponivelConta2: -200,
        totalContas: 150,
      },
      previa: null,
      movimentos: [movimento],
    })

    expect(html).toContain('Conta 1')
    expect(html).toContain('Conta 2')
    expect(html).toContain('Total das contas')
    expect(html).toContain('R$ 150,00')
  })

  it('mostra a situacao negativa da conta 2', () => {
    const html = renderizarCom({
      contas: { ...criarEstadoInicial(), valorDisponivelConta2: -200, totalContas: -200 },
      previa: null,
      movimentos: [],
    })

    expect(html).toContain('Negativo')
    expect(html).toContain('-R$ 200,00')
  })

  it('mostra o historico com o movimento registrado', () => {
    const html = renderizarCom({
      contas: criarEstadoInicial(),
      previa: null,
      movimentos: [movimento],
    })

    expect(html).toContain('Histórico recente')
    expect(html).toContain('Entrada na conta 1')
    expect(html).toContain('Total de movimentos: 1')
  })

  it('exibe a previa quando existe entrada em digitacao', () => {
    const html = renderizarCom({ contas: criarEstadoInicial(), previa, movimentos: [] })

    expect(html).toContain('Prévia')
    expect(html).toContain('Diferença')
    expect(html).toContain('Parte atual (30%)')
    expect(html).toContain('R$ 150,00')
    expect(html).toContain('R$ 350,00')
  })
})
