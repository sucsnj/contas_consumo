import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { criarEstadoInicial } from '../lib/calc/engine.ts'
import { abrirRepositorio } from './repositorio.ts'
import type { Repositorio } from './repositorio.ts'
import { criarServidor } from './servidor.ts'
import type { Movimento } from '../types/domain.ts'

const TOKEN = 'segredo'

interface Contexto {
  repositorio: Repositorio
  servidor: Server
  base: string
}

async function iniciar(tokenEsperado: string | null): Promise<Contexto> {
  const repositorio = abrirRepositorio(':memory:')
  const servidor = criarServidor({
    repositorio,
    tokenEsperado,
    diretorioEstatico: 'diretorio-inexistente',
  })

  await new Promise<void>((resolver) => servidor.listen(0, '127.0.0.1', () => resolver()))
  const { port } = servidor.address() as AddressInfo

  return { repositorio, servidor, base: `http://127.0.0.1:${port}` }
}

async function encerrar(contexto: Contexto): Promise<void> {
  contexto.servidor.closeAllConnections()
  await new Promise<void>((resolver) => contexto.servidor.close(() => resolver()))
  contexto.repositorio.fechar()
}

function autorizado(extras: Record<string, string> = {}): Record<string, string> {
  return { Authorization: `Bearer ${TOKEN}`, ...extras }
}

const movimento: Movimento = {
  id: 'mov-1',
  tipo: 'ajuste',
  campo: 'saldo',
  valor: 10,
  em: '2026-01-01T00:00:00.000Z',
  antes: criarEstadoInicial(),
  depois: criarEstadoInicial(),
}

describe('API HTTP', () => {
  let contexto: Contexto

  beforeEach(async () => {
    contexto = await iniciar(TOKEN)
  })

  afterEach(async () => {
    await encerrar(contexto)
  })

  it('valida o token no servidor', async () => {
    const valido = await fetch(`${contexto.base}/api/sessao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: TOKEN }),
    })
    expect(valido.status).toBe(204)

    const invalido = await fetch(`${contexto.base}/api/sessao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'errado' }),
    })
    expect(invalido.status).toBe(401)
  })

  it('exige o bearer em todas as rotas de dados', async () => {
    const semToken = await fetch(`${contexto.base}/api/estado`)
    expect(semToken.status).toBe(401)

    const comToken = await fetch(`${contexto.base}/api/estado`, { headers: autorizado() })
    expect(comToken.status).toBe(200)
    expect(await comToken.json()).toBeNull()
  })

  it('grava e le o estado', async () => {
    const estado = { saldo: 10, saldo2: 20, reserva: 30, porcentagem1: 0.4 }
    const gravar = await fetch(`${contexto.base}/api/estado`, {
      method: 'PUT',
      headers: autorizado({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(estado),
    })
    expect(gravar.status).toBe(204)

    const ler = await fetch(`${contexto.base}/api/estado`, { headers: autorizado() })
    expect(await ler.json()).toEqual(estado)
  })

  it('rejeita estado invalido', async () => {
    const resposta = await fetch(`${contexto.base}/api/estado`, {
      method: 'PUT',
      headers: autorizado({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ saldo: 'dez' }),
    })
    expect(resposta.status).toBe(400)
  })

  it('rejeita JSON invalido', async () => {
    const resposta = await fetch(`${contexto.base}/api/estado`, {
      method: 'PUT',
      headers: autorizado({ 'Content-Type': 'application/json' }),
      body: '{invalido',
    })
    expect(resposta.status).toBe(400)
  })

  it('rejeita corpo acima do limite', async () => {
    const resposta = await fetch(`${contexto.base}/api/estado`, {
      method: 'PUT',
      headers: autorizado({ 'Content-Type': 'application/json' }),
      body: `{${'1'.repeat(1024 * 1024 + 10)}}`,
    })
    expect(resposta.status).toBe(413)
  })

  it('substitui os estados de backup', async () => {
    const estados = [
      { id: 'a', em: '2026-01-01T00:00:00.000Z', rotulo: 'Entrada', estado: criarEstadoInicial() },
    ]
    const gravar = await fetch(`${contexto.base}/api/estados`, {
      method: 'PUT',
      headers: autorizado({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(estados),
    })
    expect(gravar.status).toBe(204)

    const ler = await fetch(`${contexto.base}/api/estados`, { headers: autorizado() })
    expect(await ler.json()).toEqual(estados)
  })

  it('registra, lista e limpa movimentos', async () => {
    const registrar = await fetch(`${contexto.base}/api/movimentos`, {
      method: 'POST',
      headers: autorizado({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(movimento),
    })
    expect(registrar.status).toBe(201)

    const listar = await fetch(`${contexto.base}/api/movimentos`, { headers: autorizado() })
    expect(await listar.json()).toEqual([movimento])

    const limpar = await fetch(`${contexto.base}/api/movimentos`, {
      method: 'DELETE',
      headers: autorizado(),
    })
    expect(limpar.status).toBe(204)

    const vazio = await fetch(`${contexto.base}/api/movimentos`, { headers: autorizado() })
    expect(await vazio.json()).toEqual([])
  })

  it('responde 503 quando o servidor nao tem token configurado', async () => {
    const semToken = await iniciar(null)

    try {
      const resposta = await fetch(`${semToken.base}/api/sessao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'qualquer' }),
      })
      expect(resposta.status).toBe(503)
    } finally {
      await encerrar(semToken)
    }
  })
})
