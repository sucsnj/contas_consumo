import { describe, expect, it } from 'vitest'
import { cabecalhoAuthorization, tokenConfigurado, tokenValido } from './token'

describe('token', () => {
  it('considera o token do .env configurado', () => {
    expect(tokenConfigurado()).toBe(true)
  })

  it('aceita somente o token exato do ambiente', () => {
    const esperado = import.meta.env.VITE_BEARER_TOKEN as string

    expect(tokenValido(esperado)).toBe(true)
    expect(tokenValido(` ${esperado} `)).toBe(true)
    expect(tokenValido('token-errado')).toBe(false)
    expect(tokenValido('')).toBe(false)
  })

  it('monta o cabecalho Authorization no formato bearer', () => {
    expect(cabecalhoAuthorization('abc')).toEqual({ Authorization: 'Bearer abc' })
  })
})
