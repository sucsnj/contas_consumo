import { afterEach, describe, expect, it, vi } from 'vitest'
import { cabecalhoAuthorization, verificarToken } from './token'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('verificarToken', () => {
  it('aceita o token quando o servidor responde 204', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 204 })))

    expect(await verificarToken('  abc  ')).toBe('autenticado')
  })

  it('recusa quando o servidor responde 401', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 401 })))

    expect(await verificarToken('errado')).toBe('token-invalido')
  })

  it('avisa quando o servidor nao tem token configurado', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 503 })))

    expect(await verificarToken('abc')).toBe('servidor-sem-token')
  })

  it('recusa token vazio sem chamar o servidor', async () => {
    const fetchFalso = vi.fn()
    vi.stubGlobal('fetch', fetchFalso)

    expect(await verificarToken('   ')).toBe('token-invalido')
    expect(fetchFalso).not.toHaveBeenCalled()
  })

  it('distingue servidor fora do ar de token invalido', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new Error('sem rede'))))

    expect(await verificarToken('abc')).toBe('servidor-indisponivel')
  })

  it('trata proxy sem API como servidor indisponivel', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 500 })))

    expect(await verificarToken('abc')).toBe('servidor-indisponivel')
  })
})

describe('cabecalhoAuthorization', () => {
  it('monta o cabecalho no formato bearer', () => {
    expect(cabecalhoAuthorization('abc')).toEqual({ Authorization: 'Bearer abc' })
  })
})
