import { useState } from 'react'
import type { FormEvent } from 'react'
import { KeyRound, Lock } from 'lucide-react'
import { useAuth } from '../lib/auth/useAuth'

export function LoginPage() {
  const { entrar } = useAuth()
  const [token, setToken] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando) return

    setEnviando(true)
    const resultado = await entrar(token)
    setEnviando(false)

    if (resultado === 'autenticado') return

    setErro(
      resultado === 'servidor-sem-token'
        ? 'O servidor não tem BEARER_TOKEN configurado no .env.'
        : 'Token inválido.',
    )
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

        <button type="submit" className="btn btn-primary login-botao" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
