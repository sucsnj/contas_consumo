import { CreditCard, HandCoins, Landmark, PiggyBank } from 'lucide-react'
import {
  arredondarMoeda,
  devolucaoPossivel,
  pagamentoValido,
  reservaNecessaria,
  saldoAposPagamento,
  valorDevolucao,
} from '../lib/calc/engine'
import { formatarMoeda } from '../lib/calc/format'
import { useContas } from '../store/useContas'
import type { DestinoPagamento } from '../types/domain'

interface PagamentosRapidosProps {
  valor: number
  aoConcluir: () => void
}

export function PagamentosRapidos({ valor, aoConcluir }: PagamentosRapidosProps) {
  const { estado, despachar } = useContas()
  const { contas } = estado

  const reservaParaSaldo = reservaNecessaria(contas, valor)
  const usaReserva = reservaParaSaldo > 0
  const saldoPagavel = pagamentoValido(contas, 'saldo', valor)
  const emprestadoPrevisto = arredondarMoeda(contas.emprestado - reservaParaSaldo)

  const devolver = valorDevolucao(contas)
  const podeDevolver = devolucaoPossivel(contas)

  function pagarDestino(destino: DestinoPagamento) {
    despachar({ tipo: 'pagar', destino, valor })
    aoConcluir()
  }

  function confirmarDevolucao() {
    if (!podeDevolver) return
    despachar({ tipo: 'devolver' })
    aoConcluir()
  }

  return (
    <div className="pagamentos-rapidos">
      <p className="pagamentos-rapidos-titulo">Pagar {formatarMoeda(valor)}</p>
      <div className="acoes-conta">
        <BotaoPagamento
          destino="saldo"
          rotulo="Pagar saldo"
          icone={<Landmark size={16} />}
          valor={valor}
          onPagar={pagarDestino}
          desabilitado={!saldoPagavel}
        />
        <BotaoPagamento
          destino="reserva"
          rotulo="Pagar reserva"
          icone={<PiggyBank size={16} />}
          valor={valor}
          onPagar={pagarDestino}
        />
        <BotaoPagamento
          destino="saldo2"
          rotulo="Pagar saldo2"
          icone={<CreditCard size={16} />}
          valor={valor}
          onPagar={pagarDestino}
        />
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

      {contas.emprestado < 0 ? (
        <p className={podeDevolver ? 'campo-dica' : 'aviso-erro'}>
          {podeDevolver
            ? `Devolve ${formatarMoeda(devolver)} do saldo para a reserva. Emprestado fica com ${formatarMoeda(
                arredondarMoeda(contas.emprestado + devolver),
              )}.`
            : 'Saldo zerado: não há valor para devolver.'}
        </p>
      ) : null}
    </div>
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
