# ADR-0009: Persistencia em SQLite local com servidor proprio

- Status: aceito
- Data: 2026-10-18
- Substitui: a decisao "sem backend, persistencia no navegador" da Etapa 1

## Contexto

Ate aqui o app era frontend-only e gravava tudo em `localStorage`. Esse
armazenamento pode ser apagado pelo navegador (limpeza de dados, modo privado,
troca de navegador ou de porta de origem) sem qualquer aviso, nao tem backup
natural e nao oferece durabilidade. Para um controle financeiro isso significa
perda irreversivel dos saldos e do historico.

O app roda em um unico computador (producao local) e precisa de um arquivo real
que possa ser copiado como backup.

## Decisao

O projeto passa a ter um servidor HTTP proprio, sem dependencias externas:

- `src/server/iniciar.ts` abre o banco e sobe o servidor;
- `src/server/servidor.ts` serve o `dist/` e delega `/api/*` para a API;
- `src/server/api.ts` responde em JSON e exige token bearer;
- `src/server/repositorio.ts` concentra o acesso ao SQLite.

O banco e o SQLite embutido do Node (`node:sqlite`), gravado em `contas.db`
(ou no caminho de `DB_PATH`). O esquema e relacional, nao chave-valor:

```
estado              -- linha unica com saldo, saldo2, reserva, porcentagem1
estados_historico   -- os snapshots usados pelo desfazer (maximo 3 no cliente)
movimentos          -- historico completo, com antes/depois em JSON
```

O servidor usa `journal_mode = DELETE` e `synchronous = FULL`: em repouso
existe apenas um arquivo `.db` e cada gravacao vai para o disco. Backup =
copiar `contas.db` com o servidor parado.

### Autenticacao

O token deixa de ir no bundle. Ele fica em `BEARER_TOKEN` no `.env`, lido
apenas pelo servidor. `POST /api/sessao` valida o token digitado; as demais
rotas exigem `Authorization: Bearer <token>`. Sem `BEARER_TOKEN`, a API
responde 503 e o app avisa no login.

### Cliente

`src/lib/db/http.ts` centraliza o `fetch` com o bearer; as queries
(`src/lib/db/queries/*`) trocaram `localStorage` por chamadas HTTP e mantiveram
a mesma assinatura assincrona, entao store e componentes nao mudaram.
`localStorage` guarda somente o token da sessao.

`src/lib/db/validacao.ts` concentra a validacao de formato usada tanto pelo
servidor (entrada da API) quanto pela migracao, sem duplicar regra.

### Migracao dos dados antigos

O servidor responde na mesma porta que o `vite preview` usava (4173), entao a
origem `http://localhost:4173` e a mesma do modelo antigo. Na primeira carga,
se o banco estiver vazio, `src/lib/db/migracao.ts` importa o estado, os
snapshots e os movimentos do `localStorage` e apaga as chaves antigas.

## Consequencias

- O app deixa de ser frontend-only: `npm run start` agora builda e sobe o
  servidor; `npm run api` sobe so o servidor.
- `npm run dev` continua sendo o Vite, com proxy de `/api` para o servidor;
  rode `npm run dev:api` em outro terminal.
- A API so escuta em `127.0.0.1` por padrao (`HOST` muda isso).
- O token deixa de estar exposto no JavaScript do cliente.
- `src/lib/db/client.ts` (localStorage) permanece apenas para a sessao e para
  a migracao.
- O item pendente "migrar para IndexedDB" deixa de fazer sentido.
