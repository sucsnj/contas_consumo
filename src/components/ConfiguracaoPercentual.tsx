import { useEffect, useState } from 'react'
import { Percent } from 'lucide-react'
import { analisarValor, formatarPercentual } from '../lib/calc/format'
import { useContas } from '../store/useContas'
import { useDebounce } from '../hooks/useDebounce'
import { Badge } from './Badge'
import { CampoValor } from './CampoValor'

export function ConfiguracaoPercentual() {
  const { estado, despachar } = useContas()
  const [texto, setTexto] = useState(String(estado.contas.percentual * 100))

  const valorDebounced = useDebounce(analisarValor(texto) ?? 0)

  useEffect(() => {
    const fracao = valorDebounced / 100
    if (fracao >= 0 && fracao <= 1) despachar({ tipo: 'percentual', valor: fracao })
  }, [valorDebounced, despachar])

  const percentual = estado.contas.percentual

  return (
    <div className="config-percentual">
      <label className="campo-rotulo" htmlFor="percentual">
        <Percent size={14} /> Percentual da diferença
      </label>
      <CampoValor
        id="percentual"
        valor={texto}
        aoAlterar={setTexto}
        placeholder="30"
        className="input-curto"
      />
      <Badge tom="amarelo">{formatarPercentual(percentual)}</Badge>
    </div>
  )
}
