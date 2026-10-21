import { arredondarMoeda } from './engine'

const REGEX_TECLA_VALIDA = /^[0-9+\-*/().,]$/
const REGEX_OPERADOR = /^[+\-*/]$/
const REGEX_NUMERO = /^[0-9]$/
const LIMITE_EXPRESSAO = 40

export function estaVazia(expressao: string): boolean {
  return expressao.length === 0
}

function contaParenteses(expressao: string): { abre: number; fecha: number } {
  let abre = 0
  let fecha = 0
  for (const caractere of expressao) {
    if (caractere === '(') abre += 1
    if (caractere === ')') fecha += 1
  }
  return { abre, fecha }
}

function digitosAtuais(expressao: string): string {
  return /[0-9.,]*$/.exec(expressao)?.[0] ?? ''
}

export function inserirTecla(expressao: string, tecla: string): string {
  if (!REGEX_TECLA_VALIDA.test(tecla)) return expressao
  if (expressao.length >= LIMITE_EXPRESSAO && !['⌫', 'C'].includes(tecla)) return expressao

  const ultimo = expressao.at(-1) ?? ''
  const ehSinal = tecla === '+' || tecla === '-' || tecla === '*' || tecla === '/'

  // um sinal substitui o sinal pendente: "150+30+" com "-" vira "150+30-"
  if (ehSinal && REGEX_OPERADOR.test(ultimo) && ultimo !== '*' && ultimo !== '/') {
    return `${expressao.slice(0, -1)}${tecla}`
  }

  const ehSeparador = tecla === ',' || tecla === '.'

  if (ehSeparador) {
    const trecho = digitosAtuais(expressao)
    if (trecho === '' || trecho.includes('.') || trecho.includes(',')) return expressao
    return `${expressao}.`
  }

  if (tecla === ')') {
    if (REGEX_OPERADOR.test(ultimo) || ultimo === '(') return expressao
    const { abre, fecha } = contaParenteses(expressao)
    if (fecha >= abre) return expressao
  }

  if (tecla === '(' && REGEX_NUMERO.test(ultimo)) {
    return `${expressao}*${tecla}`
  }

  return `${expressao}${tecla}`
}

export function apagarTecla(expressao: string): string {
  return expressao.slice(0, -1)
}

export function sanitizarExpressao(texto: string): string {
  return [...texto].reduce((expressao, caractere) => inserirTecla(expressao, caractere), '')
}

type Token = { tipo: 'numero'; valor: number } | { tipo: 'operador'; valor: string } | { tipo: 'abre' } | { tipo: 'fecha' }

const PRECEDENCIA: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 }

function tokenizar(expressao: string): Token[] | null {
  const tokens: Token[] = []
  let indice = 0

  while (indice < expressao.length) {
    const caractere = expressao[indice]

    if (REGEX_NUMERO.test(caractere) || caractere === '.') {
      let numero = ''
      while (indice < expressao.length && /[0-9.]/.test(expressao[indice])) {
        numero += expressao[indice]
        indice += 1
      }
      if (numero.split('.').length > 2) return null
      const valor = Number(numero)
      if (!Number.isFinite(valor)) return null
      tokens.push({ tipo: 'numero', valor })
      continue
    }

    if (REGEX_OPERADOR.test(caractere)) {
      tokens.push({ tipo: 'operador', valor: caractere })
    } else if (caractere === '(') {
      tokens.push({ tipo: 'abre' })
    } else if (caractere === ')') {
      tokens.push({ tipo: 'fecha' })
    } else {
      return null
    }

    indice += 1
  }

  return tokens
}

export function calcular(expressao: string): number | null {
  const completa = expressao.replace(/[+\-*/]+$/, '')
  if (estaVazia(completa)) return null

  const tokens = tokenizar(completa)
  if (tokens === null || tokens.length === 0) return null

  const saida: (number | string)[] = []
  const operadores: string[] = []

  for (const token of tokens) {
    if (token.tipo === 'numero') {
      saida.push(token.valor)
      continue
    }

    if (token.tipo === 'operador') {
      while (
        operadores.length > 0 &&
        operadores.at(-1) !== '(' &&
        PRECEDENCIA[operadores.at(-1) ?? ''] >= PRECEDENCIA[token.valor]
      ) {
        saida.push(operadores.pop() as string)
      }
      operadores.push(token.valor)
      continue
    }

    if (token.tipo === 'abre') {
      operadores.push('(')
      continue
    }

    while (operadores.length > 0 && operadores.at(-1) !== '(') {
      saida.push(operadores.pop() as string)
    }
    if (operadores.at(-1) !== '(') return null
    operadores.pop()
  }

  while (operadores.length > 0) {
    const operador = operadores.pop() as string
    if (operador === '(') return null
    saida.push(operador)
  }

  const valores: number[] = []
  for (const item of saida) {
    if (typeof item === 'number') {
      valores.push(item)
      continue
    }

    const direita = valores.pop()
    const esquerda = valores.pop()
    if (esquerda === undefined || direita === undefined) return null

    switch (item) {
      case '+':
        valores.push(esquerda + direita)
        break
      case '-':
        valores.push(esquerda - direita)
        break
      case '*':
        valores.push(esquerda * direita)
        break
      case '/':
        if (direita === 0) return null
        valores.push(esquerda / direita)
        break
      default:
        return null
    }
  }

  if (valores.length !== 1) return null
  return Number.isFinite(valores[0]) ? valores[0] : null
}

export function calcularResultado(expressao: string): number | null {
  const valor = calcular(expressao)
  return valor === null ? null : arredondarMoeda(valor)
}
