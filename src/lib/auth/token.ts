const TOKEN_AMBIENTE: string = import.meta.env.VITE_BEARER_TOKEN ?? ''

export function tokenConfigurado(): boolean {
  return TOKEN_AMBIENTE.trim() !== ''
}

export function tokenValido(token: string): boolean {
  return tokenConfigurado() && token.trim() === TOKEN_AMBIENTE.trim()
}

export function cabecalhoAuthorization(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` }
}
