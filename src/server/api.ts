import { timingSafeEqual } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Repositorio } from './repositorio.ts'
import { validarContas, validarEstadoHistorico, validarMovimento } from '../lib/db/validacao.ts'

const LIMITE_CORPO = 1024 * 1024

export interface OpcoesApi {
  repositorio: Repositorio
  tokenEsperado: string | null
}

class ErroRequisicao extends Error {
  status: number

  constructor(status: number, mensagem: string) {
    super(mensagem)
    this.name = 'ErroRequisicao'
    this.status = status
  }
}

function enviarJson(res: ServerResponse, status: number, dados: unknown): void {
  const corpo = JSON.stringify(dados)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  res.end(corpo)
}

function enviarVazio(res: ServerResponse, status: number): void {
  res.writeHead(status, { 'Cache-Control': 'no-store' })
  res.end()
}

function lerCorpo(req: IncomingMessage): Promise<string> {
  return new Promise((resolver, rejeitar) => {
    const partes: Buffer[] = []
    let total = 0
    let excedeu = false

    req.on('data', (parte: Buffer) => {
      if (excedeu) return
      total += parte.length
      if (total > LIMITE_CORPO) {
        excedeu = true
        partes.length = 0
        rejeitar(new ErroRequisicao(413, 'corpo da requisicao excede o limite'))
        return
      }
      partes.push(parte)
    })

    req.on('end', () => {
      if (!excedeu) resolver(Buffer.concat(partes).toString('utf8'))
    })
    req.on('error', (erro) => {
      if (!excedeu) rejeitar(erro)
    })
  })
}

async function lerJson(req: IncomingMessage): Promise<unknown> {
  const corpo = await lerCorpo(req)
  if (corpo.trim() === '') return null

  try {
    return JSON.parse(corpo) as unknown
  } catch {
    throw new ErroRequisicao(400, 'JSON invalido')
  }
}

function compararToken(recebido: string, esperado: string): boolean {
  const a = Buffer.from(recebido)
  const b = Buffer.from(esperado)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

function autorizacaoValida(req: IncomingMessage, esperado: string): boolean {
  const cabecalho = req.headers.authorization
  if (typeof cabecalho !== 'string') return false

  const [esquema, token] = cabecalho.split(' ')
  if (esquema === undefined || token === undefined) return false
  if (esquema.toLowerCase() !== 'bearer') return false

  return compararToken(token, esperado)
}

function tokenDoCorpo(corpo: unknown): string | null {
  if (typeof corpo !== 'object' || corpo === null) return null
  const token = (corpo as Record<string, unknown>).token
  return typeof token === 'string' ? token.trim() : null
}

function responderErro(res: ServerResponse, erro: unknown): true {
  if (erro instanceof ErroRequisicao) {
    enviarJson(res, erro.status, { erro: erro.message })
    return true
  }

  console.error('[contas] erro na API', erro)
  enviarJson(res, 500, { erro: 'erro interno' })
  return true
}

export async function tratarApi(
  req: IncomingMessage,
  res: ServerResponse,
  opcoes: OpcoesApi,
): Promise<boolean> {
  const caminho = new URL(req.url ?? '/', 'http://localhost').pathname
  if (!caminho.startsWith('/api/')) return false

  const { repositorio, tokenEsperado } = opcoes
  const metodo = req.method ?? 'GET'

  if (caminho === '/api/sessao' && metodo === 'POST') {
    if (tokenEsperado === null) {
      enviarJson(res, 503, { erro: 'BEARER_TOKEN nao configurado no servidor' })
      return true
    }

    try {
      const token = tokenDoCorpo(await lerJson(req))
      if (token === null || !compararToken(token, tokenEsperado)) {
        enviarJson(res, 401, { erro: 'token invalido' })
        return true
      }

      enviarVazio(res, 204)
      return true
    } catch (erro) {
      return responderErro(res, erro)
    }
  }

  if (tokenEsperado === null) {
    enviarJson(res, 503, { erro: 'BEARER_TOKEN nao configurado no servidor' })
    return true
  }

  if (!autorizacaoValida(req, tokenEsperado)) {
    enviarJson(res, 401, { erro: 'token invalido' })
    return true
  }

  try {
    if (caminho === '/api/estado' && metodo === 'GET') {
      enviarJson(res, 200, repositorio.lerEstado())
      return true
    }

    if (caminho === '/api/estado' && metodo === 'PUT') {
      const estado = validarContas(await lerJson(req))
      if (estado === null) {
        enviarJson(res, 400, { erro: 'estado invalido' })
        return true
      }
      repositorio.salvarEstado(estado)
      enviarVazio(res, 204)
      return true
    }

    if (caminho === '/api/estados' && metodo === 'GET') {
      enviarJson(res, 200, repositorio.lerEstados())
      return true
    }

    if (caminho === '/api/estados' && metodo === 'PUT') {
      const corpo = await lerJson(req)
      if (!Array.isArray(corpo)) {
        enviarJson(res, 400, { erro: 'lista de estados invalida' })
        return true
      }

      const estados = corpo.map(validarEstadoHistorico)
      if (estados.some((registro) => registro === null)) {
        enviarJson(res, 400, { erro: 'lista de estados invalida' })
        return true
      }

      repositorio.substituirEstados(estados.filter((registro) => registro !== null))
      enviarVazio(res, 204)
      return true
    }

    if (caminho === '/api/movimentos' && metodo === 'GET') {
      enviarJson(res, 200, repositorio.lerMovimentos())
      return true
    }

    if (caminho === '/api/movimentos' && metodo === 'POST') {
      const movimento = validarMovimento(await lerJson(req))
      if (movimento === null) {
        enviarJson(res, 400, { erro: 'movimento invalido' })
        return true
      }
      repositorio.adicionarMovimento(movimento)
      enviarVazio(res, 201)
      return true
    }

    if (caminho === '/api/movimentos' && metodo === 'DELETE') {
      repositorio.limparMovimentos()
      enviarVazio(res, 204)
      return true
    }
  } catch (erro) {
    return responderErro(res, erro)
  }

  enviarJson(res, 404, { erro: 'rota nao encontrada' })
  return true
}
