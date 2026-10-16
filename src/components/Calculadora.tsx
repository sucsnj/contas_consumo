import { useState } from 'react'
import { Calculator, Delete, X } from 'lucide-react'
import { apagarTecla, calcularResultado, inserirTecla } from '../lib/calc/calculadora'
import { formatarValorDigitado } from '../lib/calc/format'

const TECLAS_OPERACAO = ['+', '-', '*', '/']
const TECLAS = [
  '7',
  '8',
  '9',
  '/',
  '4',
  '5',
  '6',
  '*',
  '1',
  '2',
  '3',
  '-',
  '0',
  ',',
  '(',
  ')',
  '+',
  '=',
] as const

interface CalculadoraProps {
  aoUsarValor: (valor: number) => void
  aoFechar: () => void
}

export function Calculadora({ aoUsarValor, aoFechar }: CalculadoraProps) {
  const [expressao, setExpressao] = useState('')
  const [resultado, setResultado] = useState<number | null>(null)

  function aoPressionar(tecla: string) {
    if (tecla === '=') {
      setResultado(calcularResultado(expressao))
      return
    }
    setResultado(null)
    setExpressao((atual) => inserirTecla(atual, tecla))
  }

  function limpar() {
    setExpressao('')
    setResultado(null)
  }

  return (
    <div className="calculadora">
      <div className="calculadora-topo">
        <span className="calculadora-titulo">
          <Calculator size={16} /> Calculadora
        </span>
        <button
          type="button"
          className="tecla tecla-icone"
          aria-label="Fechar calculadora"
          onClick={aoFechar}
        >
          <X size={16} />
        </button>
      </div>

      <div className="calculadora-display">
        <p className="calculadora-expressao">
          {expressao.length === 0 ? '0' : expressao.replaceAll('.', ',')}
        </p>
        <p className={`calculadora-resultado valor-${resultado === null ? 'cinza' : 'verde'}`}>
          {resultado === null ? '—' : formatarValorDigitado(resultado)}
        </p>
      </div>

      <div className="calculadora-teclas">
        <button type="button" className="tecla tecla-acao" onClick={limpar}>
          C
        </button>
        <button
          type="button"
          className="tecla tecla-acao"
          aria-label="Apagar"
          onClick={() => {
            setExpressao(apagarTecla(expressao))
            setResultado(null)
          }}
        >
          <Delete size={16} />
        </button>
        {TECLAS.map((tecla) => (
          <button
            key={tecla}
            type="button"
            className={`tecla ${TECLAS_OPERACAO.includes(tecla) ? 'tecla-operador' : ''} ${tecla === '=' ? 'tecla-igual' : ''}`}
            onClick={() => aoPressionar(tecla)}
          >
            {tecla}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="btn btn-primary calculadora-usar"
        disabled={resultado === null}
        onClick={() => {
          if (resultado !== null) aoUsarValor(resultado)
        }}
      >
        Usar valor no pagamento
      </button>

      <p className="campo-dica">
        O resultado é arredondado para cima e pode ser enviado para o valor do pagamento.
      </p>
    </div>
  )
}
