import { obterTokenSalvo } from './queries/sessao'

export class ErroApi extends Error {
  status: number

  constructor(status: number, mensagem: string) {
    super(mensagem)
    this.name = 'ErroApi'
    this.status = status
  }
}

export async function requisicao<T>(caminho: string, init?: RequestInit): Promise<T> {
  const token = await obterTokenSalvo()
  const cabecalhos = new Headers(init?.headers)

  cabecalhos.set('Accept', 'application/json')
  if (init?.body !== undefined) cabecalhos.set('Content-Type', 'application/json')
  if (token !== null && token !== '') cabecalhos.set('Authorization', `Bearer ${token}`)

  const resposta = await fetch(`/api${caminho}`, { ...init, headers: cabecalhos })

  if (!resposta.ok) {
    let mensagem = `falha na requisicao (${resposta.status})`

    try {
      const corpo = (await resposta.json()) as { erro?: unknown }
      if (typeof corpo.erro === 'string') mensagem = corpo.erro
    } catch {
      // resposta sem corpo JSON
    }

    throw new ErroApi(resposta.status, mensagem)
  }

  if (resposta.status === 204) return undefined as T

  return (await resposta.json()) as T
}
