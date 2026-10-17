import { escrever, ler, remover } from '../client'

const CHAVE_SESSAO = 'contas:token'

export async function obterTokenSalvo(): Promise<string | null> {
  return ler(CHAVE_SESSAO)
}

export async function salvarToken(token: string): Promise<void> {
  escrever(CHAVE_SESSAO, token)
}

export async function limparToken(): Promise<void> {
  remover(CHAVE_SESSAO)
}
