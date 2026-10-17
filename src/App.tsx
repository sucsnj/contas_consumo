import { AuthProvider } from './lib/auth/AuthProvider'
import { useAuth } from './lib/auth/useAuth'
import { ContasProvider } from './store/ContasProvider'
import { DashboardPage } from './pages/DashboardPage'
import { IndicadorCarregamento } from './components/IndicadorCarregamento'
import { LoginPage } from './pages/LoginPage'

function Aplicacao() {
  const { status } = useAuth()

  if (status === 'carregando') return <IndicadorCarregamento />
  if (status === 'nao-autenticado') return <LoginPage />

  return (
    <ContasProvider>
      <DashboardPage />
    </ContasProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Aplicacao />
    </AuthProvider>
  )
}
