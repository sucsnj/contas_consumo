# ADR-0003: Tres pagamentos a partir da expressao do input

- Status: aceito (restricao de negativo substituida pela ADR-0008)
- Data: 2026-10-18

> **Vigente:** a regra de negativo foi revertida pela
> [ADR-0008](0008-pagamento-com-saldo-negativo.md): pagamento maior que o
> saldo e permitido e deixa o campo negativo. Este registro e mantido como
> historico.

## Contexto

O modelo antigo tinha dois botoes de pagamento, um por conta. Com a reserva
virando uma terceira carteira, um unico valor calculado precisaria de tres
destinos diferentes.

## Decisao

O input principal (o mesmo do calculculo principal) tem calculadora inline.
Enquanto houver um resultado valido na expressao, tres botoes aparecem:

- **pagar saldo**: subtrai de `saldo`
- **pagar reserva**: subtrai de `reserva`
- **pagar saldo2**: subtrai de `saldo2`

Regras:

- o valor do pagamento vem do resultado da expressao (arredondado para cima);
- pagamento **nao pode** deixar `saldo`, `reserva` ou `saldo2` negativo: se o
  valor exceder o saldo disponivel, o botao fica desabilitado com aviso;
- pagamento nao altera `total` diretamente: `total` e recalculado como
  `saldo + saldo2`; **pagar a reserva, por isso, nao mexe no total**
  (confirmado em revisao).

A restricao de negativo vale **apenas** para pagamentos. Ajustes manuais e
`entrada2` podem definir valores negativos.

## Consequencias

- Tres operacoes distintas compartilham um unico valor calculado.
- Nao existe mais "pagar conta" dentro do cartao da conta; os botoes ficam
  no painel da expressao.