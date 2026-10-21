import { createServer } from 'vite'
import { iniciarApi } from './iniciarApi.ts'

async function principal(): Promise<void> {
  const api = await iniciarApi()

  const vite = await createServer({
    server: {
      proxy: {
        '/api': `http://127.0.0.1:${api.porta}`,
      },
    },
  })

  await vite.listen()
  vite.printUrls()

  let encerrando = false

  async function encerrar(): Promise<void> {
    if (encerrando) return
    encerrando = true

    await vite.close()
    await api.fechar()
    process.exit(0)
  }

  process.on('SIGINT', () => void encerrar())
  process.on('SIGTERM', () => void encerrar())
}

principal().catch((erro: unknown) => {
  console.error('[contas] falha ao iniciar o modo de desenvolvimento:', erro)
  process.exit(1)
})
