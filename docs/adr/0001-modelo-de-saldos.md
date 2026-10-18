# ADR-0001: Modelo de saldos com reserva separada

- Status: aceito
- Data: 2026-10-18

## Contexto

O modelo herdado da planilha tinha cinco valores que se sobrepunham
(`valor_atual`, `valor_reserva`, `valor_disponivel_conta1`,
`valor_disponivel_conta2`, `total_contas`). O `valor_disponivel_conta1` era
definido como `valor_reserva`, o que fazia um pagamento na conta 1 ser
"ressuscitado" pela proxima entrada e quebrava a consistencia entre saldos.

## Decisao

O estado passa a ter quatro valores independentes:

- `saldo` (conta 1)
- `saldo2` (conta 2)
- `reserva` (carteira a parte)
- `porcentagem1` (fracao entre 0 e 1, padrao 0.3)

O `total` e sempre derivado: `total = saldo + saldo2`.

A reserva **nao** participa do total. Ela e um terceiro valor guardado, com
pagamento proprio.

## Consequencias

- Nenhum valor e calculado a partir de outro: `saldo`, `saldo2` e `reserva`
  sao manipulados diretamente pelas operacoes.
- `total` nunca e digitado nem ajustavel, eliminating a possibilidade de
  inconsistencia.
- Cada valor tem pagamento e ajuste proprios, sem ambiguidade.