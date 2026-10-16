import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renderiza sem erros a estrutura inicial', () => {
    const html = renderToStaticMarkup(<App />)

    expect(html).toContain('app-shell')
    expect(html).toContain('Carregando dados')
  })
})
