import { createContext } from 'react'
import type { ResultadoAutenticacao } from './token'

export type StatusAuth = 'carregando' | 'nao-autenticado' | 'autenticado'

export interface ValorAuth {
  status: StatusAuth
  token: string | null
  entrar: (token: string) => Promise<ResultadoAutenticacao>
  sair: () => void
}

export const ContextoAuth = createContext<ValorAuth | null>(null)
