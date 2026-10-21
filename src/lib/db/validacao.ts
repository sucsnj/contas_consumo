import type { ContasState, EstadoHistorico, Movimento, MovimentoTipo } from '../../types/domain.ts'

const CAMPOS_VALIDOS = ['saldo', 'saldo2', 'reserva', 'porcentagem1'] as const

const TIPOS_MOVIMENTO: readonly MovimentoTipo[] = [
  'entrada',
  'entrada2',
  'pagamento-saldo',
  'pagamento-reserva',
  'pagamento-saldo2',
  'devolucao',
  'ajuste',
  'reversao',
]

interface EstadoAntigo {
  valorReserva?: unknown
  valorAtual?: unknown
  valorDisponivelConta2?: unknown
  percentual?: unknown
}

function numero(valor: unknown): number | null {
  return typeof valor === 'number' && Number.isFinite(valor) ? valor : null
}

function objeto(dados: unknown): Record<string, unknown> | null {
  if (typeof dados !== 'object' || dados === null) return null
  return dados as Record<string, unknown>
}

export function validarContas(dados: unknown): ContasState | null {
  const registro = objeto(dados)
  if (registro === null) return null

  const saldo = numero(registro.saldo)
  const saldo2 = numero(registro.saldo2)
  const reserva = numero(registro.reserva)
  const porcentagem1 = numero(registro.porcentagem1)
  const emprestado = registro.emprestado === undefined ? 0 : numero(registro.emprestado)

  if (
    saldo === null ||
    saldo2 === null ||
    reserva === null ||
    porcentagem1 === null ||
    emprestado === null
  ) {
    return null
  }

  return { saldo, saldo2, reserva, porcentagem1, emprestado }
}

export function migrarContasAntigas(dados: unknown): ContasState | null {
  const registro = objeto(dados)
  if (registro === null) return null

  const antigo = registro as EstadoAntigo
  const reserva = numero(antigo.valorReserva)
  const saldo = numero(antigo.valorAtual)
  const saldo2 = numero(antigo.valorDisponivelConta2)
  const porcentagem1 = numero(antigo.percentual)

  if (reserva === null || saldo === null || saldo2 === null || porcentagem1 === null) {
    return null
  }

  return {
    saldo,
    saldo2,
    reserva,
    porcentagem1: porcentagem1 >= 0 && porcentagem1 <= 1 ? porcentagem1 : 0.3,
    emprestado: 0,
  }
}

export function validarMovimento(dados: unknown): Movimento | null {
  const registro = objeto(dados)
  if (registro === null) return null

  if (typeof registro.id !== 'string' || registro.id === '') return null
  if (!TIPOS_MOVIMENTO.includes(registro.tipo as MovimentoTipo)) return null
  if (typeof registro.em !== 'string') return null

  const campo = registro.campo
  if (campo !== null && !CAMPOS_VALIDOS.includes(campo as (typeof CAMPOS_VALIDOS)[number])) {
    return null
  }

  const valor = numero(registro.valor)
  const antes = validarContas(registro.antes)
  const depois = validarContas(registro.depois)

  if (valor === null || antes === null || depois === null) return null

  return {
    id: registro.id,
    tipo: registro.tipo as MovimentoTipo,
    campo: campo as Movimento['campo'],
    valor,
    em: registro.em,
    antes,
    depois,
  }
}

export function validarEstadoHistorico(dados: unknown): EstadoHistorico | null {
  const registro = objeto(dados)
  if (registro === null) return null

  if (typeof registro.id !== 'string' || registro.id === '') return null
  if (typeof registro.em !== 'string') return null
  if (typeof registro.rotulo !== 'string') return null

  const estado = validarContas(registro.estado)
  if (estado === null) return null

  return { id: registro.id, em: registro.em, rotulo: registro.rotulo, estado }
}
