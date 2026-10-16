interface ArmazenamentoSimples {
  getItem(chave: string): string | null
  setItem(chave: string, valor: string): void
  removeItem(chave: string): void
}

const memoria = new Map<string, string>()

const memoriaLocal: ArmazenamentoSimples = {
  getItem: (chave) => memoria.get(chave) ?? null,
  setItem: (chave, valor) => {
    memoria.set(chave, valor)
  },
  removeItem: (chave) => {
    memoria.delete(chave)
  },
}

export function obterArmazenamento(): ArmazenamentoSimples {
  if (typeof localStorage !== 'undefined') return localStorage
  return memoriaLocal
}

export function ler(chave: string): string | null {
  try {
    return obterArmazenamento().getItem(chave)
  } catch {
    return null
  }
}

export function escrever(chave: string, valor: string): void {
  try {
    obterArmazenamento().setItem(chave, valor)
  } catch {
    // armazenamento indisponivel ou cheio: o app continua funcionando em memoria
  }
}

export function remover(chave: string): void {
  try {
    obterArmazenamento().removeItem(chave)
  } catch {
    // ignorado propositalmente
  }
}
