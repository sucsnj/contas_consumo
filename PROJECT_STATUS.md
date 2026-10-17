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
      src/lib/calc/engine.test.ts (17 testes cobrindo os exemplos da planilha).
- [x] Etapa 3 - Store, persistencia e historico: src/store (reducer, provider,
      contexto e hook), src/lib/db (client e queries), src/hooks/useDebounce.ts.
      Total de 29 testes.
- [x] Etapa 4 - Dashboard: componentes de UI (Badge, CampoValor, CartaoConta,
      CartaoResumo, ConfiguracaoPercentual, ListaHistorico), pagina DashboardPage,
      estilos do dashboard e lucide-react para icones. Total de 34 testes.
- [x] Etapa 5 - Calculadora inline no input de pagamento:
      src/lib/calc/calculadora.ts (parser proprio, sem eval) e
      src/components/PainelPagamento.tsx. Total de 57 testes.
- [x] Etapa 6 - Autenticacao por token bearer (src/lib/auth),
      LoginPage, botao Sair e indicador "Autenticado" no dashboard,
      query de sessao, README e comando context atualizados.
      Total de 61 testes. TSC, lint, testes e build verificados.

### Pendente (proximas etapas, fora do escopo atual)
- [ ] PWA: service worker, manifesto e icones para Windows e Android.
- [ ] Migrar a persistencia de localStorage para IndexedDB
      (offline real e dados para analises).
- [ ] Empacotamento para Windows e Android (ferramentas a decidir).
- [ ] Analises sobre o historico (consultas em src/lib/db/queries).


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

### Mapeamento planilha -> codigo

| Variavel da planilha        | Codigo                                  |
| --------------------------- | ---------------------------------------- |
| valor_atual                 | contas.valorAtual                        |
| valor_reserva               | contas.valorReserva                      |
| valor_disponivel_conta1     | contas.valorDisponivelConta1             |
| valor_disponivel_conta2     | contas.valorDisponivelConta2             |
| total_contas                | contas.totalContas                       |
| percentual                  | contas.percentual                        |
| valor_novo_conta1/2         | previa.valor (entrada em digitacao)       |
| valor_diferenca             | previa.diferenca                         |
| valor_porcentagem1 / 2      | previa.valorPorcentagem1 / 2             |

- `contas` guarda somente valores confirmados; `previa` guarda o resultado da
  entrada que esta sendo digitada (atualizada com debounce).
- Nenhum valor de `contas` muda antes da confirmacao, evitando contagem dupla.
- Ao confirmar, a entrada e zerada (como na planilha) e um Movimento
  (historico) e gravado com o estado antes e depois.

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
- src/types/domain.ts: ContasState, PreviaEntrada, ContaId, Movimento e MovimentoTipo.
- src/lib/calc/engine.ts: regras puras da planilha
  (criarEstadoInicial, previaEntradaConta1, previaEntradaConta2,
  confirmarEntradaConta1, confirmarEntradaConta2, aplicarPagamento,
  definirPercentual, calcularTotalContas, arredondarMoeda).
- src/lib/calc/format.ts: formatacao BRL/pt-BR e parsing de valores digitados.
- src/lib/calc/engine.test.ts: 17 testes (exemplos de 500 e 700 da planilha,
  entradas negativas, percentual customizado, pagamentos).
- vitest instalado e script "test" adicionado ao package.json.

### Etapa 3 - Store, persistencia e historico
- src/store/reducer.ts: reducer com acoes (hidratar, preverEntrada, limparPrevia,
  confirmarEntradaConta1/2, pagamento, percentual, reiniciar) e geracao de Movimento.
- src/store/contasContext.ts, ContasProvider.tsx e useContas.ts.
  O provider hidrata do banco, persiste o estado atual e grava cada Movimento novo.
- src/lib/db/client.ts: primitiva de armazenamento (localStorage com fallback
  em memoria) - pronta para ser trocada por IndexedDB na etapa de PWA.
- src/lib/db/queries/estado.ts e historico.ts: queries do banco, com validacao
  dos dados lidos (obterEstado, persistirEstado, obterHistorico,
  registrarMovimento, obterHistoricoDaConta, limparHistorico).
- src/hooks/useDebounce.ts: debounce generico (300ms por padrao).
- Testes: reducer.test.ts (8) e historico.test.ts (4). Total geral: 29 testes.
- App.tsx ligado ao ContasProvider com resumo provisorio (status e total).

### Etapa 4 - Dashboard
- src/lib/situacao.ts: tom e rotulo de situacao (verde/vermelho/cinza).
- src/components/Badge.tsx: indicador de situacao reaproveitado.
- src/components/CampoValor.tsx: input de valor reutilizavel (Enter confirma).
- src/components/CartaoConta.tsx: cartao por conta com entrada, previa
  (debounce de 300ms), registro de entrada, pagamento e nota da reserva.
- src/components/CartaoResumo.tsx: cards de total, valor atual e reserva.
- src/components/ConfiguracaoPercentual.tsx: percentual configuravel (0 a 100).
- src/components/ListaHistorico.tsx: ultimos 8 movimentos com icone, valor e total.
- src/pages/DashboardPage.tsx: composicao da pagina, botao Reiniciar com
  confirmacao e estado de carregamento.
- src/App.tsx: ContasProvider + DashboardPage.
- src/index.css: secoes de estilo do dashboard (cores de situacao, previa,
  historico, layout responsivo por grid).
- lucide-react instalado para icones.
- Testes: App.test.tsx e DashboardPage.test.tsx (render estatico, sem DOM extra).

### Etapa 5 - Calculadora
- src/lib/calc/calculadora.ts: regras puras da calculadora inline.
  inserirTecla (aceita apenas numeros, sinais, parenteses e separador decimal;
  um sinal substitui o sinal pendente; "(" depois de numero vira "*(";
  um separador decimal por numero; parenteses balanceados; limite de 40),
  sanitizarExpressao (aplica as regras de tecla sobre o texto inteiro),
  apagarTecla, calcular (tokenizador + algoritmo shunting-yard, sem eval) e
  calcularResultado (arredonda para cima com Math.ceil).
- src/components/PainelPagamento.tsx: a calculadora e o proprio input do
  pagamento. O usuario digita a expressao direto no campo; cada tecla e
  sanitizada, o resultado aparece abaixo em tempo real (debounce de 300ms) e
  "Confirmar pagamento" usa o valor ja arredondado para cima.
- src/components/CampoValor.tsx: input reutilizavel (Enter confirma).
- Estilos: secao "Pagamento com expressao inline" em src/index.css.
- Nao existe keypad nem popup de calculadora: a logica e 100% inline no input.
- Testes: calculadora.test.ts (21) e PainelPagamento.test.tsx (3).
  Total geral: 57 testes.

### Etapa 6 - Autenticacao e integracao final
- src/lib/auth/token.ts: le VITE_BEARER_TOKEN do .env, valida o token digitado
  e monta o cabecalho "Authorization: Bearer <token>" (util para quando
  houver API no futuro).
- src/lib/auth/contextoAuth.ts, AuthProvider.tsx e useAuth.ts: sessao simples
  com estados carregando / nao-autenticado / autenticado, sessao salva no
  navegador e revalidada contra o .env ao abrir o app.
- src/lib/db/queries/sessao.ts: obterTokenSalvo, salvarToken, limparToken.
- src/pages/LoginPage.tsx: tela de acesso com campo de token, aviso de token
  invalido e aviso quando VITE_BEARER_TOKEN nao esta definido.
- src/components/IndicadorCarregamento.tsx: unifica a tela de carregamento
  usada pelo App e pelo DashboardPage.
- src/App.tsx: AuthProvider -> LoginPage ou ContasProvider + DashboardPage.
- DashboardPage: badge "Autenticado" e botao "Sair".
- README.md e .opencode/command/context.md atualizados.
- Testes: token.test.ts (3) e DashboardPage.test.tsx ajustado (5).
  Total geral: 61 testes. TSC, lint, testes e build verificados.

### Observacoes para as proximas etapas
- Previa e confirmacao sao acoes distintas: digitar mostra a previa, o botao
  (ou Enter) confirma e zera o campo.
- Ao reiniciar, o historico persistido tambem e limpo.
- Pagamento em conta 1 subtrai do disponivel; a proxima entrada em conta 1
  redefine valor_disponivel_conta1 = valor_reserva (regra da planilha).
- A calculadora nunca usa eval/Function: o parser e proprio (shunting-yard).
- A autenticacao e de nivel simples e validada no cliente (nao ha backend).
  Para uma API real, use cabecalhoAuthorization() nas requisicoes.
- A persistencia usa localStorage com fallback em memoria; a troca por
  IndexedDB deve passar por src/lib/db/client.ts e src/lib/db/queries.
