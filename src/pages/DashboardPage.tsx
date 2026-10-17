import { LogOut, PiggyBank, RotateCcw, ShieldCheck, TrendingUp, Wallet } from 'lucide-react'
import { CartaoConta } from '../components/CartaoConta'
import { CartaoResumo } from '../components/CartaoResumo'
import { ConfiguracaoPercentual } from '../components/ConfiguracaoPercentual'
import { IndicadorCarregamento } from '../components/IndicadorCarregamento'
import { ListaHistorico } from '../components/ListaHistorico'
import { Badge } from '../components/Badge'
import { useAuth } from '../lib/auth/useAuth'
import { tomSituacao } from '../lib/situacao'
import { useContas } from '../store/useContas'

export function DashboardPage() {
  const { estado, despachar, status } = useContas()
  const { sair } = useAuth()
  const { contas } = estado

  function reiniciar() {
    if (window.confirm('Zerar os saldos e apagar o histórico?')) {
      despachar({ tipo: 'reiniciar' })
    }
  }

  if (status === 'carregando') {
    return <IndicadorCarregamento />
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
            <Badge tom="azul">
              <ShieldCheck size={12} /> Autenticado
            </Badge>
            <ConfiguracaoPercentual />
            <button type="button" className="btn btn-outline" onClick={reiniciar}>
              <RotateCcw size={16} />
              Reiniciar
            </button>
            <button type="button" className="btn btn-outline" onClick={sair}>
              <LogOut size={16} />
              Sair
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
