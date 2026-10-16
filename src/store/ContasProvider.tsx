import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { obterEstado, persistirEstado } from '../lib/db/queries/estado'
import { limparHistorico, obterHistorico, registrarMovimento } from '../lib/db/queries/historico'
import { ContasContext } from './contasContext'
import type { StatusDados, ValorContas } from './contasContext'
import { ESTADO_INICIAL, reducerContas } from './reducer'
import type { ContasState } from '../types/domain'

interface ContasProviderProps {
  children: ReactNode
}

export function ContasProvider({ children }: ContasProviderProps) {
  const [estado, despachar] = useReducer(reducerContas, ESTADO_INICIAL)
  const [status, setStatus] = useState<StatusDados>('carregando')
  const contasSalvas = useRef<ContasState | null>(null)
  const ultimoMovimentoSalvo = useRef<string | null>(null)
  const tamanhoAnterior = useRef(0)

  useEffect(() => {
    let ativo = true

    Promise.all([obterEstado(), obterHistorico()]).then(([contas, movimentos]) => {
      if (!ativo) return
      despachar({
        tipo: 'hidratar',
        contas: contas ?? ESTADO_INICIAL.contas,
        movimentos,
      })
      ultimoMovimentoSalvo.current = movimentos.at(-1)?.id ?? null
      tamanhoAnterior.current = movimentos.length
      setStatus('pronto')
    })

    return () => {
      ativo = false
    }
  }, [])

  useEffect(() => {
    if (status !== 'pronto') return

    if (contasSalvas.current !== estado.contas) {
      contasSalvas.current = estado.contas
      void persistirEstado(estado.contas)
    }

    const ultimoMovimento = estado.movimentos.at(-1)
    if (ultimoMovimento && ultimoMovimento.id !== ultimoMovimentoSalvo.current) {
      ultimoMovimentoSalvo.current = ultimoMovimento.id
      void registrarMovimento(ultimoMovimento)
    }

    if (estado.movimentos.length === 0 && tamanhoAnterior.current > 0) {
      tamanhoAnterior.current = 0
      void limparHistorico()
    } else {
      tamanhoAnterior.current = estado.movimentos.length
    }
  }, [estado, status])

  const valor: ValorContas = useMemo(
    () => ({ estado, despachar, status }),
    [estado, status],
  )

  return <ContasContext.Provider value={valor}>{children}</ContasContext.Provider>
}
