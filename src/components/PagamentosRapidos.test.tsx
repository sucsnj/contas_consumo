import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { criarEstadoInicial } from '../lib/calc/engine'
import { ContasContext } from '../store/contasContext'
import type { ValorContas } from '../store/contasContext'
import type { ContasState } from '../types/domain'
import { PagamentosRapidos } from './PagamentosRapidos'

function normalizar(html: string): string {
  return html.replaceAll('\u00a0', ' ')
}

function renderizar(contas: ContasState, valor: number): string {
  const valorContas: ValorContas = {
    despachar: () => undefined,
    status: 'pronto',
    estado: { contas, movimentos: [], estados: [] },
  }

  return normalizar(
    renderToStaticMarkup(
      <ContasContext.Provider value={valorContas}>
        <PagamentosRapidos valor={valor} aoConcluir={() => undefined} />
      </ContasContext.Provider>,
    ),
  )
}

function contas(dados: Partial<ContasState> = {}): ContasState {
  return { ...criarEstadoInicial(), ...dados }
}

describe('PagamentosRapidos', () => {
  it('mostra pagar e devolucao sem emprestado negativo', () => {
    const html = renderizar(contas({ saldo: 500, reserva: 200 }), 100)

    expect(html).toContain('Pagar R$ 100,00')
    expect(html).toContain('Pagar saldo')
    expect(html).toContain('Pagar reserva')
    expect(html).toContain('Pagar saldo2')
    expect(html).toContain('Devolução')
    expect(html).not.toContain('Devolve R$')
    expect(html).not.toContain('Saldo zerado')
  })

  it('devolve o emprestado quando o saldo cobre', () => {
    const html = renderizar(contas({ saldo: 300, reserva: 200, emprestado: -70 }), 100)

    expect(html).toContain('Devolução')
    expect(html).toContain('Devolve R$ 70,00 do saldo para a reserva')
  })

  it('avisa quando nao ha saldo para devolver', () => {
    const html = renderizar(contas({ saldo: 0, reserva: 200, emprestado: -70 }), 100)

    expect(html).toContain('Saldo zerado: não há valor para devolver.')
  })

  it('mostra o emprestimo previsto ao pagar saldo acima do saldo', () => {
    const html = renderizar(contas({ saldo: 150, reserva: 500 }), 200)

    expect(html).toContain('A reserva cobre R$ 50,00')
    expect(html).toContain('Emprestado: -R$ 50,00')
  })

  it('avisa quando a reserva nao cobre o pagamento do saldo', () => {
    const html = renderizar(contas({ saldo: 150, reserva: 30 }), 200)

    expect(html).toContain('A reserva não cobre R$ 50,00')
    expect(html).toContain('O pagamento do saldo não será realizado.')
  })
})
