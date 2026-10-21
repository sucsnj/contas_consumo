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
