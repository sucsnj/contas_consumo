# ADR-0004: Calculadora inline nos inputs, sem keypad

- Status: aceito
- Data: 2026-10-18

## Contexto

Uma primeira versao tinha uma calculadora com teclado popup. O usuario pediu
que a calculacao fosse feita **no proprio input**, sem abrir calculadora.

## Decisao

Nao existe keypad, popup ou painel de calculadora. O proprio campo de texto e
a calculadora:

- aceita apenas digitos, sinais, parenteses e separador decimal;
- um sinal substitui o sinal pendente (`150+30+` seguido de `-` vira
  `150+30-`);
- um separador decimal por numero, parenteses balanceados, `(` depois de
  numero vira `*(`, limite de 40 caracteres;
- o resultado aparece abaixo do campo em tempo real (debounce de 300ms);
- sinal de operacao no final nao invalida a expressao: `150+30+` calcula
  `150+30` (o operador pendente e descartado);
- o resultado e limitado a **duas casas decimais**, sem arredondar para
  inteiro (`calcularResultado` reaproveita `arredondarMoeda` do engine);
- `Enter` confirma.

A mesma coisa vale para o campo da `entrada2`.

A expressao e sanitizada caractere a caractere reaproveitando `inserirTecla`
do modulo de calculo; a avaliacao usa um parser proprio (shunting-yard), sem
`eval` ou `Function`.

## Consequencias

- Uma unica regra de calculo serve entrada, entrada2 e pagamentos.
- O texto exibido usa virgula decimal; internamente a expressao usa ponto.
- Nenhum estado de "calculadora aberta" existe na interface.