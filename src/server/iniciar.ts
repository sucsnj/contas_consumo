import { iniciarApi } from './iniciarApi.ts'

const api = await iniciarApi()

let encerrando = false

async function encerrar(): Promise<void> {
  if (encerrando) return
  encerrando = true

  await api.fechar()
  process.exit(0)
}

process.on('SIGINT', () => void encerrar())
process.on('SIGTERM', () => void encerrar())
