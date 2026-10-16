import { useContext } from 'react'
import { ContasContext } from './contasContext'
import type { ValorContas } from './contasContext'

export function useContas(): ValorContas {
  const contexto = useContext(ContasContext)
  if (contexto === null) {
    throw new Error('useContas precisa estar dentro de ContasProvider')
  }
  return contexto
}
