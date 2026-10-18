import { useEffect } from 'react'
import { CheckCircle2, CreditCard } from 'lucide-react'
import { formatarMoeda, formatarValorDigitado } from '../lib/calc/format'
import { useExpressao } from '../hooks/useExpressao'
import { useContas } from '../store/useContas'
import { CampoValor } from './CampoValor'

export function Entrada2Campo() {
  const { estado, despachar } = useContas()
  const saldo2 = estado.contas.saldo2
  const { texto, resultado, alterar, definirTexto, limpar } = useExpressao(
    formatarValorDigitado(saldo2),
  )

  useEffect(() => {
    definirTexto(formatarValorDigitado(saldo2))
  }, [saldo2, definirTexto])

  function confirmar() {
    if (resultado === null) return
    despachar({ tipo: 'confirmarEntrada2', entrada2: resultado })
    limpar()
  }

  return (
    <section className="card">
      <h2 className="card-title">
        <CreditCard size={16} /> Saldo da conta 2
      </h2>
      <p className="campo-dica">
        Digite o novo valor do saldo 2. Ele substitui o atual e o total é recalculado.
      </p>

      <div className="campo">
        <label className="campo-rotulo" htmlFor="entrada2">
          Novo saldo 2
        </label>
        <CampoValor
          id="entrada2"
          valor={texto}
          aoAlterar={alterar}
          aoConfirmar={confirmar}
          placeholder="200 ou 1000-300"
        />
        {resultado === null ? (
          texto === '' ? null : (
            <p className="expressao-resultado valor-cinza">Expressão incompleta</p>
          )
        ) : (
          <p className="expressao-resultado valor-azul">
            Saldo 2: {formatarMoeda(resultado)} - total:{' '}
            {formatarMoeda(estado.contas.saldo + resultado)}
          </p>
        )}
      </div>

      <div className="acoes-conta">
        <button
          type="button"
          className="btn btn-primary"
          disabled={resultado === null || resultado === saldo2}
          onClick={confirmar}
        >
          <CheckCircle2 size={16} />
          Confirmar
        </button>
      </div>
    </section>
  )
}