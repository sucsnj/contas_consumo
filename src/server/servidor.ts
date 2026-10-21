import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import type { IncomingMessage, Server, ServerResponse } from 'node:http'
import { extname, join, resolve, sep } from 'node:path'
import { tratarApi } from './api.ts'
import type { Repositorio } from './repositorio.ts'

const TIPOS: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

export interface OpcoesServidor {
  repositorio: Repositorio
  tokenEsperado: string | null
  diretorioEstatico: string
}

function tipoDoArquivo(caminho: string): string {
  return TIPOS[extname(caminho).toLowerCase()] ?? 'application/octet-stream'
}

function dentroDoDiretorio(alvo: string, raiz: string): boolean {
  const prefixo = raiz.endsWith(sep) ? raiz : `${raiz}${sep}`
  return alvo.startsWith(prefixo)
}

async function servirEstatico(
  req: IncomingMessage,
  res: ServerResponse,
  raiz: string,
): Promise<void> {
  const caminhoUrl = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname)
  const relativo = caminhoUrl === '/' ? '/index.html' : caminhoUrl
  const alvo = resolve(raiz, `.${relativo}`)

  if (dentroDoDiretorio(alvo, raiz)) {
    try {
      const conteudo = await readFile(alvo)
      res.writeHead(200, {
        'Content-Type': tipoDoArquivo(alvo),
        'Cache-Control': relativo.startsWith('/assets/')
          ? 'public, max-age=31536000, immutable'
          : 'no-cache',
      })
      res.end(conteudo)
      return
    } catch {
      // arquivo inexistente: cai no fallback da SPA
    }
  }

  try {
    const index = await readFile(join(raiz, 'index.html'))
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' })
    res.end(index)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Build nao encontrado. Rode npm run build antes de iniciar o servidor.')
  }
}

export function criarServidor(opcoes: OpcoesServidor): Server {
  return createServer((req, res) => {
    void (async () => {
      try {
        const tratado = await tratarApi(req, res, {
          repositorio: opcoes.repositorio,
          tokenEsperado: opcoes.tokenEsperado,
        })
        if (tratado) return

        await servirEstatico(req, res, opcoes.diretorioEstatico)
      } catch {
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
        }
        res.end('Erro interno do servidor.')
      }
    })()
  })
}
