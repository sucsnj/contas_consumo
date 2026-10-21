import { useState } from 'react'
import { Pencil, X, Check } from 'lucide-react'
import { analisarValor } from '../lib/calc/format'
import { porcentagemValida } from '../lib/calc/engine'
import { useContas } from '../store/useContas'
import type { CampoAjustavel } from '../types/domain'
import { CampoValor } from './CampoValor'

interface ValorAjustavelProps {
  campo: CampoAjustavel
  rotulo: string
  valor: number
  formatar: (valor: number) => string
  tom: string
}

export function ValorAjustavel({ campo, rotulo, valor, formatar, tom }: ValorAjustavelProps) {
  const { despachar } = useContas()
  const [editando, setEditando] = useState(false)
  const [texto, setTexto] = useState('')

  const numero = analisarValor(texto)
  const invalido = numero === null || (campo === 'porcentagem1' && !porcentagemValida(numero))

  function salvar() {
    if (numero === null || invalido) return
    despachar({ tipo: 'ajustar', campo, valor: numero })
    setEditando(false)
    setTexto('')
  }

  if (!editando) {
    return (
      <div className="valor-ajustavel">
        <div className="resumo-linha">
          <span className="resumo-rotulo">{rotulo}</span>
          <button
            type="button"
            className="btn-icone btn-icone-mini"
            aria-label={`Ajustar ${rotulo}`}
            onClick={() => {
              setTexto(String(valor).replace('.', ','))
              setEditando(true)
            }}
          >
            <Pencil size={14} />
          </button>
        </div>
        <p className={`resumo-valor valor-${tom}`}>{formatar(valor)}</p>
      </div>
    )
  }

  return (
    <div className="valor-ajustavel">
      <span className="resumo-rotulo">{rotulo}</span>
      <CampoValor id={`ajuste-${campo}`} valor={texto} aoAlterar={setTexto} aoConfirmar={salvar} />
      {invalido ? (
        <p className="aviso-erro">
          {campo === 'porcentagem1' ? 'Use um valor entre 0 e 1.' : 'Informe um número válido.'}
        </p>
      ) : null}
      <div className="acoes-ajuste">
        <button type="button" className="btn btn-success btn-mini" disabled={invalido} onClick={salvar}>
          <Check size={14} />
        </button>
        <button
          type="button"
          className="btn btn-outline btn-mini"
          onClick={() => {
            setEditando(false)
            setTexto('')
          }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}