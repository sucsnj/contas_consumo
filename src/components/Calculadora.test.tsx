import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Calculadora } from './Calculadora'

describe('Calculadora', () => {
  it('renderiza display, teclas e acoes', () => {
    const html = renderToStaticMarkup(<Calculadora aoUsarValor={() => undefined} aoFechar={() => undefined} />)

    expect(html).toContain('Calculadora')
    expect(html).toContain('calculadora-expressao')
    expect(html).toContain('Usar valor no pagamento')
  })

  it('mantem o botao de uso desabilitado sem resultado', () => {
    const html = renderToStaticMarkup(<Calculadora aoUsarValor={() => undefined} aoFechar={() => undefined} />)

    expect(html).toContain('disabled=""')
  })
})
