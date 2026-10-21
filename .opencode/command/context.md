---
description: Carrega o contexto completo do projeto Contas para outros agentes de IA
---

# Contexto do Projeto - Contas

Leia este arquivo e os documentos abaixo ANTES de qualquer alteracao no projeto:

1. PROJECT_STATUS.md (raiz do projeto) - situacao atual, decisoes de negocio,
   mapeamento planilha -> codigo, estrutura de pastas, banco de dados e
   registro de alteracoes.
2. AGENTS.md - regras obrigatorias para agentes de IA.
3. docs/adr/ e docs/GLOSSARIO.md - decisoes e terminologia do dominio.
4. src/ - app (components, hooks, lib/auth, lib/calc, lib/db, pages, store,
   types) e servidor em src/server (repositorio SQLite, api, servidor).

Regras do agente:

- Nao implementar funcionalidades sem atualizar o PROJECT_STATUS.md.
- Nao duplicar regras de negocio: as regras da planilha vivem em src/lib/calc/engine.ts
  e as regras da expressao/calculadora em src/lib/calc/calculadora.ts.
- A persistencia e SQLite (src/server/repositorio.ts); o cliente fala HTTP por
  src/lib/db/http.ts. Nao introduzir persistencia paralela no navegador.
- Reutilizar componentes e hooks existentes antes de criar novos.
- Verificar com npm run lint, npm test e npm run build antes de concluir.
- Documentar alteracoes ao final e sugerir commit (sem commitar).

Estado atual: etapas 1 a 7 concluidas (fundacoes, engine, store/persistencia,
dashboard, calculadora inline, autenticacao por token bearer e banco SQLite com
servidor proprio).
Proximos passos previstos: PWA com service worker, backup/exportacao e
empacotamento.

Comandos uteis:

- npm run dev - API + Vite no mesmo processo (proxy de /api)
- npm run dev:api - so a API (npx vite sobe so o frontend)
- npm run build - build de producao
- npm run start - build + servidor local em http://localhost:4173
- npm run api - sobe apenas o servidor
- npm run lint - lint
- npm test - testes
