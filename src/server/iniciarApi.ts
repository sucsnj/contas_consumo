import { join } from 'node:path'
import { abrirRepositorio } from './repositorio.ts'
import { criarServidor } from './servidor.ts'

export interface ApiIniciada {
  host: string
  porta: number
  caminhoBanco: string
  fechar: () => Promise<void>
}

function lerToken(): string | null {
  if (process.env.BEARER_TOKEN === undefined && process.env.VITE_BEARER_TOKEN !== undefined) {
    console.warn('[contas] usando VITE_BEARER_TOKEN; renomeie para BEARER_TOKEN no .env.')
  }

  const token = (process.env.BEARER_TOKEN ?? process.env.VITE_BEARER_TOKEN ?? '').trim()

  if (token === '') {
    console.warn('[contas] BEARER_TOKEN nao definido: a API recusara todas as requisicoes.')
    return null
  }

  return token
}

function lerPorta(): number {
  const porta = Number(process.env.PORT ?? 4173)

  if (!Number.isInteger(porta) || porta < 1 || porta > 65535) {
    throw new Error(`PORT invalida: ${process.env.PORT ?? ''}`)
  }

  return porta
}

export async function iniciarApi(): Promise<ApiIniciada> {
  const host = process.env.HOST ?? '127.0.0.1'
  const porta = lerPorta()
  const caminhoBanco = process.env.DB_PATH ?? join(process.cwd(), 'contas.db')
  const repositorio = abrirRepositorio(caminhoBanco)
  const servidor = criarServidor({
    repositorio,
    tokenEsperado: lerToken(),
    diretorioEstatico: join(process.cwd(), 'dist'),
  })

  try {
    await new Promise<void>((resolver, rejeitar) => {
      servidor.once('error', rejeitar)
      servidor.listen(porta, host, () => {
        servidor.off('error', rejeitar)
        resolver()
      })
    })
  } catch (erro) {
    repositorio.fechar()
    throw erro
  }

  console.log(`[contas] disponivel em http://${host}:${porta}`)
  console.log(`[contas] banco de dados: ${caminhoBanco}`)

  return {
    host,
    porta,
    caminhoBanco,
    fechar: () =>
      new Promise<void>((resolver) => {
        servidor.close(() => {
          repositorio.fechar()
          resolver()
        })
      }),
  }
}
