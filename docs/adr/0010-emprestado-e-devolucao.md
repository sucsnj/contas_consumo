# ADR-0010: Emprestado e devolucao entre saldo e reserva

- Status: aceito
- Data: 2026-10-21
- Substitui: a parte da ADR-0008 que deixava o `saldo` negativo

## Contexto

A ADR-0008 permitia `pagar saldo` deixar o campo negativo. O efeito pratico era
um saldo negativo sem origem explicita: o app nao registrava que a reserva
havia coberto o excedente nem que a conta 1 devia esse valor de volta.

O usuario quer:

1. `pagar saldo` nunca deixa o saldo negativo: o excedente sai da reserva e
   fica registrado como divida da conta 1 com a reserva.
2. Um botao "Devolucao" que cobre essa divida quando a conta 1 tiver saldo.
3. Nunca aceitar operacao que deixe a reserva negativa.

## Decisao

Novo campo `emprestado` em `ContasState` (numero, `<= 0`), exibido no resumo
como "Emprestado". Ele e **derivado das operacoes** e nao e editavel.

### Pagar saldo

```
emprestimo = min(0, saldo - valor)      // negativo ou zero
saldo      = max(0, saldo - valor)
reserva    = reserva + emprestimo
emprestado = emprestado + emprestimo
```

Exemplo (ADR):

```
saldo 150, reserva 500, emprestado 0, pagar saldo 200
-> saldo 0, reserva 450, emprestado -50
```

Quando `valor <= saldo`, nada muda em reserva/emprestado (comportamento
anterior). O emprestado **acumula** em pagamentos sucessivos.

### Devolucao

Disponivel somente com `emprestado < 0` e `saldo > 0`. Devolve
`min(saldo, -emprestado)`:

```
valor      = min(saldo, -emprestado)
saldo      = saldo - valor
reserva    = reserva + valor
emprestado = emprestado + valor
```

```
saldo 300, reserva 200, emprestado -70   -> 300/200/-70 -> 230/270/0
saldo 50,  reserva 200, emprestado -100  -> 0/250/-50 (devolucao parcial)
```

### Reserva negativa

Se a operacao deixaria `reserva < 0`, ela nao e aplicada:

- `pagar saldo` acima do que a reserva cobre: `pagamentoValido` devolve
  `false`, o botao fica desabilitado e a UI mostra em vermelho quanto falta.
- A devolucao so aumenta a reserva; a guarda em `devolver` existe por
  seguranca caso a reserva ja esteja negativa por ajuste manual.

## Consequencias

- `saldo` passa a ser sempre `>= 0` nas operacoes do app (ajuste manual ainda
  pode deixar negativo, por ser uma correcao explicita).
- `pagar reserva` e `pagar saldo2` seguem a ADR-0008: aceitam excedente e
  podem ficar negativos.
- `total` continua `saldo + saldo2`: o emprestado e uma divida interna entre
  saldo e reserva, nao altera o total.
- Novo `MovimentoTipo` `devolucao`, com `campo = null` e `valor` igual ao
  devolvido. O rotulo e "Devolucao para a reserva".
- Persistencia: coluna `emprestado` em `estado` e `estados_historico`.
  Bancos antigos recebem `ALTER TABLE ... ADD COLUMN emprestado REAL NOT NULL
  DEFAULT 0`, e movimentos antigos (JSON sem o campo) sao lidos como `0`.
- O campo fica fora dos ajustes manuais de proposito: editar a divida sem
  mover saldo/reserva quebraria a invariante.
