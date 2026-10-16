import { formatarMoeda } from './lib/calc/format'
import { ContasProvider } from './store/ContasProvider'
import { useContas } from './store/useContas'

function Resumo() {
  const { estado, status } = useContas()

  return (
    <div className="card">
      <p>Dados: {status}</p>
      <p>Total das contas: {formatarMoeda(estado.contas.totalContas)}</p>
    </div>
  )
}

export default function App() {
  return (
    <ContasProvider>
      <div className="app-shell">
        <main className="app-main">
          <h1 className="app-title">Contas</h1>
          <Resumo />
        </main>
      </div>
    </ContasProvider>
  )
}
