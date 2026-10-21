# Contas

Porte de uma planilha Excel de controle financeiro para webapp.

O app controla dois saldos (Conta 1 e Conta 2) com um valor total em comum,
divide a diferença entre as entradas pelo percentual configurado, registra
pagamentos e calcula tudo automaticamente conforme o usuário digita.

## Stack

- Vite 8 + React 19 + TypeScript 6
- oxlint (lint) e vitest (testes)
- Servidor Node sem dependências (`node:http` + `node:sqlite`) que serve o
  `dist/` e uma API JSON
- Banco de dados SQLite em `contas.db`
- Autenticação por token bearer validado no servidor (`BEARER_TOKEN` no `.env`)

## Como rodar

```bash
npm install
npm run start    # producao local: gera o build e sobe o servidor em http://localhost:4173
npm run api      # sobe apenas o servidor (usa o dist/ ja gerado)
npm run build    # apenas o build de producao (tsc + vite build) em dist/
npm run lint     # lint
npm test         # testes
```

### Desenvolvimento

O frontend e o servidor rodam separados:

```bash
npm run dev      # Vite em http://localhost:5173 (proxy de /api)
npm run dev:api  # servidor/API em http://localhost:4173
```

## Banco de dados

Os dados ficam em `contas.db` na raiz do projeto (SQLite). Isso tira os dados
do navegador: limpar o navegador não afeta mais os saldos e o histórico.

- **Backup:** pare o servidor e copie o arquivo `contas.db`.
- O caminho pode ser trocado com `DB_PATH`.
- Na primeira execução, se o banco estiver vazio, os dados que estavam no
  `localStorage` são importados automaticamente (mesma origem, porta 4173) e
  as chaves antigas são removidas.
- Ao reiniciar os saldos pelo app, o histórico também é apagado no banco.

## Autenticacao

Defina o token em `.env` (veja `.env.example`):

```
BEARER_TOKEN=seu-token-aqui
```

O token é lido apenas pelo servidor e nunca vai para o JavaScript do cliente.
O login envia o token para `POST /api/sessao`; as demais rotas exigem
`Authorization: Bearer <token>`. O servidor escuta em `127.0.0.1` por padrão
(use `HOST=0.0.0.0` para acessar de outro dispositivo na rede local).

> O nome antigo `VITE_BEARER_TOKEN` ainda é aceito como fallback, mas expõe o
> token no bundle. Prefira `BEARER_TOKEN`.

## Regras de negocio

O contexto completo do projeto (regras da planilha, mapeamento das variáveis,
estrutura de pastas, banco de dados e registro de alterações) está em
**PROJECT_STATUS.md**. As decisões estão em **docs/adr/** e as regras do
agente em **AGENTS.md**.
