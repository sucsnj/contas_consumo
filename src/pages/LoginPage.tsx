import { useState } from 'react'
import type { FormEvent } from 'react'
import { KeyRound, Lock } from 'lucide-react'
import { useAuth } from '../lib/auth/useAuth'
import { tokenConfigurado } from '../lib/auth/token'

export function LoginPage() {
  const { entrar } = useAuth()
  const [token, setToken] = useState('')
  const [erro, setErro] = useState('')

  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (entrar(token)) return
    setErro('Token inválido. Confira o valor de VITE_BEARER_TOKEN no arquivo .env.')
  }

  return (
    <div className="login">
      <form className="card login-card" onSubmit={aoEnviar}>
        <h1 className="login-titulo">
          <Lock size={18} /> Contas
        </h1>
        <p className="login-subtitulo">Informe o token de acesso para continuar.</p>

        <div className="campo">
          <label className="campo-rotulo" htmlFor="token">
            <KeyRound size={14} /> Token
          </label>
          <input
            id="token"
            className="input"
            type="password"
            autoComplete="current-password"
            value={token}
            onChange={(evento) => {
              setToken(evento.target.value)
              setErro('')
            }}
          />
        </div>

        {erro !== '' ? <p className="login-erro">{erro}</p> : null}

        <button type="submit" className="btn btn-primary login-botao">
          Entrar
        </button>

        {tokenConfigurado() ? null : (
          <p className="login-erro">VITE_BEARER_TOKEN não definido no .env.</p>
        )}
      </form>
    </div>
  )
}
