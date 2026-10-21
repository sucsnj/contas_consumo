import { DatabaseSync } from 'node:sqlite'
import { criarEstadoInicial } from '../lib/calc/engine.ts'
import { validarContas } from '../lib/db/validacao.ts'
import type { ContasState, EstadoHistorico, Movimento, MovimentoTipo } from '../types/domain.ts'

const ESQUEMA = `
CREATE TABLE IF NOT EXISTS estado (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  saldo REAL NOT NULL,
  saldo2 REAL NOT NULL,
  reserva REAL NOT NULL,
  emprestado REAL NOT NULL DEFAULT 0,
  porcentagem1 REAL NOT NULL,
  atualizado_em TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS estados_historico (
  id TEXT PRIMARY KEY,
  em TEXT NOT NULL,
  rotulo TEXT NOT NULL,
  saldo REAL NOT NULL,
  saldo2 REAL NOT NULL,
  reserva REAL NOT NULL,
  emprestado REAL NOT NULL DEFAULT 0,
  porcentagem1 REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS movimentos (
  id TEXT PRIMARY KEY,
  tipo TEXT NOT NULL,
  campo TEXT,
  valor REAL NOT NULL,
  em TEXT NOT NULL,
  antes TEXT NOT NULL,
  depois TEXT NOT NULL
);
`

export interface Repositorio {
  lerEstado(): ContasState | null
  salvarEstado(estado: ContasState): void
  lerEstados(): EstadoHistorico[]
  substituirEstados(estados: EstadoHistorico[]): void
  lerMovimentos(): Movimento[]
  adicionarMovimento(movimento: Movimento): void
  limparMovimentos(): void
  fechar(): void
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor : String(valor ?? '')
}

function lerContas(linha: Record<string, unknown>): ContasState {
  return {
    saldo: Number(linha.saldo),
    saldo2: Number(linha.saldo2),
    reserva: Number(linha.reserva),
    porcentagem1: Number(linha.porcentagem1),
    emprestado: Number(linha.emprestado),
  }
}

function lerContasJson(bruto: string): ContasState {
  try {
    return validarContas(JSON.parse(bruto)) ?? criarEstadoInicial()
  } catch {
    return criarEstadoInicial()
  }
}

function garantirColunaEmprestado(banco: DatabaseSync, tabela: string): void {
  const colunas = banco.prepare(`PRAGMA table_info(${tabela})`).all() as Array<{ name: string }>

  if (colunas.some((coluna) => coluna.name === 'emprestado')) return

  banco.exec(`ALTER TABLE ${tabela} ADD COLUMN emprestado REAL NOT NULL DEFAULT 0`)
}

export function abrirRepositorio(caminho: string): Repositorio {
  const banco = new DatabaseSync(caminho)
  // journal simples + sincronizacao completa: em repouso existe apenas um
  // arquivo .db para copiar como backup e cada gravacao vai para o disco.
  banco.exec('PRAGMA journal_mode = DELETE')
  banco.exec('PRAGMA synchronous = FULL')
  banco.exec(ESQUEMA)
  garantirColunaEmprestado(banco, 'estado')
  garantirColunaEmprestado(banco, 'estados_historico')

  const consultarEstado = banco.prepare(
    'SELECT saldo, saldo2, reserva, emprestado, porcentagem1 FROM estado WHERE id = 1',
  )
  const gravarEstado = banco.prepare(
    `INSERT INTO estado (id, saldo, saldo2, reserva, emprestado, porcentagem1, atualizado_em)
     VALUES (1, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (id) DO UPDATE SET
       saldo = excluded.saldo,
       saldo2 = excluded.saldo2,
       reserva = excluded.reserva,
       emprestado = excluded.emprestado,
       porcentagem1 = excluded.porcentagem1,
       atualizado_em = excluded.atualizado_em`,
  )

  const consultarEstados = banco.prepare(
    'SELECT id, em, rotulo, saldo, saldo2, reserva, emprestado, porcentagem1 FROM estados_historico ORDER BY rowid',
  )
  const limparEstados = banco.prepare('DELETE FROM estados_historico')
  const gravarEstadoHistorico = banco.prepare(
    `INSERT INTO estados_historico (id, em, rotulo, saldo, saldo2, reserva, emprestado, porcentagem1)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )

  const consultarMovimentos = banco.prepare(
    'SELECT id, tipo, campo, valor, em, antes, depois FROM movimentos ORDER BY rowid',
  )
  const gravarMovimento = banco.prepare(
    'INSERT INTO movimentos (id, tipo, campo, valor, em, antes, depois) VALUES (?, ?, ?, ?, ?, ?, ?)',
  )
  const apagarMovimentos = banco.prepare('DELETE FROM movimentos')

  function emTransacao(operacao: () => void): void {
    banco.exec('BEGIN')
    try {
      operacao()
      banco.exec('COMMIT')
    } catch (erro) {
      banco.exec('ROLLBACK')
      throw erro
    }
  }

  return {
    lerEstado() {
      const linha = consultarEstado.get()
      return linha === undefined ? null : lerContas(linha)
    },

    salvarEstado(estado) {
      gravarEstado.run(
        estado.saldo,
        estado.saldo2,
        estado.reserva,
        estado.emprestado,
        estado.porcentagem1,
        new Date().toISOString(),
      )
    },

    lerEstados() {
      return consultarEstados.all().map((linha) => ({
        id: texto(linha.id),
        em: texto(linha.em),
        rotulo: texto(linha.rotulo),
        estado: lerContas(linha),
      }))
    },

    substituirEstados(estados) {
      emTransacao(() => {
        limparEstados.run()
        for (const registro of estados) {
          gravarEstadoHistorico.run(
            registro.id,
            registro.em,
            registro.rotulo,
            registro.estado.saldo,
            registro.estado.saldo2,
            registro.estado.reserva,
            registro.estado.emprestado,
            registro.estado.porcentagem1,
          )
        }
      })
    },

    lerMovimentos() {
      return consultarMovimentos.all().map((linha) => ({
        id: texto(linha.id),
        tipo: texto(linha.tipo) as MovimentoTipo,
        campo: linha.campo === null ? null : (texto(linha.campo) as Movimento['campo']),
        valor: Number(linha.valor),
        em: texto(linha.em),
        antes: lerContasJson(texto(linha.antes)),
        depois: lerContasJson(texto(linha.depois)),
      }))
    },

    adicionarMovimento(movimento) {
      gravarMovimento.run(
        movimento.id,
        movimento.tipo,
        movimento.campo,
        movimento.valor,
        movimento.em,
        JSON.stringify(movimento.antes),
        JSON.stringify(movimento.depois),
      )
    },

    limparMovimentos() {
      apagarMovimentos.run()
    },

    fechar() {
      banco.close()
    },
  }
}
