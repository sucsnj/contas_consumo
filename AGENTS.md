# AGENTS.md - Regras gerais para agentes de IA

## Objetivo
Este arquivo define as regras a serem seguidas ao trabalhar neste projeto.

## Estrutura
Todo codigo fica em src/. Manter a modularizacao e evitar duplicacao.

## Regras obrigatorias
- Seguir explicitamente boas praticas de programacao.
- Respeitar explicitamente as regras do framework utilizado.
- Priorizar o reuso de codigo, evitar separacao de origem de endpoints.
- Usar modularizacao para melhor legibilidade.
- Comentarios de codigo apenas quando for necessario.
- Evitar criar codigo com PowerShell.
- Nao crie/replique funcionalidades que ja existem.
- Nao duplique regras de negocio.
- Nao tome atitudes destrutivas sensiveis sem antes me consultar.
- Nao altere arquivos que estejam fora do escopo atual da tarefa demandada sem necessidade real.
- Evitar redundancia de logica e codigo.

## Verificacao
- Verificar tipos (TS) quando existir.
- Verificar lint (npm run lint) e build (npm run build) quando aplicavel.
- So dar como terminada uma tarefa depois de concluir suas devidas verificacoes.

## Documentacao
- Atualizar PROJECT_STATUS.md com a situacao atual e futuras modificacoes.
- Manter este AGENTS.md atualizado.
- Documentar o que foi alterado/criado ao final de cada alteracao de agente.
- Dar apenas sugestao de commit (nao commit).

## Comando context
O comando .opencode/command/context.md deve ser usado para trazer contexto completo ao agente.