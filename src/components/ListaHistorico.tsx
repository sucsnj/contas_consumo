import { ArrowDownCircle, ArrowUpCircle, Percent, RotateCcw, Sliders } from 'lucide-react'
import { formatarMoeda } from '../lib/calc/format'
import type { Movimento, MovimentoTipo } from '../types/domain'

const ROTULO: Record<MovimentoTipo, string> = {
  entrada: 'Entrada na conta 1',
  entrada2: 'Entrada na conta 2',
  'pagamento-saldo': 'Pagamento do saldo',
  'pagamento-reserva': 'Pagamento da reserva',
  'pagamento-saldo2': 'Pagamento do saldo2',
  ajuste: 'Ajuste manual',
  reversao: 'Reversão',
}

function IconeMovimento({ tipo }: { tipo: MovimentoTipo }) {
  switch (tipo) {
    case 'entrada':
    case 'entrada2':
      return <ArrowDownCircle size={18} />
    case 'pagamento-saldo':
    case 'pagamento-reserva':
    case 'pagamento-saldo2':
      return <ArrowUpCircle size={18} />
    case 'ajuste':
      return <Sliders size={18} />
    case 'reversao':
      return <RotateCcw size={18} />
  }
}

function corMovimento(movimento: Movimento): string {
  if (movimento.tipo === 'pagamento-saldo' || movimento.tipo === 'pagamento-reserva' || movimento.tipo === 'pagamento-saldo2') {
    return 'valor-vermelho'
  }
  if (movimento.tipo === 'reversao') return 'valor-amarelo'
  if (movimento.tipo === 'ajuste') return 'valor-cinza'
  return 'valor-verde'
}

export function ListaHistorico({ movimentos }: { movimentos: Movimento[] }) {
  const recentes = [...movimentos].reverse().slice(0, 8)

  return (
    <section className="card">
      <h2 className="card-title">
        <Percent size={16} /> Movimentos
      </h2>

      {recentes.length === 0 ? (
        <p className="vazio">Nenhum movimento registrado ainda.</p>
      ) : (
        <ul className="historico-lista">
          {recentes.map((movimento) => (
            <li key={movimento.id} className="historico-item">
              <span className="historico-desc">
                <IconeMovimento tipo={movimento.tipo} />
                <span>
                  <span className="historico-titulo">{ROTULO[movimento.tipo]}</span>
                  <span className="historico-meta">
                    {new Date(movimento.em).toLocaleString('pt-BR')} - total{' '}
                    {formatarMoeda(movimento.depois.saldo + movimento.depois.saldo2)}
                  </span>
                </span>
              </span>
              <span className={`historico-valor ${corMovimento(movimento)}`}>
                {movimento.tipo.startsWith('pagamento') ? '-' : ''}
                {formatarMoeda(movimento.valor)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="historico-total">Total de movimentos: {movimentos.length}</p>
    </section>
  )
}