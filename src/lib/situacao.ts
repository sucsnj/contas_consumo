export type Tom = 'verde' | 'azul' | 'vermelho' | 'amarelo' | 'cinza'

export function tomSituacao(valor: number): Tom {
  if (valor > 0) return 'verde'
  if (valor < 0) return 'vermelho'
  return 'cinza'
}

export function rotuloSituacao(valor: number): string {
  if (valor > 0) return 'Positivo'
  if (valor < 0) return 'Negativo'
  return 'Zerado'
}
