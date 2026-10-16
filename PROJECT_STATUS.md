# PROJECT_STATUS - Projeto Contas

## 1. Prop�sito

Porte de uma planilha Excel de controle financeiro para um webapp.

A planilha modela o controle de dois saldos contaveis com um valor total em comum entre eles,
al�m de uma calculadora simples e calculos automaticos diarios baseados nas entradas do usuario.

## 2. Stack atual

- Vite 8 + React 19 + TypeScript 6
- oxlint para lint
- Sem backend (frontend only)
- Autenticacao: token bearer via variavel de ambiente VITE_BEARER_TOKEN (.env)

## 3. Estado atual do projeto

### Concluido
- [x] Etapa 1 - Fundacoes: scaffold React TS, tokens CSS da paleta
      (verde, azul, vermelho, amarelo, branco, cinza), variaveis de ambiente,
      estrutura de pastas em src/, PROJECT_STATUS.md, AGENTS.md,
      comando OpenCode "context".
- [x] Etapa 2 - Dominio e engine de calculo: src/types/domain.ts,
      src/lib/calc/engine.ts, src/lib/calc/format.ts e
      src/lib/calc/engine.test.ts (13 testes cobrindo os exemplos da planilha).

### Pendente
- [ ] Etapa 3: store global, persistencia e historico
- [ ] Etapa 4: interface do dashboard (contas, entradas, pagamentos)
- [ ] Etapa 5: calculadora embutida
- [ ] Etapa 6: auth bearer token, integracao final, lint/build/test


## 4. Decisoes de negocio registradas

1. total_contas = valor_disponivel_conta1 + valor_disponivel_conta2.
2. Entrada na conta 1 (deposito, valor_novo_conta1 >= 0):
   valor_diferenca = max(0, valor_novo_conta1 - valor_atual).
   valor_porcentagem1 = valor_diferenca * percentual.
   valor_porcentagem2 = valor_diferenca - valor_porcentagem1.
   valor_atual = valor_atual + valor_porcentagem1.
   valor_reserva = valor_reserva + valor_porcentagem2.
   valor_novo_conta1 = 0.
   valor_disponivel_conta1 = valor_reserva.
3. Entrada na conta 2 (valor_novo_conta2 pode ser negativa):
   valor_disponivel_conta2 = valor_disponivel_conta2 + valor_novo_conta2.
   total_contas = valor_disponivel_conta1 + valor_disponivel_conta2.
4. Pagamento (conta 1 ou conta 2):
   subtrai do valor_disponivel da conta informada e recalcula o total.
5. Calculadora: resultado final arredondado com teto (Math.ceil). Decimais permitidos.
6. Percentual: configuravel (padrao 0.3 / 30%).

## 5. Regras de calculo (origem: planilha)

- percentual = 0.3 (30% por padrao, configuravel).
- valor_porcentagem1 = valor_diferenca * percentual.
- valor_porcentagem2 = valor_diferenca - valor_porcentagem1.

## 6. Estrutura de codigo

src/
  components/  - componentes de UI (conta, entrada, calculadora, badge)
  hooks/       - hooks custom (useDebounce)
  lib/
    auth/      - contexto e token bearer (Etapa 6)
    calc/      - engine de calculo, formatacao e testes
    db/
      queries/ - queries do banco, incluindo historico (Etapa 3)
  pages/       - paginas (dashboard)
  store/       - estado global (context/reducer) (Etapa 3)
  types/       - tipos de dominio
  App.tsx, main.tsx, index.css, vite-env.d.ts

## 7. Documentacao para outros agentes

- Este arquivo (PROJECT_STATUS.md) e o ponto de partida.
- Comando OpenCode "context" carrega o contexto completo.
- Sempre seguir as etapas registradas no STATUS antes de implementar.

## 8. Comandos basicos

- Desenvolvimento: npm run dev
- Build: npm run build
- Lint: npm run lint
- Testes: npm test

## 9. Registro de alteracoes

### Etapa 1 - Fundacoes
- Scaffold: Vite 8 + React 19 + TypeScript 6 + oxlint (create-vite react-ts).
- .env e .env.example com VITE_BEARER_TOKEN; .gitignore ignorando .env.
- src/index.css com design tokens (verde, azul, vermelho, amarelo, branco, cinza)
  e classes base (card, btn, input, badge, grid).
- src/vite-env.d.ts, index.html em pt-BR, src/App.tsx e src/main.tsx.
- Estrutura de pastas criada em src/ e arquivos .opencode/command/context.md,
  PROJECT_STATUS.md e AGENTS.md.

### Etapa 2 - Dominio e engine
- src/types/domain.ts: ContasState, ContaId, Movimento e MovimentoTipo.
- src/lib/calc/engine.ts: regras puras da planilha
  (criarEstadoInicial, preverEntradaConta1, confirmarEntradaConta1,
  preverEntradaConta2, confirmarEntradaConta2, aplicarPagamento,
  definirPercentual, calcularTotalContas, arredondarMoeda).
- src/lib/calc/format.ts: formatacao BRL/pt-BR e parsing de valores digitados.
- src/lib/calc/engine.test.ts: 13 testes (exemplos de 500 e 700 da planilha,
  entradas negativas, percentual customizado, pagamentos).
- vitest instalado e script "test" adicionado ao package.json.

### Observacoes para as proximas etapas
- Valores monetarios sao arredondados para 2 casas (arredondarMoeda).
- Confirmar entrada zera valor_novo_conta1 e a diferenca/percentuais do preview.
- Pagamento em conta 1 subtrai do disponivel; a proxima entrada em conta 1
  redefine valor_disponivel_conta1 = valor_reserva (regra da planilha).
