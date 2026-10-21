import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { porcentagemValida } from '../lib/calc/engine'
import { formatarValorDigitado } from '../lib/calc/format'
import { useExpressao } from '../hooks/useExpressao'
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
  const { texto, resultado, alterar, definirTexto, limpar } = useExpressao()

  const invalido =
    resultado === null || (campo === 'porcentagem1' && !porcentagemValida(resultado))
  const mostrarPrevia = /[+\-*/()]/.test(texto)

  function iniciarEdicao() {
    definirTexto(formatarValorDigitado(valor))
    setEditando(true)
  }

  function cancelar() {
    setEditando(false)
    limpar()
  }

  function salvar() {
    if (resultado === null || invalido) return
    despachar({ tipo: 'ajustar', campo, valor: resultado })
    cancelar()
  }

  if (!editando) {
    return (
      <div className="valor-ajustavel">
        <span className="resumo-rotulo">{rotulo}</span>
        <button
          type="button"
          className={`resumo-valor valor-${tom} valor-editavel`}
          aria-label={`Editar ${rotulo}`}
          title="Toque para editar"
          onClick={iniciarEdicao}
        >
          {formatar(valor)}
        </button>
      </div>
    )
  }

  return (
    <div className="valor-ajustavel">
      <span className="resumo-rotulo">{rotulo}</span>
      <CampoValor
        id={`ajuste-${campo}`}
        valor={texto}
        aoAlterar={alterar}
        aoConfirmar={salvar}
        className="input-valor"
        autoFocar
      />
      {mostrarPrevia ? (
        resultado === null ? (
          <p className="expressao-resultado valor-cinza">Expressão incompleta</p>
        ) : (
          <p className="expressao-resultado valor-azul">{formatar(resultado)}</p>
        )
      ) : null}
      {invalido ? (
        <p className="aviso-erro">
          {campo === 'porcentagem1' ? 'Use um valor entre 0 e 1.' : 'Informe um número válido.'}
        </p>
      ) : null}
      <div className="acoes-ajuste">
        <button type="button" className="btn btn-success btn-mini" disabled={invalido} onClick={salvar}>
          <Check size={14} />
        </button>
        <button type="button" className="btn btn-outline btn-mini" onClick={cancelar}>
          <X size={14} />
        </button>
      </div>
    </div>
  )
}