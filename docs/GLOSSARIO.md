# Glossario do dominio - Contas

Termos do negocio do app. Os nomes de tela e de codigo derivam daqui.

| Termo | Nome no codigo | Significado |
| --- | --- | --- |
| saldo | `saldo` | Saldo da conta 1. |
| saldo2 | `saldo2` | Saldo da conta 2. |
| reserva | `reserva` |Carteira separada, **nao entra no total**. |
| total | `total` | `saldo + saldo2`. Derivado, nunca digitado. |
| entrada | `entrada` | Saldo **desejado** para a conta 1. Nao e deposito. Precisa ser maior ou igual a `reserva`. |
| entrada2 | `entrada2` | Movimento historico que substituia o `saldo2` pelo valor absoluto. A edicao agora e feita direto no resumo; o tipo permanece para historicos antigos. |
| diferenca | `diferenca` | `entrada - reserva`, nunca negativa (menor que zero retorna 0). |
| porcentagem1 | `porcentagem1` | Fracao entre 0 e 1, padrao `0.3`. Multiplica a diferenca e o resultado vai para a **reserva**. |
| porcentagem2 | `porcentagem2` | `1 - porcentagem1`. Complemento que vai para o **saldo**. |
| porcentagem_reserva | `porcentagem_reserva` | `diferenca * porcentagem1`. |
| porcentagem_saldo | `porcentagem_saldo` | `diferenca * porcentagem2`. |
| novo_reserva | `novo_reserva` | `porcentagem_reserva + reserva`. Valor da reserva antes da confirmacao. |
| novo_saldo | `novo_saldo` | `porcentagem_saldo + saldo`. Valor do saldo antes da confirmacao. |
| previa | `previa` | Projecao em tempo real, sem alterar os saldos. |
| confirmar | - | Aplica a previa. Ate la nada muda. |
| expressao | `expressao` | Texto digitado no input, com numeros, sinais e parenteses. |
| resultado | `resultado` | Valor da expressao com **duas casas decimais**. Nunca arredondado para inteiro. |
| pagar saldo | `pagar_saldo` | Subtrai do `saldo`. Se faltar, usa a `reserva` e registra a divida em `emprestado`. Nunca deixa `saldo` negativo. |
| pagar reserva | `pagar_reserva` | Subtrai da `reserva`. Pode deixar o campo negativo. Nao altera o `total`. |
| pagar saldo2 | `pagar_saldo2` | Subtrai do `saldo2`. Pode deixar o campo negativo. |
| emprestado | `emprestado` | Divida da conta 1 com a reserva. Sempre `<= 0`; `-50` significa que a reserva cobriu 50 do saldo. Nao entra no `total`. |
| emprestimo | `emprestimo` | Parte do pagamento do saldo que excede o saldo: `min(0, saldo - valor)`, sempre `<= 0`. |
| devolucao | `devolucao` | Cede `min(saldo, -emprestado)` do saldo para a reserva, reduzindo o `emprestado` ate zero. Parcial quando o saldo nao cobre. |
| reserva necessaria | `reservaNecessaria` | Quanto da reserva um pagamento do saldo vai consumir: `max(0, valor - saldo)`. |
| saldo apos pagamento | `saldoAposPagamento` | Valor resultante do campo depois de pagar (para o saldo nunca fica abaixo de zero). |
| ajuste | - | Edicao livre de `saldo`, `saldo2`, `reserva` ou `porcentagem1`, sem passar pelo calculo principal. |
| estado (historico) | - | Snapshot dos saldos gravado a cada operacao, com data e hora. Maximo de 3. |
| desfazer | - | Reverter para o estado anterior. Botao flutuante visivel por 5 segundos apos qualquer operacao. |

## Nomes antigos (modelo anterior, ainda referred no historico)

| Termo antigo | Substituido por |
| --- | --- |
| valor_atual | `saldo` |
| valor_reserva | `reserva` |
| valor_novo_conta1 | `entrada` (agora e alvo, nao deposito) |
| valor_novo_conta2 | `entrada2` (agora absoluto, nao delta) |
| valor_disponivel_conta1 | `saldo` + `reserva` |
| valor_disponivel_conta2 | `saldo2` |
| percentual | `porcentagem1` |

## Persistencia (ADR-0009)

| Termo | Nome no codigo | Significado |
| --- | --- | --- |
| servidor | `src/server` | Processo Node que serve o `dist/` e a API; nao passa pelo bundler. |
| api | `src/server/api.ts` | Rotas `/api/*` em JSON, protegidas por bearer token. |
| repositorio | `Repositorio` | Interface unica de acesso ao banco (ler/gravar estado, estados e movimentos). |
| banco | `contas.db` | Arquivo SQLite local; e o backup do app. |
| migracao | `migrarDadosLegados` | Importacao unica do `localStorage` antigo para o banco, quando o banco esta vazio. |
| sessao | `obterTokenSalvo` | Token do usuario; unico dado que continua no `localStorage`. |