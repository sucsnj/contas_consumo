import { CheckCircle2, CreditCard, HandCoins, Landmark, PiggyBank, Wallet } from 'lucide-react'
import {
  arredondarMoeda,
  devolucaoPossivel,
  pagamentoValido,
  previaEntrada,
  reservaNecessaria,
  saldoAposPagamento,
  valorDevolucao,
} from '../lib/calc/engine'
import { formatarMoeda, formatarPercentual } from '../lib/calc/format'
import { useExpressao } from '../hooks/useExpressao'
import { useContas } from '../store/useContas'
import type { DestinoPagamento } from '../types/domain'
import { CampoValor } from './CampoValor'

export function EntradaCalculo() {
  const { estado, despachar } = useContas()
  const { texto, resultado, alterar, limpar } = useExpressao()

  const { contas } = estado
  const entradaValida = resultado !== null && resultado >= contas.reserva
  const previa = resultado !== null && entradaValida ? previaEntrada(contas, resultado) : null

  const reservaParaSaldo = resultado !== null ? reservaNecessaria(contas, resultado) : 0
  const usaReserva = resultado !== null && reservaParaSaldo > 0
  const saldoPagavel = resultado !== null && pagamentoValido(contas, 'saldo', resultado)
  const emprestadoPrevisto = arredondarMoeda(contas.emprestado - reservaParaSaldo)

  const devolver = valorDevolucao(contas)
  const podeDevolver = devolucaoPossivel(contas)

  function confirmar() {
    if (!entradaValida || resultado === null) return
    despachar({ tipo: 'confirmarEntrada', entrada: resultado })
    limpar()
  }

  function pagarDestino(destino: DestinoPagamento) {
    if (resultado === null) return
    despachar({ tipo: 'pagar', destino, valor: resultado })
    limpar()
  }

  function confirmarDevolucao() {
    if (!podeDevolver) return
    despachar({ tipo: 'devolver' })
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
        <div className="pagamentos-rapidos">
          <p className="pagamentos-rapidos-titulo">Pagar {formatarMoeda(resultado)}</p>
          <div className="acoes-conta">
            <BotaoPagamento
              destino="saldo"
              rotulo="Pagar saldo"
              icone={<Landmark size={16} />}
              valor={resultado}
              onPagar={pagarDestino}
              desabilitado={!saldoPagavel}
            />
            <BotaoPagamento
              destino="reserva"
              rotulo="Pagar reserva"
              icone={<PiggyBank size={16} />}
              valor={resultado}
              onPagar={pagarDestino}
            />
            <BotaoPagamento
              destino="saldo2"
              rotulo="Pagar saldo2"
              icone={<CreditCard size={16} />}
              valor={resultado}
              onPagar={pagarDestino}
            />
          </div>
          {usaReserva ? (
            saldoPagavel ? (
              <p className="campo-dica">
                A reserva cobre {formatarMoeda(reservaParaSaldo)} e fica com{' '}
                {formatarMoeda(contas.reserva - reservaParaSaldo)}. Emprestado:{' '}
                {formatarMoeda(emprestadoPrevisto)}.
              </p>
            ) : (
              <p className="aviso-erro">
                A reserva não cobre {formatarMoeda(reservaParaSaldo)} (tem{' '}
                {formatarMoeda(contas.reserva)}). O pagamento do saldo não será realizado.
              </p>
            )
          ) : null}
        </div>
      ) : null}

      <div className="pagamentos-rapidos">
        <p className="pagamentos-rapidos-titulo">Empréstimo da reserva</p>
        <div className="acoes-conta">
          <button
            type="button"
            className="btn btn-success"
            disabled={!podeDevolver}
            onClick={confirmarDevolucao}
          >
            <HandCoins size={16} />
            <span>Devolução</span>
            <span className="btn-saldo-restante">{formatarMoeda(devolver)}</span>
          </button>
        </div>
        <p className={contas.emprestado >= 0 || podeDevolver ? 'campo-dica' : 'aviso-erro'}>
          {contas.emprestado >= 0
            ? 'Sem empréstimo a devolver.'
            : podeDevolver
              ? `Devolve ${formatarMoeda(devolver)} do saldo para a reserva. Emprestado fica com ${formatarMoeda(
                  arredondarMoeda(contas.emprestado + devolver),
                )}.`
              : 'Saldo zerado: não há valor para devolver.'}
        </p>
      </div>
    </section>
  )
}

interface BotaoPagamentoProps {
  destino: DestinoPagamento
  rotulo: string
  icone: React.ReactNode
  valor: number
  onPagar: (destino: DestinoPagamento) => void
  desabilitado?: boolean
}

function BotaoPagamento({
  destino,
  rotulo,
  icone,
  valor,
  onPagar,
  desabilitado = false,
}: BotaoPagamentoProps) {
  const { estado } = useContas()
  const restante = saldoAposPagamento(estado.contas, destino, valor)
  const usaReserva = destino === 'saldo' && valor > estado.contas.saldo
  const negativo = restante < 0 || usaReserva

  return (
    <button
      type="button"
      className={negativo ? 'btn btn-danger btn-negativo' : 'btn btn-danger'}
      disabled={desabilitado}
      onClick={() => onPagar(destino)}
    >
      {icone}
      <span>{rotulo}</span>
      <span className="btn-saldo-restante">{formatarMoeda(restante)}</span>
    </button>
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
