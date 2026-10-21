# ADR-0008: Pagamento pode exceder o saldo e ficar negativo

- Status: substituido pela ADR-0010 para o pagamento do saldo; vale para
  reserva e saldo2
- Data: 2026-10-18
- Substitui: a restricao de negativo da ADR-0003

## Contexto

A ADR-0003 proibia pagar mais do que havia: o motor devolvia `null` e o botao
ficava desabilitado com o aviso "valor maior que o disponivel". Isso trava o
caso mais comum de uso real, em que o gasto e maior que o saldo lancado e a
diferenca e uma divida, nao um erro de digitacao.

O proprio app ja aceita `saldo2` negativo pela `entrada2` (ADR-0002) e pelos
ajustes manuais (ADR-0006). So o pagamento era restrito, ao contrario das demais carteiras.

## Decisao

`pagar saldo`, `pagar reserva` e `pagar saldo2` aceitam **qualquer valor
positivo**, maior ou igual ao valor existente. O campo pode ficar negativo:

```
saldo = 1000, pagar 1500  ->  saldo = -500
```

Regras:

- A unica validacao do pagamento e o valor: precisa ser positivo e finito.
  `pagar` devolve `null` para `0`, negativo, `NaN` e infinito.
- `saldoAposPagamento(estado, destino, valor)` (src/lib/calc/engine.ts) e a
  funcao pura que devolve o valor resultante do campo; `pagar` aplica esse
  valor. A UI usa `saldoAposPagamento` para mostrar o resultado antes do
  clique.
- `total` continua derivado: `saldo + saldo2`. Pagar a reserva **nao** mexe no
  total; pagar `saldo` ou `saldo2` reduz o total.
- O botao nunca e desabilitado por falta de saldo. Ele mostra sempre o valor
  resultante, destacado quando negativo.
- Ajuste manual e `entrada2` seguem aceitando negativos, como ja eram aceitos.

## Consequencias

- Saldo negativo passa a ser um estado legitimo: a situacao ja existe em
  `src/lib/situacao.ts` (rotulo "Negativo", tom vermelho).
- O motor nao precisa mais conhecer o saldo do destino para validar, o que
  simplifica `pagamentoPossivel` para uma checagem de valor.
- Historico, desfazer e gravacao de movimento nao mudam: a operacao segue
  registrando `pagamento-<destino>` com o valor pago.

## Atualizacao (ADR-0010)

Para o **saldo**, o excedente deixou de virar negativo: ele sai da reserva e e
registrado em `emprestado`, com o botao "Devolucao" para quitar a divida.
`pagar reserva` e `pagar saldo2` seguem o descrito acima.