import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { criarEstadoInicial } from '../lib/calc/engine'
import { ContextoAuth } from '../lib/auth/contextoAuth'
import type { ValorAuth } from '../lib/auth/contextoAuth'
import { ContasContext } from '../store/contasContext'
import type { ValorContas } from '../store/contasContext'
import type { Movimento } from '../types/domain'
import { DashboardPage } from './DashboardPage'

function normalizar(html: string): string {
  return html.replaceAll('\u00a0', ' ')
}

const valorAuth: ValorAuth = {
  status: 'autenticado',
  token: 'token',
  entrar: async () => 'autenticado',
  sair: () => undefined,
}

function renderizarCom(estado: ValorContas['estado']): string {
  const valor: ValorContas = { despachar: () => undefined, status: 'pronto', estado }
  return normalizar(
    renderToStaticMarkup(
      <ContextoAuth.Provider value={valorAuth}>
        <ContasContext.Provider value={valor}>
          <DashboardPage />
        </ContasContext.Provider>
      </ContextoAuth.Provider>,
    ),
  )
}

const movimento: Movimento = {
  id: 'mov-1',
  tipo: 'entrada',
  campo: 'saldo',
  valor: 500,
  em: '2026-01-01T12:00:00.000Z',
  antes: criarEstadoInicial(),
  depois: { saldo: 350, saldo2: 0, reserva: 150, porcentagem1: 0.3, emprestado: 0 },
}

describe('DashboardPage', () => {
  it('mostra as duas contas e o total', () => {
    const html = renderizarCom({
      contas: { saldo: 595, saldo2: 200, reserva: 255, porcentagem1: 0.3, emprestado: 0 },
      movimentos: [movimento],
      estados: [],
    })

    expect(html).toContain('Saldo')
    expect(html).toContain('Saldo 2')
    expect(html).toContain('Reserva')
    expect(html).toContain('R$ 795,00')
  })

  it('mostra a situacao negativa do saldo2', () => {
    const html = renderizarCom({
      contas: { saldo: 100, saldo2: -200, reserva: 0, porcentagem1: 0.3, emprestado: 0 },
      movimentos: [],
      estados: [],
    })

    expect(html).toContain('Negativo')
    expect(html).toContain('-R$ 200,00')
  })

  it('mostra o historico com o movimento registrado', () => {
    const html = renderizarCom({
      contas: { saldo: 0, saldo2: 0, reserva: 0, porcentagem1: 0.3, emprestado: 0 },
      movimentos: [movimento],
      estados: [],
    })

    expect(html).toContain('Movimentos')
    expect(html).toContain('Entrada na conta 1')
    expect(html).toContain('Total de movimentos: 1')
  })

  it('mostra os estados de backup', () => {
    const html = renderizarCom({
      contas: { saldo: 0, saldo2: 0, reserva: 0, porcentagem1: 0.3, emprestado: 0 },
      movimentos: [],
      estados: [
        {
          id: 'e1',
          em: '2026-01-01T12:00:00.000Z',
          rotulo: 'Entrada na conta 1',
          estado: { saldo: 350, saldo2: 0, reserva: 150, porcentagem1: 0.3, emprestado: 0 },
        },
      ],
    })

    expect(html).toContain('Histórico de estados')
    expect(html).toContain('Entrada na conta 1')
    expect(html).toContain('Reverter')
  })

  it('mostra o emprestado da conta 1', () => {
    const html = renderizarCom({
      contas: { saldo: 300, saldo2: 0, reserva: 200, porcentagem1: 0.3, emprestado: -70 },
      movimentos: [],
      estados: [],
    })

    expect(html).toContain('Emprestado')
    expect(html).toContain('-R$ 70,00')
  })

  it('mostra o indicador de autenticacao e a acao de sair', () => {
    const html = renderizarCom({ contas: criarEstadoInicial(), movimentos: [], estados: [] })

    expect(html).toContain('Autenticado')
    expect(html).toContain('Sair')
  })
})