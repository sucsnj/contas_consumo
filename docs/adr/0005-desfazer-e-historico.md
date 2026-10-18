# ADR-0005: Desfazer em 5 segundos e historico de 3 estados

- Status: aceito
- Data: 2026-10-18

## Contexto

Toda mutacao de saldo e permanente hoje. Um erro de digitacao em um pagamento
nao tinha volta, e o historico existente guardava movimentos para analise sem
servir como backup.

## Decisao

Dois mecanismos, complementares:

**Desfazer temporario.** Apos **qualquer** operacao confirmada, um botao
flutuante aparece por **5 segundos** e reverte para o estado anterior. Depois
disso ele some.

**Historico de backup.** Cada operacao grava um snapshot do estado
(`saldo`, `saldo2`, `reserva`, `porcentagem1`) com **data e hora**. Sao
mantidos no maximo **3 estados** e o historico e **persistido no navegador**,
sobreviving ao fechamento do app. O usuario pode reverter para qualquer um
dos tres a partir de uma lista.

Ao reverter, **nao** e criado um novo estado. Sem isso o historico se enche de
reversoes e perde os estados uteis.

## Consequencias

- O historico e limitado a 3: e um buffer de seguridad, nao um arquivo de
  movimentos. Para analises, o registro de movimentos continua existindo
  separadamente.
- Reverter para um estado antigo tambem recalcula o `total` naturalmente.
- O botao flutuante e um atalho para o mesmo mecanismo do historico: reverter
  para o estado imediatamente anterior.