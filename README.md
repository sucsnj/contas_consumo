# Contas

Porte de uma planilha Excel de controle financeiro para webapp.

O app controla dois saldos (Conta 1 e Conta 2) com um valor total em comum,
divide a diferença entre as entradas pelo percentual configurado, registra
pagamentos e calcula tudo automaticamente conforme o usuário digita.

## Stack

- Vite 8 + React 19 + TypeScript 6
- oxlint (lint) e vitest (testes)
- Sem backend: persistência local no navegador
- Autenticação simples por token bearer (VITE_BEARER_TOKEN no `.env`)

## Como rodar

```bash
npm install
npm run dev      # desenvolvimento (HMR)
npm run start    # producao local: gera o build e serve em http://localhost:4173
npm run build    # apenas o build de producao (tsc + vite build) em dist/
npm run preview  # apenas serve o dist/ ja gerado
npm run lint     # lint
npm test         # testes
```

## Autenticacao

Defina o token em `.env` (veja `.env.example`):

```
VITE_BEARER_TOKEN=seu-token-aqui
```

A sessao fica salva no navegador. Como o app nao possui backend, essa e uma
autenticacao de nivel simples: o token e validado no cliente.

## Regras de negocio

O contexto completo do projeto (regras da planilha, mapeamento das variaveis,
estrutura de pastas e registro de alteracoes) esta em **PROJECT_STATUS.md**.
As regras do agente estao em **AGENTS.md**.
