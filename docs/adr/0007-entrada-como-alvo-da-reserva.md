# ADR-0007: A entrada e um alvo da reserva, nao do saldo

- Status: aceito
- Data: 2026-10-18
- Substitui: a regra da diferenca e a validacao da ADR-0002

## Contexto

A ADR-0002 fixou `diferenca = max(0, entrada - saldo)` e a regra "`entrada`
nunca menor que `saldo`". Na pratica essa base atrapalha.

`saldo` e o valor **resultante** da ultima entrada (a parte que nao foi para a
reserva), enquanto `reserva` acumula a cada entrada. Como `saldo` cresce mais
rapido que `reserva`, exigir `entrada >= saldo` empurra o alvo sempre para
cima e nao deixa reaproveitar o valor guardado na reserva.

## Decisao

A base da diferenca passa a ser a `reserva`:

```
diferenca = max(0, entrada - reserva)
```

E a validacao da entrada passa a ser:

```
entrada >= reserva
```

O restante da divisao nao muda: `porcentagem1` da diferenca vai para a reserva
e `porcentagem2 = 1 - porcentagem1` vai para o saldo.

```
porcentagem2        = 1 - porcentagem1
porcentagem_reserva = diferenca * porcentagem1
porcentagem_saldo   = diferenca * porcentagem2
novo_reserva        = porcentagem_reserva + reserva
novo_saldo          = porcentagem_saldo + saldo
```

Na confirmacao:

```
reserva = novo_reserva
saldo   = novo_saldo
entrada = 0
total   = saldo + saldo2
```

### Exemplo de referencia

Com `saldo = 350`, `reserva = 150`, `entrada = 700`, `porcentagem1 = 0.3`:

```
diferenca          = 700 - 150              = 550
porcentagem2       = 1 - 0.3                = 0.7
porcentagem_reserva = 550 * 0.3             = 165
porcentagem_saldo   = 550 * 0.7             = 385
novo_reserva        = 165 + 150             = 315
novo_saldo          = 385 + 350             = 735
```

Confirmado: `saldo = 735`, `reserva = 315`, `total = 735`.

`entrada2` nao muda: continua sendo o valor **absoluto** do novo `saldo2`.

## Consequencias

- `entrada` continua sendo alvo, nunca deposito: `novo_saldo` pode ficar abaixo
  da `entrada` porque parte da diferenca vai para a reserva.
- Entrada abaixo da reserva e rejeitada com aviso no campo e o botao de
  confirmacao fica desabilitado.
- O clamp `max(0, ...)` continua como rede de seguranca, embora com a
  validacao ativa ele nunca dispare.
- `entradaValida` (src/lib/calc/engine.ts) compara com `reserva`;
  `previaEntrada` calcula a diferenca a partir de `reserva`.