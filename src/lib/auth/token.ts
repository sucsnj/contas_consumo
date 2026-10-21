export type ResultadoAutenticacao = 'autenticado' | 'token-invalido' | 'servidor-sem-token'

export function cabecalhoAuthorization(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` }
}

export async function verificarToken(token: string): Promise<ResultadoAutenticacao> {
  const limpo = token.trim()
  if (limpo === '') return 'token-invalido'

  try {
    const resposta = await fetch('/api/sessao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: limpo }),
    })

    if (resposta.status === 204) return 'autenticado'
    if (resposta.status === 503) return 'servidor-sem-token'
    return 'token-invalido'
  } catch {
    return 'token-invalido'
  }
}
