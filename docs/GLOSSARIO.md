# Glossario do dominio - Contas

Termos do negocio do app. Os nomes de tela e de codigo derivam daqui.

| Termo | Nome no codigo | Significado |
| --- | --- | --- |
| saldo | `saldo` | Saldo da conta 1. |
| saldo2 | `saldo2` | Saldo da conta 2. |
| reserva | `reserva` |Carteira separada, **nao entra no total**. |
| total | `total` | `saldo + saldo2`. Derivado, nunca digitado. |
| entrada | `entrada` | Saldo **desejado** para a conta 1. Nao e deposito. Precisa ser maior ou igual ao `saldo`. |
| entrada2 | `entrada2` | Novo valor **absoluto** do `saldo2` (substitui). O campo ja vem preenchido com o saldo2 atual. |
| diferenca | `diferenca` | `entrada - saldo`, nunca negativa (menor que zero retorna 0). |
| porcentagem1 | `porcentagem1` | Fracao entre 0 e 1, padrao `0.3`. Multiplica a diferenca e o resultado vai para a **reserva**. |
| porcentagem2 | `porcentagem2` | `1 - porcentagem1`. Complemento que vai para o **saldo**. |
| porcentagem_reserva | `porcentagem_reserva` | `diferenca * porcentagem1`. |
| porcentagem_saldo | `porcentagem_saldo` | `diferenca * porcentagem2`. |
| novo_reserva | `novo_reserva` | `porcentagem_reserva + reserva`. Valor da reserva antes da confirmacao. |
| novo_saldo | `novo_saldo` | `porcentagem_saldo + saldo`. Valor do saldo antes da confirmacao. |
| previa | `previa` | Projecao em tempo real, sem alterar os saldos. |
| confirmar | - | Aplica a previa. Ate la nada muda. |
| expressao | `expressao` | Texto digitado no input, com numeros, sinais e parenteses. |
| resultado | `resultado` | Valor da expressao, arredondado **para cima**. |
| pagar saldo | `pagar_saldo` | Subtrai do `saldo`. |
| pagar reserva | `pagar_reserva` | Subtrai da `reserva`. |
| pagar saldo2 | `pagar_saldo2` | Subtrai do `saldo2`. |
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