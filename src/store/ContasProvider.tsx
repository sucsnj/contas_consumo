import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { obterEstado, persistirEstado } from '../lib/db/queries/estado'
import { obterEstados, persistirEstados } from '../lib/db/queries/estados'
import { obterMovimentos, registrarMovimento } from '../lib/db/queries/movimentos'
import { ContasContext } from './contasContext'
import type { StatusDados, ValorContas } from './contasContext'
import { ESTADO_INICIAL, reducerContas } from './reducer'
import type { ContasState, EstadoHistorico } from '../types/domain'

interface ContasProviderProps {
  children: ReactNode
}

export function ContasProvider({ children }: ContasProviderProps) {
  const [estado, despachar] = useReducer(reducerContas, ESTADO_INICIAL)
  const [status, setStatus] = useState<StatusDados>('carregando')
  const contasSalvas = useRef<ContasState | null>(null)
  const estadosSalvos = useRef<EstadoHistorico[] | null>(null)
  const ultimoMovimentoSalvo = useRef<string | null>(null)

  useEffect(() => {
    let ativo = true

    Promise.all([obterEstado(), obterMovimentos(), obterEstados()]).then(
      ([contas, movimentos, estados]) => {
        if (!ativo) return
        despachar({
          tipo: 'hidratar',
          contas: contas ?? ESTADO_INICIAL.contas,
          movimentos,
          estados,
        })
        ultimoMovimentoSalvo.current = movimentos.at(-1)?.id ?? null
        setStatus('pronto')
      },
    )

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

    if (estadosSalvos.current !== estado.estados) {
      estadosSalvos.current = estado.estados
      void persistirEstados(estado.estados)
    }

    const ultimoMovimento = estado.movimentos.at(-1)
    if (ultimoMovimento && ultimoMovimento.id !== ultimoMovimentoSalvo.current) {
      ultimoMovimentoSalvo.current = ultimoMovimento.id
      void registrarMovimento(ultimoMovimento)
    }
  }, [estado, status])

  const valor: ValorContas = useMemo(
    () => ({ estado, despachar, status }),
    [estado, status],
  )

  return <ContasContext.Provider value={valor}>{children}</ContasContext.Provider>
}