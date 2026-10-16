import { calcularResultado, sanitizarExpressao } from '../lib/calc/calculadora'
import { formatarMoeda } from '../lib/calc/format'
import { useDebounce } from '../hooks/useDebounce'
import { useState } from 'react'
import type { ContaId } from '../types/domain'
import { CampoValor } from './CampoValor'

interface PainelPagamentoProps {
  conta: ContaId
  nome: string
  aoConfirmar: (valor: number) => void
  aoCancelar: () => void
}

export function PainelPagamento({ conta, nome, aoConfirmar, aoCancelar }: PainelPagamentoProps) {
  const [expressao, setExpressao] = useState('')
  const expressaoAtrasada = useDebounce(expressao)
  const resultado = calcularResultado(expressaoAtrasada)

  function confirmar() {
    if (resultado === null || resultado <= 0) return
    aoConfirmar(resultado)
  }

  return (
    <>
      <div className="campo">
        <label className="campo-rotulo" htmlFor={`pagamento-conta-${conta}`}>
          Valor do pagamento
        </label>
        <CampoValor
          id={`pagamento-conta-${conta}`}
          valor={expressao.replaceAll('.', ',')}
          aoAlterar={(texto) => setExpressao(sanitizarExpressao(texto.replaceAll(',', '.')))}
          aoConfirmar={confirmar}
          placeholder="150+30 ou (1200-300)/2"
        />
        <p className={`expressao-resultado valor-${resultado === null ? 'cinza' : 'verde'}`}>
          {resultado === null ? 'Expressão incompleta' : `Valor a pagar: ${formatarMoeda(resultado)}`}
        </p>
        <p className="campo-dica">
          Aceita números, sinais e parênteses. Um sinal substitui o sinal anterior e o resultado é
          arredondado para cima. Será subtraído do disponível de {nome.toLowerCase()}.
        </p>
      </div>

      <div className="acoes-conta">
        <button
          type="button"
          className="btn btn-danger"
          disabled={resultado === null || resultado <= 0}
          onClick={confirmar}
        >
          Confirmar pagamento
        </button>
        <button type="button" className="btn btn-outline" onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </>
  )
}
