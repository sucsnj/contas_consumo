import { useEffect, useState } from 'react'
import { LogOut, RotateCcw, ShieldCheck } from 'lucide-react'
import { Badge } from '../components/Badge'
import { BotaoDesfazer } from '../components/BotaoDesfazer'
import { Entrada2Campo } from '../components/Entrada2Campo'
import { EntradaCalculo } from '../components/EntradaCalculo'
import { HistoricoEstados } from '../components/HistoricoEstados'
import { IndicadorCarregamento } from '../components/IndicadorCarregamento'
import { ListaHistorico } from '../components/ListaHistorico'
import { ValorAjustavel } from '../components/ValorAjustavel'
import { calcularTotal } from '../lib/calc/engine'
import { formatarMoeda, formatarPercentual } from '../lib/calc/format'
import { rotuloSituacao, tomSituacao } from '../lib/situacao'
import { useAuth } from '../lib/auth/useAuth'
import { useContas } from '../store/useContas'

const JANELA_DESFAZER_MS = 5000

export function DashboardPage() {
  const { estado, despachar, status } = useContas()
  const { sair } = useAuth()
  const [desfazerVisivel, setDesfazerVisivel] = useState(false)
  const { contas } = estado

  const totalOperacoes = estado.movimentos.length

  useEffect(() => {
    if (totalOperacoes === 0) {
      setDesfazerVisivel(false)
      return
    }

    setDesfazerVisivel(true)
    const temporizador = setTimeout(() => setDesfazerVisivel(false), JANELA_DESFAZER_MS)
    return () => clearTimeout(temporizador)
  }, [totalOperacoes])

  function reiniciar() {
    if (window.confirm('Zerar os saldos e apagar o histórico?')) {
      despachar({ tipo: 'reiniciar' })
    }
  }

  function desfazer() {
    const anterior = estado.movimentos.at(-1)?.antes
    if (anterior === undefined) return
    despachar({ tipo: 'reverter', estado: anterior })
    setDesfazerVisivel(false)
  }

  if (status === 'carregando') {
    return <IndicadorCarregamento />
  }

  if (status === 'erro') {
    return (
      <div className="app-shell">
        <main className="app-main">
          <section className="card">
            <h1 className="app-title">Nao foi possivel carregar os dados</h1>
            <p className="page-subtitle">
              O servidor nao respondeu. Confira se ele esta rodando (npm run api) e recarregue a
              pagina. Nenhum dado foi alterado.
            </p>
          </section>
        </main>
      </div>
    )
  }

  const total = calcularTotal(contas)
  const tomTotal = tomSituacao(total)

  return (
    <div className="app-shell">
      <main className="app-main">
        <header className="page-header">
          <div>
            <h1 className="app-title">Contas</h1>
            <p className="page-subtitle">
              Entrada dividida entre saldo e reserva - total {formatarMoeda(total)}{' '}
              <Badge tom={tomTotal}>{rotuloSituacao(total)}</Badge>
            </p>
          </div>
          <div className="header-actions">
            <Badge tom="azul">
              <ShieldCheck size={12} /> Autenticado
            </Badge>
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
          <ValorAjustavel
            campo="saldo"
            rotulo="Saldo"
            valor={contas.saldo}
            formatar={formatarMoeda}
            tom={tomSituacao(contas.saldo)}
          />
          <ValorAjustavel
            campo="reserva"
            rotulo="Reserva"
            valor={contas.reserva}
            formatar={formatarMoeda}
            tom="amarelo"
          />
          <ValorAjustavel
            campo="saldo2"
            rotulo="Saldo 2"
            valor={contas.saldo2}
            formatar={formatarMoeda}
            tom="azul"
          />
          <ValorAjustavel
            campo="porcentagem1"
            rotulo="Porcentagem (reserva)"
            valor={contas.porcentagem1}
            formatar={formatarPercentual}
            tom="cinza"
          />
        </section>

        <section className="grid-2">
          <EntradaCalculo />
          <Entrada2Campo />
        </section>

        <section className="grid-2">
          <HistoricoEstados />
          <ListaHistorico movimentos={estado.movimentos} />
        </section>

        <BotaoDesfazer visivel={desfazerVisivel} aoDesfazer={desfazer} />
      </main>
    </div>
  )
}