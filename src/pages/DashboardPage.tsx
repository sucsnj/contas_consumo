import { PiggyBank, RotateCcw, TrendingUp, Wallet } from 'lucide-react'
import { CartaoConta } from '../components/CartaoConta'
import { CartaoResumo } from '../components/CartaoResumo'
import { ConfiguracaoPercentual } from '../components/ConfiguracaoPercentual'
import { ListaHistorico } from '../components/ListaHistorico'
import { tomSituacao } from '../lib/situacao'
import { useContas } from '../store/useContas'

export function DashboardPage() {
  const { estado, despachar, status } = useContas()
  const { contas } = estado

  function reiniciar() {
    if (window.confirm('Zerar os saldos e apagar o histórico?')) {
      despachar({ tipo: 'reiniciar' })
    }
  }

  if (status === 'carregando') {
    return (
      <div className="app-shell">
        <main className="app-main">
          <p className="vazio">Carregando dados...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <main className="app-main">
        <header className="page-header">
          <div>
            <h1 className="app-title">Contas</h1>
            <p className="page-subtitle">Controle de saldos com divisão por percentual</p>
          </div>
          <div className="header-actions">
            <ConfiguracaoPercentual />
            <button type="button" className="btn btn-outline" onClick={reiniciar}>
              <RotateCcw size={16} />
              Reiniciar
            </button>
          </div>
        </header>

        <section className="resumo-grid">
          <CartaoResumo
            rotulo="Total das contas"
            valor={contas.totalContas}
            tom={tomSituacao(contas.totalContas)}
            icone={<Wallet size={14} />}
          />
          <CartaoResumo
            rotulo="Valor atual"
            valor={contas.valorAtual}
            tom="azul"
            icone={<TrendingUp size={14} />}
          />
          <CartaoResumo
            rotulo="Reserva"
            valor={contas.valorReserva}
            tom="amarelo"
            icone={<PiggyBank size={14} />}
          />
        </section>

        <section className="contas-grid">
          <CartaoConta conta={1} />
          <CartaoConta conta={2} />
        </section>

        <ListaHistorico movimentos={estado.movimentos} />
      </main>
    </div>
  )
}
