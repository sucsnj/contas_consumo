# ADR-0002: Entrada como saldo desejado e divisao da diferenca

- Status: aceito (diferenca e validacao substituidas pela ADR-0007)
- Data: 2026-10-18

> **Vigente:** a regra da diferenca e da validacao foi alterada pela
> [ADR-0007](0007-entrada-como-alvo-da-reserva.md), que usa a `reserva` como
> base. Este registro e mantido como historico.

## Contexto

A formulacao original tratava `entrada` de forma ambigua: ao mesmo tempo
descrita como "nunca menor que o saldo" (o que so faz sentido para um valor
alvo) e subtraida do saldo (o que so faz sentido para um deposito). Com
`saldo = 350` e `entrada = 500`, cada leitura produzia um resultado diferente
(700/300 contra 455/195).

## Decisao

`entrada` e o **saldo desejado** para a conta 1. Nao e deposito.

A diferenca e o quanto falta para alcancar o alvo:

```
diferenca = max(0, entrada - saldo)
```

A diferenca e dividida:

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

O padrao de `porcentagem1` e `0.3`: **30% da diferenca vai para a reserva e
70% para o saldo**.

### Exemplo de referencia

Com `saldo = 350`, `reserva = 150`, `entrada = 700`, `porcentagem1 = 0.3`:

```
diferenca          = 700 - 350              = 350
porcentagem2       = 1 - 0.3                = 0.7
porcentagem_reserva = 350 * 0.3             = 105
porcentagem_saldo   = 350 * 0.7             = 245
novo_reserva        = 105 + 150             = 255
novo_saldo          = 245 + 350             = 595
```

Confirmado: `saldo = 595`, `reserva = 255`. Como `entrada` e alvo e parte da
diferenca vai para a reserva, o saldo final fica abaixo da entrada. O usuario
ve esse resultado na previa antes de confirmar.

## Consequencias

- A regra "`entrada` nunca menor que `saldo`" faz sentido: entradas abaixo do
  saldo sao rejeitadas com aviso no campo e o botao de confirmacao fica
  desabilitado.
- O clamp `max(0, ...)` continua existindo como rede de seguranca, embora
  com a validacao ativa ele nunca dispare.
- `entrada2` e diferente por decisao: e o valor **absoluto** do novo `saldo2`
  (substitui), nao um delta.