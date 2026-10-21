# PROJECT_STATUS - Projeto Contas

## 1. Propósito

Porte de uma planilha Excel de controle financeiro para um webapp.

A planilha modela o controle de dois saldos contaveis com um valor total em comum entre eles,
alem de uma calculadora simples e calculos automaticos diarios baseados nas entradas do usuario.

## 2. Stack atual

- Vite 8 + React 19 + TypeScript 6
- oxlint para lint
- Servidor Node sem dependencias servindo o `dist/` e a API JSON
- Banco: SQLite embutido do Node (`node:sqlite`), arquivo `contas.db` (ADR-0009)
- Autenticacao: token bearer validado no servidor (`BEARER_TOKEN` no `.env`)

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
- [x] Etapa 7 - Banco de dados local (ADR-0009): servidor Node proprio em
      src/server (repositorio SQLite, api, servidor e iniciar), API JSON com
      token bearer validado no servidor, cliente HTTP em src/lib/db/http.ts,
      validacao compartilhada em src/lib/db/validacao.ts, migracao automatica
      do localStorage e tratamento de falha de carregamento. 91 testes.

### Pendente (proximas etapas, fora do escopo atual)
- [ ] Reformulacao do modelo de dominio (ver secao 10): engine, store, UI,
      historico de 3 estados, desfazer em 5s e ajustes inline.
- [ ] PWA: service worker, manifesto e icones para Windows e Android.
- [ ] Backup automatico do `contas.db` e exportacao/importacao em JSON.
- [ ] Empacotamento para Windows e Android (ferramentas a decidir).
- [ ] Analises sobre o historico (consultas em src/server/repositorio.ts).

## 10. Reformulacao do modelo de dominio

O modelo de negocio foi reformulado. Decisoes registradas em
`docs/adr/` e terminologia em `docs/GLOSSARIO.md`.

Regras vigentes da entrada e dos pagamentos: `docs/adr/0007-entrada-como-alvo-da-reserva.md`
e `docs/adr/0008-pagamento-com-saldo-negativo.md`.

Estado: `saldo`, `saldo2`, `reserva`, `porcentagem1` (padrao 0.3).
`total = saldo + saldo2` (a reserva **nao** entra no total).

- `entrada` e o saldo **desejado** da conta 1 (nao e deposito):
  `diferenca = max(0, entrada - reserva)`; 30% da diferenca vai para a
  reserva e 70% para o saldo; a confirmacao aplica `novo_reserva`,
  `novo_saldo`, zera `entrada` e recalcula `total`.
  A entrada so pode ser confirmada quando `entrada >= reserva`.
- `entrada2` e o valor **absoluto** do novo `saldo2` (substitui).
- Previa em tempo real antes de confirmar.
- Calculadora inline nos inputs (sem keypad), resultado com duas casas
  decimais (nunca arredondado para inteiro).
- Tres pagamentos a partir do resultado: `pagar_saldo`, `pagar_reserva`,
  `pagar_saldo2`; o valor pode ser **maior que o existente** e o campo
  pode ficar negativo (`saldo = 1000`, pagar `1500` deixa `-500`).
  Unica restricao: o valor precisa ser positivo e finito.
- Desfazer: botao flutuante por 5s apos qualquer operacao.
- Historico: no maximo 3 estados, persistido, com data/hora; reverter
  nao cria novo estado.
- Ajustes inline por campo (saldo, saldo2, reserva, porcentagem1).
- Migracao automatica dos dados salvos do modelo antigo.


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
   No pagamento do saldo da conta 1, se o valor passar do saldo, a reserva
   cobre a diferenca e essa diferenca vira divida (emprestado):
   emprestimo = min(0, saldo - valor); saldo = max(0, saldo - valor);
   reserva = reserva + emprestimo; emprestado = emprestado + emprestimo.
   Se a reserva nao cobrir, o pagamento nao e realizado (aviso em vermelho).
5. Devolucao: com emprestado < 0, cede min(saldo, -emprestado) do saldo para
   a reserva e reduz o emprestado ate zero (parcial quando o saldo nao cobre).
6. Calculadora: resultado final com duas casas decimais, sem arredondamento
   para inteiro. Decimais permitidos.
7. Percentual: configuravel (padrao 0.3 / 30%).

### Mapeamento planilha -> codigo

| Variavel da planilha        | Codigo                                  |
| --------------------------- | ---------------------------------------- |
| valor_atual                 | contas.valorAtual                        |
| valor_reserva               | contas.valorReserva                      |
| valor_disponivel_conta1     | contas.valorDisponivelConta1             |
| valor_disponivel_conta2     | contas.valorDisponivelConta2             |
| total_contas                | contas.totalContas                       |
| percentual                  | contas.percentual                        |
| (novo) divida com a reserva | contas.emprestado                        |
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
- emprestado = soma dos excedentes de pagamentos do saldo cobertos pela
  reserva (negativo ate a devolucao).

## 6. Estrutura de codigo

src/
  components/  - componentes de UI (conta, entrada, pagamentos, calculadora, badge)
  hooks/       - hooks custom (useDebounce)
  lib/
    auth/      - contexto e validacao do token (Etapa 6/7)
    calc/      - engine de calculo, formatacao e testes
    db/
      client.ts      - armazenamento do navegador (somente sessao + migracao)
      http.ts        - fetch da API com bearer
      migracao.ts    - importacao unica do localStorage para o SQLite
      validacao.ts   - validacao de formato compartilhada
      queries/       - chamadas HTTP (estado, estados, movimentos, sessao)
  pages/       - paginas (dashboard, login)
  server/      - servidor Node + SQLite (Etapa 7)
    repositorio.ts - esquema e acesso ao banco
    api.ts         - rotas /api, JSON e bearer
    servidor.ts    - HTTP + arquivos estaticos do dist/
    iniciarApi.ts  - env, banco e listen (reutilizado pelos entrypoints)
    iniciar.ts     - entrypoint de producao (npm run api)
    desenvolvimento.ts - entrypoint de dev (API + Vite)
  store/       - estado global (context/reducer) (Etapa 3)
  types/       - tipos de dominio
  App.tsx, main.tsx, index.css, vite-env.d.ts

## 7. Documentacao para outros agentes

- Este arquivo (PROJECT_STATUS.md) e o ponto de partida.
- Comando OpenCode "context" carrega o contexto completo.
- Sempre seguir as etapas registradas no STATUS antes de implementar.

## 8. Comandos basicos

- Desenvolvimento: npm run dev (sobe a API e o Vite, com proxy de /api)
- Apenas a API: npm run dev:api (npx vite sobe apenas o frontend)
- Build: npm run build
- Producao local: npm run start (gera o build e sobe o servidor em 4173)
- Somente servidor/API: npm run api
- Lint: npm run lint
- Testes: npm test
- Banco: `contas.db` na raiz (ou `DB_PATH`); backup = copiar com o servidor parado

## 9. Registro de alteracoes

### Etapa 1 - Fundacoes
- Scaffold: Vite 8 + React 19 + TypeScript 6 + oxlint (create-vite react-ts).
- .env e .env.example com VITE_BEARER_TOKEN; .gitignore ignorando .env.
  (Na Etapa 7 o nome passou a ser BEARER_TOKEN no servidor.)
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
  em memoria) - substituida pelo SQLite na Etapa 7 (hoje serve so a sessao).
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
  houver API no futuro). Na Etapa 7 a validacao passou para o servidor
  (BEARER_TOKEN) via POST /api/sessao.
- src/lib/auth/contextoAuth.ts, AuthProvider.tsx e useAuth.ts: sessao simples
  com estados carregando / nao-autenticado / autenticado, sessao salva no
  navegador e revalidada contra o .env ao abrir o app.
- src/lib/db/queries/sessao.ts: obterTokenSalvo, salvarToken, limparToken.
- src/pages/LoginPage.tsx: tela de acesso com campo de token, aviso de token
  invalido e aviso quando o token do servidor nao esta definido (Etapa 7).
- src/components/IndicadorCarregamento.tsx: unifica a tela de carregamento
  usada pelo App e pelo DashboardPage.
- src/App.tsx: AuthProvider -> LoginPage ou ContasProvider + DashboardPage.
- DashboardPage: badge "Autenticado" e botao "Sair".
- README.md e .opencode/command/context.md atualizados.
- Testes: token.test.ts (3) e DashboardPage.test.tsx ajustado (5).
  Total geral: 61 testes. TSC, lint, testes e build verificados.

### Ajuste de regra - entrada e pagamento com saldo negativo
- Regra da entrada: `diferenca = max(0, entrada - reserva)` (antes
  `entrada - saldo`) e validacao `entrada >= reserva`. O codigo ja usava
  `reserva`; testes e documentacao foram alinhados.
- Regra do pagamento: `pagar saldo`, `pagar reserva` e `pagar saldo2` aceitam
  valor maior que o existente e deixam o campo negativo. A validacao ficou
  apenas no valor (positivo e finito).
- src/lib/calc/engine.ts: `pagamentoPossivel(valor)` nao recebe mais o estado;
  nova funcao pura `saldoAposPagamento(estado, destino, valor)` devolve o valor
  resultante e `pagar` passa a aplica-la.
- src/components/EntradaCalculo.tsx: o botao de pagamento nunca e desabilitado e
  mostra o saldo resultante (classe `btn-negativo` quando negativo).
- src/index.css: `.btn-saldo-restante` e `.btn-negativo`.
- docs/adr/0007-entrada-como-alvo-da-reserva.md e
  docs/adr/0008-pagamento-com-saldo-negativo.md criados; ADR-0002 e ADR-0003
  marcadas como substituidas na parte afetada.
- docs/GLOSSARIO.md: `entrada`, `diferenca` e as tres linhas de pagamento
  atualizadas; nova entrada `saldoAposPagamento`.
- Testes: engine.test.ts (24) e reducer.test.ts (13) ajustados para as novas
  regras. Total geral: 76 testes. TSC, lint, testes e build verificados.

### Ajuste de regra - calculadora sem arredondamento para inteiro
- O teto `Math.ceil` do resultado da calculadora foi removido: `1000/3`
  deixou de virar 334 e passou a valer `333.33`.
- `calcularResultado` (src/lib/calc/calculadora.ts) agora reaproveita
  `arredondarMoeda` do engine, mantendo **duas casas decimais** como unica
  precisao do app. Nenhum outro arredondamento para inteiro existe em src/.
- Toda escrita de estado segue passando por `arredondarMoeda` (previa,
  confirmacao, pagamento, ajuste e total), entao os valores salvos continuam
  com no maximo duas casas decimais.
- docs/adr/0004-calculadora-inline.md, docs/adr/0003-pagamentos.md,
  docs/GLOSSARIO.md e as secoes 4 e 10 deste arquivo atualizados.
- Testes: calculadora.test.ts ajustado. Total geral: 76 testes.
  TSC, lint, testes e build verificados.

### Etapa 7 - Banco de dados local em SQLite
- Motivacao: localStorage pode ser apagado pelo navegador sem aviso; perda
  irreversivel para um controle financeiro (ADR-0009).
- src/server/repositorio.ts: SQLite via `node:sqlite` (sem dependencia),
  esquema `estado`, `estados_historico` e `movimentos`, journal DELETE e
  sincronizacao FULL (um unico arquivo `.db` em repouso).
- src/server/api.ts: API JSON com `POST /api/sessao`, `GET/PUT /api/estado`,
  `GET/PUT /api/estados`, `GET/POST/DELETE /api/movimentos`, limite de corpo,
  validacao de payload e bearer com `timingSafeEqual`.
- src/server/servidor.ts + iniciar.ts: serve `dist/`, fallback da SPA e sobe
  em `127.0.0.1:4173` (`PORT`, `HOST` e `DB_PATH` configuraveis).
- src/lib/db/http.ts: fetch central com o bearer; as queries
  (estado, estados, movimentos) trocaram localStorage por HTTP mantendo a
  assinatura, sem mudar store nem componentes.
- src/lib/db/validacao.ts: validacao de formato compartilhada entre servidor
  e migracao (elimina a duplicacao que existia em queries/estado.ts).
- src/lib/db/migracao.ts: na primeira carga, com o banco vazio, importa o
  estado, os snapshots e os movimentos do localStorage (mesma origem, 4173) e
  apaga as chaves antigas.
- Autenticacao: `VITE_BEARER_TOKEN` sai do bundle; o servidor usa
  `BEARER_TOKEN` (aceita o nome antigo com aviso). Login agora valida via
  `POST /api/sessao`; a sessao continua no navegador.
- ContasProvider: status `erro` quando o servidor nao responde (o dashboard
  avisa e nao grava nada por cima) e limpeza dos movimentos no servidor ao
  reiniciar.
- Config: proxy de `/api` no vite.config.ts, tsconfig.server.json, scripts
  `api`/`dev:api`/`start`, `.gitignore` com `*.db` e `.env.example`
  atualizado.
- Testes: validacao.test.ts, repositorio.test.ts, api.test.ts e token.test.ts
  reescrito; removidos queries.test.ts e estado.test.ts (cobertura migrou para
  os testes da API e da validacao). Total geral: 91 testes.
  TSC, lint, testes, build e teste manual do servidor verificados.

### Correcao - modo de desenvolvimento sem a API
- Sintoma: com `npm run dev` o login respondia "Token invalido" e o Vite
  logava `connect ECONNREFUSED 127.0.0.1:4173`, porque o proxy apontava para
  uma API que nao estava rodando.
- src/server/iniciarApi.ts: extracao de env + banco + listen de iniciar.ts,
  agora reutilizado por dois entrypoints. Fecha o banco se a porta falhar.
- src/server/desenvolvimento.ts: sobe a API e o Vite no mesmo processo, com o
  proxy apontando para a porta real da API e encerramento conjunto.
- src/server/iniciar.ts: virou o entrypoint fino de producao.
- `npm run dev` passou a subir os dois; `npx vite` continua servindo apenas o
  frontend e `npm run dev:api` apenas a API.
- src/lib/auth/token.ts: novo resultado `servidor-indisponivel` (falha de rede
  ou 5xx do proxy). LoginPage mostra "Servidor indisponivel" em vez de "Token
  invalido", e o AuthProvider nao apaga mais o token salvo nesse caso.
- vite.config.ts: proxy usa `PORT` quando definido.
- Testes: token.test.ts cobre falha de rede e 500 do proxy; api.test.ts cobre
  JSON invalido em /api/sessao (antes caia em 500). Total: 93 testes.

### Regra - Emprestado e devolucao (ADR-0010)
- Novo campo `emprestado` em `ContasState`: divida da conta 1 com a reserva,
  sempre `<= 0`, fora do `total` e sem edicao manual.
- `pagar saldo` acima do saldo consome a reserva e registra o excedente em
  `emprestado` (ex.: 150/500/0, pagar 200 -> 0/450/-50). O saldo nunca fica
  negativo por pagamento.
- `pagamentoValido` bloqueia quando a reserva nao cobre o excedente; a UI
  desabilita o botao e mostra em vermelho quanto falta.
- Botao "Devolucao": aparece junto dos botoes de pagar, com a mesma condicao
  (valor valido digitado), e fica clicavel quando `emprestado < 0` e
  `saldo > 0`. Cede `min(saldo, -emprestado)` do saldo para a reserva, com
  devolucao parcial quando o saldo nao cobre.
- src/lib/calc/engine.ts: `reservaNecessaria`, `pagamentoValido`,
  `saldoAposPagamento` (saldo limitado a zero), `pagar`, `valorDevolucao`,
  `devolucaoPossivel` e `devolver`. `arredondarMoeda` normaliza `-0`.
- Store: acao `devolver` e tipo de movimento `devolucao`; ESTADO_INICIAL e
  reiniciar agora usam `criarEstadoInicial` (sem duplicar o estado vazio).
- UI: card "Emprestado" no resumo, icone/rotulo do movimento, emprestado no
  historico de estados e aviso da reserva no pagamento do saldo. Os botoes de
  pagar e a devolucao foram extraidos para `src/components/PagamentosRapidos.tsx`.
- Persistencia: coluna `emprestado` em `estado` e `estados_historico`, com
  `ALTER TABLE` para bancos existentes; movimentos antigos (JSON sem o campo)
  sao lidos como zero. `validarContas` assume zero quando o campo falta.
- docs/adr/0010-emprestado-e-devolucao.md criado; ADR-0008 marcada como
  substituida para o saldo; GLOSSARIO atualizado.
- Testes: engine, reducer, validacao, repositorio, api, dashboard e o novo
  PagamentosRapidos cobrem os fluxos. Total: 114 testes.

### Observacoes para as proximas etapas
- Previa e confirmacao sao acoes distintas: digitar mostra a previa, o botao
  (ou Enter) confirma e zera o campo.
- Ao reiniciar, o historico persistido tambem e limpo.
- `pagar reserva` e `pagar saldo2` ainda podem deixar o campo negativo;
  `pagar saldo` nunca deixa: o excedente vira `emprestado` e sai da reserva.
- O `total` e sempre `saldo + saldo2`; `reserva` e `emprestado` ficam fora.
- A calculadora nunca usa eval/Function: o parser e proprio (shunting-yard).
- A autenticacao e validada no servidor (ADR-0009); o token do `.env` nunca
  vai para o bundle. Para chamadas manuais, use `cabecalhoAuthorization()`.
- A persistencia e o SQLite (`contas.db`); `localStorage` guarda apenas o
  token da sessao e serve a migracao unica dos dados antigos.
