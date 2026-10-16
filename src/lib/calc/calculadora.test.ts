import { describe, expect, it } from 'vitest'
import {
  apagarTecla,
  calcular,
  calcularResultado,
  inserirTecla,
  sanitizarExpressao,
} from './calculadora'

function digitar(expressaoInicial: string, teclas: string): string {
  return [...teclas].reduce((expressao, tecla) => inserirTecla(expressao, tecla), expressaoInicial)
}

describe('inserirTecla', () => {
  it('aceita apenas numeros, sinais, parenteses e separador decimal', () => {
    expect(inserirTecla('', 'a')).toBe('')
    expect(inserirTecla('', '1')).toBe('1')
    expect(inserirTecla('1', '+')).toBe('1+')
    expect(inserirTecla('1+', '(')).toBe('1+(')
    expect(inserirTecla('1', ',')).toBe('1.')
  })

  it('um sinal substitui o sinal pendente', () => {
    expect(inserirTecla('150+30+', '-')).toBe('150+30-')
    expect(inserirTecla('150+30-', '+')).toBe('150+30+')
  })

  it('sinal apos * ou / inicia um novo operador', () => {
    expect(inserirTecla('150+30*', '+')).toBe('150+30*+')
  })

  it('aceita numero logo apos o sinal', () => {
    expect(digitar('', '150+30')).toBe('150+30')
    expect(digitar('', '150+30+5')).toBe('150+30+5')
  })

  it('aceita apenas um separador decimal por numero', () => {
    expect(digitar('', '10,5')).toBe('10.5')
    expect(digitar('', '10,55')).toBe('10.55')
    expect(digitar('', '10,5,5')).toBe('10.55')
  })

  it('nao permite separador decimal sem digitos antes', () => {
    expect(digitar('', '10+')).toBe('10+')
    expect(digitar('10+', ',')).toBe('10+')
  })

  it('nao fecha parenteses sem abertura ou depois de operador', () => {
    expect(digitar('', '10)')).toBe('10')
    expect(digitar('', '(10+2')).toBe('(10+2')
    expect(digitar('', '(10+2)')).toBe('(10+2)')
    expect(digitar('', '(10+2)+3)')).toBe('(10+2)+3')
    expect(digitar('(10+2', '+')).toBe('(10+2+')
  })

  it('insere multiplicacao implicita ao abrir parentese depois de numero', () => {
    expect(digitar('', '150+30(')).toBe('150+30*(')
  })

  it('apaga o ultimo caractere', () => {
    expect(apagarTecla('150+30')).toBe('150+3')
    expect(apagarTecla('')).toBe('')
  })

  it('limita o tamanho da expressao', () => {
    const limite = digitar('', '1234567890123456789012345678901234567890')
    expect(limite.length).toBeLessThanOrEqual(40)
  })
})

describe('sanitizarExpressao', () => {
  it('mantem expressoes validas', () => {
    expect(sanitizarExpressao('150+30')).toBe('150+30')
    expect(sanitizarExpressao('(1200-300)/2')).toBe('(1200-300)/2')
  })

  it('remove caracteres nao permitidos', () => {
    expect(sanitizarExpressao('15a0+3b0')).toBe('150+30')
    expect(sanitizarExpressao('150 R$ + 30')).toBe('150+30')
  })

  it('normaliza o separador decimal', () => {
    expect(sanitizarExpressao('10,50+0,25')).toBe('10.50+0.25')
  })

  it('aplica as mesmas regras de tecla ao digitar', () => {
    expect(sanitizarExpressao('150+30+')).toBe('150+30+')
    expect(sanitizarExpressao('150+30+-')).toBe('150+30-')
    expect(sanitizarExpressao('10(2)')).toBe('10*(2)')
  })
})

describe('calcular', () => {
  it('soma e subtrai respeitando precedencia', () => {
    expect(calcular('150+30')).toBe(180)
    expect(calcular('2+3*4')).toBe(14)
    expect(calcular('2*(3+4)-5')).toBe(9)
  })

  it('calcula com parenteses', () => {
    expect(calcular('(10+5)*2')).toBe(30)
    expect(calcular('10*(2+3)')).toBe(50)
  })

  it('aceita decimais', () => {
    expect(calcular('10.5+0.5')).toBe(11)
    expect(calcular('0.1+0.2')).toBeCloseTo(0.3, 10)
  })

  it('retorna null para expressoes invalidas', () => {
    expect(calcular('')).toBeNull()
    expect(calcular('150+30+')).toBeNull()
    expect(calcular('(10+2')).toBeNull()
    expect(calcular('10+2)')).toBeNull()
    expect(calcular('10/0')).toBeNull()
    expect(calcular('abc')).toBeNull()
  })
})

describe('calcularResultado', () => {
  it('arredonda o resultado para cima', () => {
    expect(calcularResultado('2/3')).toBe(1)
    expect(calcularResultado('10.1+0.2')).toBe(11)
    expect(calcularResultado('150+30')).toBe(180)
  })

  it('mantem null quando a expressao esta incompleta', () => {
    expect(calcularResultado('150+')).toBeNull()
  })
})
