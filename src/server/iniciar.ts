import { join } from 'node:path'
import { abrirRepositorio } from './repositorio.ts'
import { criarServidor } from './servidor.ts'

const porta = Number(process.env.PORT ?? 4173)
const host = process.env.HOST ?? '127.0.0.1'
const caminhoBanco = process.env.DB_PATH ?? join(process.cwd(), 'contas.db')
const diretorioEstatico = join(process.cwd(), 'dist')

if (process.env.BEARER_TOKEN === undefined && process.env.VITE_BEARER_TOKEN !== undefined) {
  console.warn('[contas] usando VITE_BEARER_TOKEN; renomeie para BEARER_TOKEN no .env.')
}

const token = (process.env.BEARER_TOKEN ?? process.env.VITE_BEARER_TOKEN ?? '').trim()

if (token === '') {
  console.warn('[contas] BEARER_TOKEN nao definido: a API recusara todas as requisicoes.')
}

const repositorio = abrirRepositorio(caminhoBanco)
const servidor = criarServidor({
  repositorio,
  tokenEsperado: token === '' ? null : token,
  diretorioEstatico,
})

servidor.listen(porta, host, () => {
  console.log(`[contas] disponivel em http://${host}:${porta}`)
  console.log(`[contas] banco de dados: ${caminhoBanco}`)
})

let encerrando = false

function encerrar(): void {
  if (encerrando) return
  encerrando = true

  servidor.close(() => {
    repositorio.fechar()
    process.exit(0)
  })
}

process.on('SIGINT', encerrar)
process.on('SIGTERM', encerrar)
