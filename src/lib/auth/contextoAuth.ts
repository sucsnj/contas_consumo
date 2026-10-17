import { createContext } from 'react'

export type StatusAuth = 'carregando' | 'nao-autenticado' | 'autenticado'

export interface ValorAuth {
  status: StatusAuth
  token: string | null
  entrar: (token: string) => boolean
  sair: () => void
}

export const ContextoAuth = createContext<ValorAuth | null>(null)
