import { ArrowDownCircle, ArrowUpCircle, Percent, Wallet } from 'lucide-react'
import { formatarMoeda } from '../lib/calc/format'
import type { Movimento, MovimentoTipo } from '../types/domain'
import { tomSituacao } from '../lib/situacao'

const ROTULO: Record<MovimentoTipo, string> = {
  'entrada-conta1': 'Entrada na conta 1',
  'entrada-conta2': 'Entrada na conta 2',
  'pagamento-conta1': 'Pagamento da conta 1',
  'pagamento-conta2': 'Pagamento da conta 2',
  percentual: 'Percentual alterado',
}

function IconeMovimento({ tipo }: { tipo: MovimentoTipo }) {
  switch (tipo) {
    case 'entrada-conta1':
    case 'entrada-conta2':
      return <ArrowDownCircle size={18} />
    case 'pagamento-conta1':
    case 'pagamento-conta2':
      return <ArrowUpCircle size={18} />
    case 'percentual':
      return <Percent size={18} />
  }
}

function corMovimento(movimento: Movimento): string {
  if (movimento.tipo.startsWith('entrada')) {
    return movimento.valor >= 0 ? 'valor-verde' : 'valor-vermelho'
  }
  if (movimento.tipo.startsWith('pagamento')) return 'valor-vermelho'
  return 'valor-amarelo'
}

interface ListaHistoricoProps {
  movimentos: Movimento[]
}

export function ListaHistorico({ movimentos }: ListaHistoricoProps) {
  const recentes = [...movimentos].reverse().slice(0, 8)

  return (
    <section className="card">
      <h2 className="card-title">
        <Wallet size={16} /> Histórico recente
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
                    {formatarMoeda(movimento.depois.totalContas)}
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

      <p className="historico-total">
        Total de movimentos: {movimentos.length} - total atual{' '}
        <strong className={`valor-${tomSituacao(movimentos.at(-1)?.depois.totalContas ?? 0)}`}>
          {formatarMoeda(movimentos.at(-1)?.depois.totalContas ?? 0)}
        </strong>
      </p>
    </section>
  )
}
