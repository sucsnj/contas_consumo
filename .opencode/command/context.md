---
description: Carrega o contexto completo do projeto Contas para outros agentes de IA
---

# Contexto do Projeto - Contas

Leia este arquivo e os documentos abaixo ANTES de qualquer alteracao no projeto:

1. PROJECT_STATUS.md (raiz do projeto) - situacao atual, decisoes de negocio,
   mapeamento planilha -> codigo, estrutura de pastas e registro de alteracoes.
2. AGENTS.md - regras obrigatorias para agentes de IA.
3. src/ - codigo (components, hooks, lib/auth, lib/calc, lib/db/queries, pages, store, types).

Regras do agente:

- Nao implementar funcionalidades sem atualizar o PROJECT_STATUS.md.
- Nao duplicar regras de negocio: as regras da planilha vivem em src/lib/calc/engine.ts
  e as regras da expressao/calculadora em src/lib/calc/calculadora.ts.
- Reutilizar componentes e hooks existentes antes de criar novos.
- Verificar com npm run lint, npm test e npm run build antes de concluir.
- Documentar alteracoes ao final e sugerir commit (sem commitar).

Estado atual: etapas 1 a 6 concluidas (fundacoes, engine, store/persistencia,
dashboard, calculadora inline e autenticacao por token bearer).
Proximos passos previstos: PWA com service worker, IndexedDB e empacotamento.

Comandos uteis:

- npm run dev - servidor de desenvolvimento
- npm run build - build de producao
- npm run lint - lint
- npm test - testes

