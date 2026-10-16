const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const formatadorPercentual = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatarMoeda(valor: number): string {
  return formatadorMoeda.format(valor)
}

export function formatarPercentual(fracao: number): string {
  return formatadorPercentual.format(fracao)
}

export function formatarValorDigitado(valor: number): string {
  return Number.isInteger(valor) ? String(valor) : String(valor).replace('.', ',')
}

const regexMilhar = /^-?\d{1,3}(\.\d{3})+,\d+$/
const regexDecimal = /^-?\d+(?:[.,]\d+)?$/

export function analisarValor(texto: string): number | null {
  const limpo = texto.trim().replace(/\s/g, '')
  if (limpo === '' || limpo === '-') return null

  const normalizado = regexMilhar.test(limpo)
    ? limpo.replace(/\./g, '').replace(',', '.')
    : limpo.replace(',', '.')

  if (!regexDecimal.test(normalizado)) return null

  const valor = Number(normalizado)
  return Number.isFinite(valor) ? valor : null
}
