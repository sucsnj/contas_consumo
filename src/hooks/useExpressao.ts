import { useCallback, useState } from 'react'
import { calcularResultado, sanitizarExpressao } from '../lib/calc/calculadora'
import { useDebounce } from './useDebounce'

export interface Expressao {
  texto: string
  resultado: number | null
  alterar: (valor: string) => void
  definirTexto: (valor: string) => void
  limpar: () => void
}

export function useExpressao(inicial = ''): Expressao {
  const [texto, setTexto] = useState(inicial)
  const atrasado = useDebounce(texto)

  const alterar = useCallback((valor: string) => {
    setTexto(sanitizarExpressao(valor.replaceAll(',', '.')))
  }, [])

  const definirTexto = useCallback((valor: string) => setTexto(valor), [])
  const limpar = useCallback(() => setTexto(''), [])

  return {
    texto: texto.replaceAll('.', ','),
    resultado: calcularResultado(atrasado),
    alterar,
    definirTexto,
    limpar,
  }
}