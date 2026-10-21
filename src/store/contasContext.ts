import { createContext } from 'react'
import type { Dispatch } from 'react'
import type { Acao, AppState } from './reducer'

export type Despachar = Dispatch<Acao>
export type StatusDados = 'carregando' | 'pronto' | 'erro'

export interface ValorContas {
  estado: AppState
  despachar: Despachar
  status: StatusDados
}

export const ContasContext = createContext<ValorContas | null>(null)
