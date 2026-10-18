import { Undo2 } from 'lucide-react'

interface BotaoDesfazerProps {
  visivel: boolean
  aoDesfazer: () => void
}

export function BotaoDesfazer({ visivel, aoDesfazer }: BotaoDesfazerProps) {
  if (!visivel) return null

  return (
    <button type="button" className="botao-desfazer" onClick={aoDesfazer}>
      <Undo2 size={16} />
      Desfazer
    </button>
  )
}