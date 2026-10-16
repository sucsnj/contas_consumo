import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PainelPagamento } from './PainelPagamento'

const semAcoes = {
  conta: 1,
  nome: 'Conta 1',
  aoConfirmar: () => undefined,
  aoCancelar: () => undefined,
} as const

describe('PainelPagamento', () => {
  it('usa o proprio input para a expressao, sem calculadora separada', () => {
    const html = renderToStaticMarkup(<PainelPagamento {...semAcoes} />)

    expect(html).toContain('Valor do pagamento')
    expect(html).toContain('placeholder="150+30 ou (1200-300)/2"')
    expect(html).not.toContain('calculadora')
    expect(html).not.toContain('tecla')
  })

  it('mostra estado inicial incompleto e botao desabilitado', () => {
    const html = renderToStaticMarkup(<PainelPagamento {...semAcoes} />)

    expect(html).toContain('Expressão incompleta')
    expect(html).toContain('disabled=""')
  })

  it('explica as regras de digitos, sinais e arredondamento', () => {
    const html = renderToStaticMarkup(<PainelPagamento {...semAcoes} />)

    expect(html).toContain('Um sinal substitui o sinal anterior')
    expect(html).toContain('arredondado para cima')
  })
})
