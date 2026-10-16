import { ContasProvider } from './store/ContasProvider'
import { DashboardPage } from './pages/DashboardPage'

export default function App() {
  return (
    <ContasProvider>
      <DashboardPage />
    </ContasProvider>
  )
}
