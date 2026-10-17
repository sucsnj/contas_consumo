import { useContext } from 'react'
import { ContextoAuth } from './contextoAuth'
import type { ValorAuth } from './contextoAuth'

export function useAuth(): ValorAuth {
  const contexto = useContext(ContextoAuth)
  if (contexto === null) {
    throw new Error('useAuth precisa estar dentro de AuthProvider')
  }
  return contexto
}
