import type { ReactNode } from 'react'
import { formatarMoeda } from '../lib/calc/format'
import type { Tom } from '../lib/situacao'

interface CartaoResumoProps {
  rotulo: string
  valor: number
  tom: Tom
  icone: ReactNode
}

export function CartaoResumo({ rotulo, valor, tom, icone }: CartaoResumoProps) {
  return (
    <div className="card resumo-card">
      <p className="resumo-rotulo">
        {icone}
        {rotulo}
      </p>
      <p className={`resumo-valor valor-${tom}`}>{formatarMoeda(valor)}</p>
    </div>
  )
}
