import { useEffect, useState } from 'react'
import { CheckCircle2, CreditCard, Landmark, PiggyBank } from 'lucide-react'
import { analisarValor, formatarMoeda, formatarPercentual } from '../lib/calc/format'
import { rotuloSituacao, tomSituacao } from '../lib/situacao'
import { useContas } from '../store/useContas'
import { useDebounce } from '../hooks/useDebounce'
import type { ContaId } from '../types/domain'
import { Badge } from './Badge'
import { CampoValor } from './CampoValor'
import { PainelPagamento } from './PainelPagamento'

const NOME_CONTA: Record<ContaId, string> = {
  1: 'Conta 1',
  2: 'Conta 2',
}

interface CartaoContaProps {
  conta: ContaId
}

export function CartaoConta({ conta }: CartaoContaProps) {
  const { estado, despachar } = useContas()
  const [textoEntrada, setTextoEntrada] = useState('')
  const [pagamentoAberto, setPagamentoAberto] = useState(false)

  const valorEntrada = useDebounce(analisarValor(textoEntrada) ?? 0)
  const previa = estado.previa !== null && estado.previa.conta === conta ? estado.previa : null

  const disponivel =
    conta === 1 ? estado.contas.valorDisponivelConta1 : estado.contas.valorDisponivelConta2

  useEffect(() => {
    despachar({ tipo: 'preverEntrada', conta, valor: valorEntrada })
  }, [conta, valorEntrada, despachar])

  function confirmarEntrada() {
    const valor = analisarValor(textoEntrada)
    if (valor === null || valor === 0) return

    despachar(
      conta === 1
        ? { tipo: 'confirmarEntradaConta1', valor }
        : { tipo: 'confirmarEntradaConta2', valor },
    )
    setTextoEntrada('')
  }

  const tom = tomSituacao(disponivel)

  return (
    <section className="card">
      <header className="conta-header">
        <h2 className="conta-nome">
          {conta === 1 ? <Landmark size={18} /> : <CreditCard size={18} />}
          {NOME_CONTA[conta]}
        </h2>
        <Badge tom={tom}>{rotuloSituacao(disponivel)}</Badge>
      </header>

      <p className="conta-saldo-rotulo">Disponível</p>
      <p className={`conta-saldo valor-${tom}`}>{formatarMoeda(disponivel)}</p>

      <div className="campo">
        <label className="campo-rotulo" htmlFor={`entrada-conta-${conta}`}>
          Entrada {conta === 1 ? '(depósito)' : '(entrada ou saída)'}
        </label>
        <CampoValor
          id={`entrada-conta-${conta}`}
          valor={textoEntrada}
          aoAlterar={setTextoEntrada}
          aoConfirmar={confirmarEntrada}
          placeholder={conta === 1 ? '0,00' : '0,00 ou -0,00'}
        />
        <p className="campo-dica">
          {conta === 1
            ? 'Somente valores positivos. A diferença com o valor atual é dividida.'
            : 'Use valores negativos para registrar saídas.'}
        </p>
      </div>

      {previa !== null && previa.valor !== 0 ? (
        <div className="previa">
          <p className="previa-titulo">Prévia</p>
          {conta === 1 ? (
            <>
              <LinhaPrevia rotulo="Diferença" valor={formatarMoeda(previa.diferenca)} />
              <LinhaPrevia
                rotulo={`Parte atual (${formatarPercentual(estado.contas.percentual)})`}
                valor={formatarMoeda(previa.valorPorcentagem1)}
              />
              <LinhaPrevia
                rotulo="Parte reserva"
                valor={formatarMoeda(previa.valorPorcentagem2)}
              />
              <LinhaPrevia rotulo="Valor atual resultante" valor={formatarMoeda(previa.valorAtual)} />
              <LinhaPrevia rotulo="Reserva resultante" valor={formatarMoeda(previa.valorReserva)} />
            </>
          ) : (
            <LinhaPrevia
              rotulo="Disponivel resultante"
              valor={formatarMoeda(previa.valorDisponivelConta2)}
            />
          )}
          <LinhaPrevia rotulo="Total resultante" valor={formatarMoeda(previa.totalContas)} />
        </div>
      ) : null}

      <div className="acoes-conta">
        <button
          type="button"
          className={`btn ${conta === 1 ? 'btn-success' : 'btn-primary'}`}
          disabled={analisarValor(textoEntrada) === null || analisarValor(textoEntrada) === 0}
          onClick={confirmarEntrada}
        >
          <CheckCircle2 size={16} />
          Registrar entrada
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => setPagamentoAberto((aberto) => !aberto)}
        >
          Pagar conta
        </button>
      </div>

      {pagamentoAberto ? (
        <div className="pagamento">
          <PainelPagamento
            conta={conta}
            nome={NOME_CONTA[conta]}
            aoConfirmar={(valor) => {
              despachar({ tipo: 'pagamento', conta, valor })
              setPagamentoAberto(false)
            }}
            aoCancelar={() => setPagamentoAberto(false)}
          />
        </div>
      ) : null}

      {conta === 1 ? (
        <p className="campo-dica conta-rodape">
          <PiggyBank size={14} /> Reserva: {formatarMoeda(estado.contas.valorReserva)}
        </p>
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
