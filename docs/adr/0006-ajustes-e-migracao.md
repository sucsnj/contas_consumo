# ADR-0006: Ajustes inline e migracao dos dados salvos

- Status: aceito
- Data: 2026-10-18

## Contexto

O usuario precisa corrigir valores de forma direta (erro de digitacao em um
deposito, mudanca de percentual) sem passar pelo calculo principal. Alem disso,
ha dados salvos no navegador com o modelo antigo de cinco variaveis.

## Decisao

**Ajustes inline.** Cada valor ajustavel (`saldo`, `saldo2`, `reserva`,
`porcentagem1`) tem um botao de edicao ao lado. Clicar abre um pequeno campo
para digitar o novo valor e confirmar. `porcentagem1` aceita apenas valores
entre 0 e 1. Ajustes podem definir valores negativos.

**Migracao dos dados salvos.** O estado persistido no modelo antigo e
convertido automaticamente para o novo modelo na primeira carga apos a
atualizacao:

| Campo antigo | Campo novo |
| --- | --- |
| `valorReserva` | `reserva` |
| `valorAtual` | `saldo` |
| `valorDisponivelConta2` | `saldo2` |
| `percentual` | `porcentagem1` |

`valorDisponivelConta1` e `totalContas` sao descartados por serem derivados
no modelo novo. Depois da migracao, o estado e gravado no formato novo e a
migracao nao roda de novo.

## Consequencias

- Nenhum dado do usuario e perdido na atualizacao.
- O historico antigo de movimentos nao e migrado: os estados gravados passam
  a ter o formato novo.