import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { limparToken, obterTokenSalvo, salvarToken } from '../db/queries/sessao'
import { ContextoAuth } from './contextoAuth'
import type { StatusAuth, ValorAuth } from './contextoAuth'
import { verificarToken } from './token'
import type { ResultadoAutenticacao } from './token'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<StatusAuth>('carregando')
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    let ativo = true

    void (async () => {
      const salvo = await obterTokenSalvo()
      if (!ativo) return

      if (salvo !== null) {
        const resultado = await verificarToken(salvo)
        if (!ativo) return

        if (resultado === 'autenticado') {
          setToken(salvo)
          setStatus('autenticado')
          return
        }

        // Servidor fora do ar nao invalida o token: so nao da para confirmar agora.
        if (resultado !== 'servidor-indisponivel') void limparToken()
      }

      setStatus('nao-autenticado')
    })()

    return () => {
      ativo = false
    }
  }, [])

  const entrar = useCallback(async (novoToken: string): Promise<ResultadoAutenticacao> => {
    const resultado = await verificarToken(novoToken)
    if (resultado !== 'autenticado') return resultado

    const limpo = novoToken.trim()
    setToken(limpo)
    setStatus('autenticado')
    void salvarToken(limpo)
    return resultado
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
