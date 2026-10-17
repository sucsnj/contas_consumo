import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { limparToken, obterTokenSalvo, salvarToken } from '../db/queries/sessao'
import { ContextoAuth } from './contextoAuth'
import type { StatusAuth, ValorAuth } from './contextoAuth'
import { tokenValido } from './token'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<StatusAuth>('carregando')
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    let ativo = true

    obterTokenSalvo().then((salvo) => {
      if (!ativo) return
      if (salvo !== null && tokenValido(salvo)) {
        setToken(salvo)
        setStatus('autenticado')
        return
      }
      if (salvo !== null) void limparToken()
      setStatus('nao-autenticado')
    })

    return () => {
      ativo = false
    }
  }, [])

  const entrar = useCallback((novoToken: string) => {
    if (!tokenValido(novoToken)) return false

    setToken(novoToken)
    setStatus('autenticado')
    void salvarToken(novoToken)
    return true
  }, [])

  const sair = useCallback(() => {
    setToken(null)
    setStatus('nao-autenticado')
    void limparToken()
  }, [])

  const valor: ValorAuth = useMemo(
    () => ({ status, token, entrar, sair }),
    [status, token, entrar, sair],
  )

  return <ContextoAuth.Provider value={valor}>{children}</ContextoAuth.Provider>
}
