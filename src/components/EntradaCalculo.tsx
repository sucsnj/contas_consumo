import { CheckCircle2, Wallet } from 'lucide-react'
import { previaEntrada } from '../lib/calc/engine'
import { formatarMoeda, formatarPercentual } from '../lib/calc/format'
import { useExpressao } from '../hooks/useExpressao'
import { useContas } from '../store/useContas'
import { CampoValor } from './CampoValor'
import { PagamentosRapidos } from './PagamentosRapidos'

export function EntradaCalculo() {
  const { estado, despachar } = useContas()
  const { texto, resultado, alterar, limpar } = useExpressao()

  const { contas } = estado
  const entradaValida = resultado !== null && resultado >= contas.reserva
  const previa = resultado !== null && entradaValida ? previaEntrada(contas, resultado) : null

  function confirmar() {
    if (!entradaValida || resultado === null) return
    despachar({ tipo: 'confirmarEntrada', entrada: resultado })
    limpar()
  }

  const abaixoDoSaldo = resultado !== null && resultado < contas.reserva

  return (
    <section className="card">
      <h2 className="card-title">
        <Wallet size={16} /> Entrada na conta 1
      </h2>
      <p className="campo-dica">
        Digite o saldo que a conta 1 deve ter. A diferença é dividida em{' '}
        {formatarPercentual(contas.porcentagem1)} para a reserva e o restante para o saldo.
      </p>

      <div className="campo">
        <label className="campo-rotulo" htmlFor="entrada">
          Saldo desejado
        </label>
        <CampoValor
          id="entrada"
          valor={texto}
          aoAlterar={alterar}
          aoConfirmar={confirmar}
          placeholder="500 ou 350+150"
        />
        {resultado === null ? (
          texto === '' ? null : (
            <p className="expressao-resultado valor-cinza">Expressão incompleta</p>
          )
        ) : (
          <p className="expressao-resultado valor-azul">
            Saldo desejado: {formatarMoeda(resultado)}
          </p>
        )}
        {abaixoDoSaldo ? (
          <p className="aviso-erro">
            A entrada não pode ser menor que a reserva atual ({formatarMoeda(contas.reserva)}).
          </p>
        ) : null}
      </div>

      {previa !== null ? (
        <div className="previa">
          <p className="previa-titulo">Prévia</p>
          <LinhaPrevia rotulo="Diferença" valor={formatarMoeda(previa.diferenca)} />
          <LinhaPrevia
            rotulo={`Parte reserva (${formatarPercentual(contas.porcentagem1)})`}
            valor={formatarMoeda(previa.porcentagemReserva)}
          />
          <LinhaPrevia
            rotulo={`Parte saldo (${formatarPercentual(previa.porcentagem2)})`}
            valor={formatarMoeda(previa.porcentagemSaldo)}
          />
          <LinhaPrevia rotulo="Saldo resultante" valor={formatarMoeda(previa.novoSaldo)} />
          <LinhaPrevia rotulo="Reserva resultante" valor={formatarMoeda(previa.novoReserva)} />
          <LinhaPrevia rotulo="Total resultante" valor={formatarMoeda(previa.total)} />
        </div>
      ) : null}

      <div className="acoes-conta">
        <button type="button" className="btn btn-success" disabled={!entradaValida} onClick={confirmar}>
          <CheckCircle2 size={16} />
          Confirmar entrada
        </button>
      </div>

      {resultado !== null && resultado > 0 ? (
        <PagamentosRapidos valor={resultado} aoConcluir={limpar} />
      ) : null}
    </section>
  )
}

interface LinhaPreviaProps {
  rotulo: string
  valor: string
}

function LinhaPrevia({ rotulo, valor }: LinhaPreviaProps) {
  return (
    <div className="previa-linha">
      <span>{rotulo}</span>
      <span>{valor}</span>
    </div>
  )
}
