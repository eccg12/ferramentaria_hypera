# FerraMon — especificação do produto

Complemento do `CLAUDE.md`. Aqui está o que cada tela mostra e como ela se comporta.
As regras de honestidade do `CLAUDE.md` valem em todas elas.

---

## 0. Estrutura da aplicação

### Casca (shell)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ FerraMon  Ferramentaria Guiada por Dados      [perfil ▾]   ⚠ demonstrativo   │  56px
├────┬─────────────────────────────────────────────────────────────────────────┤
│ 01 │                                                                          │
│ 02 │                      área de trabalho do agente                          │
│ 03 │                                                                          │
│ 04 │                                                                          │
│ 05 │                                                                          │
│ ── │                                                                          │
│ ▶  │                                                                          │
├────┴─────────────────────────────────────────────────────────────────────────┤
│ Vertex AI Vision · BigQuery · Agent Engine   — nomes a confirmar com o Google │  28px
└──────────────────────────────────────────────────────────────────────────────┘
 72px
```

- **Cabeçalho:** marca à esquerda; seletor de perfil; selo de ambiente demonstrativo à
  direita, em `--atencao`, sempre visível.
- **Trilho esquerdo (72px):** os cinco agentes, ícone + número. O 05 aparece com cadeado. Um
  divisor e, abaixo, o botão de roteiro guiado. Ao passar o mouse, o trilho expande para
  240px mostrando nome e fase de cada agente.
- **Rodapé (28px):** rodapé técnico com os produtos Google usados naquela tela, lido de
  `agentes[].stack`, seguido da ressalva.

### Perfis

Lidos de `perfis`. Trocar o perfil **filtra o trilho** (agentes que aquele perfil não usa
ficam esmaecidos, não somem) e troca a linha de contexto abaixo do nome do agente. Não
esconda conteúdo por perfil: a demo precisa navegar livre. O perfil ativo aparece no bloco de
decisão como autor do registro.

### Componentes base

| Componente | Uso |
|---|---|
| `ChipFase` | `Fase 2 · Degrau 3` — obrigatório em todo painel com número derivado |
| `SeloVeredito` | carimbo de estado: NOVO / OK / DESGASTADO / DANIFICADO, cor semântica |
| `Cota` | valor em Plex Mono + nominal ± tolerância + status colorido |
| `Fio` | divisor de 1px em `--linha` |
| `PainelLeitura` | coluna contínua de blocos separados por `Fio`, sem gaps de cartão |
| `BlocoDecisao` | usuário, ação, hora, observação; registra no estado global |
| `Legenda` | as 5 cores semânticas, igual à imagem conceito |

---

## 1. Agente de Visão — `/visao` (o centro da demo)

Duas colunas: bancada à esquerda (fluida, mínimo 60%), painel de leitura à direita (380px
fixos). Acima da bancada, uma barra fina de identificação do item.

### 1.1 Barra de identificação

`FS-0192 · Placa de selagem · P-19 / G2 / BL-04 · formato NEO-4x8 · posição SEL-A`
À direita: `Captura 07/09/2026 14:32 · Rig EMB-01 (backlight + telecêntrica) · calibração
LOC-2026-0413 válida até 28/02/2027`.

A calibração rastreável precisa estar visível. É o que faz a medição valer para a Qualidade.

### 1.2 Bancada

A foto `/assets/placa-FS-0192.jpg` (2000×1132) preenchendo a área, com zoom (roda do mouse,
0,8× a 4×) e arrasto. Botão de reenquadrar. Sem borda arredondada: sangra até o fio do painel.

**Camadas** (botões de alternância no topo da bancada, todas independentes):

| Camada | O que desenha |
|---|---|
| Cavidades | círculo em cada uma das 32 posições de `geometria.cavidades`, cor pelo status da cota; número da cavidade ao lado |
| Achados | contorno + rótulo dos itens de `medicoes[].achados`, cor pela severidade |
| Serrilha | os 16 retângulos de `geometria.serrilhas`; a SB1 destacada em `--condenar` |
| Mapa de desgaste | sobreposição translúcida gerada por interpolação das cotas (mapa computado, não foto) |
| Régua | escala de referência e o valor de planicidade |

Estado inicial: cavidades + achados ligadas.

**Interação com a cavidade:** clique abre um cartão flutuante ancorado —
`Cavidade 06 · profundidade 4,12 mm · nominal 4,30 ± 0,10 · fora da tolerância` mais a
mesma cota nas medições anteriores. Duas cavidades selecionadas ao mesmo tempo mostram a
diferença entre elas.

### 1.3 A varredura

Botão `Avaliar peça`. Ao acionar:

1. Uma linha horizontal de `--sinal` atravessa a placa de cima a baixo em ~2,2s, com um leve
   rastro. Enquanto passa, as cavidades acima dela vão sendo classificadas e coloridas.
2. Os achados aparecem em sequência, na ordem de score (0,93 → 0,84 → 0,78 → 0,41), com
   ~180ms entre eles.
3. O painel de leitura preenche de cima para baixo no mesmo ritmo.
4. Ao terminar, o selo de veredito estampa.

Com `prefers-reduced-motion`, tudo aparece de uma vez, sem a passada.

Rótulo obrigatório junto ao botão: `inferência simulada — na PoC roda em Vertex AI`.

### 1.4 Painel de leitura (direita)

Blocos empilhados, separados por fio:

1. **Veredito.** `DESGASTADO` + recomendação: *substituir antes do próximo setup*.
   Chip: `Fase 2 · Degrau 3`.
2. **Concordância com o painel de especialistas.** 94%, 3 de 3 avaliadores.
3. **Achados.** Lista com rótulo, score e alvo. O achado A4 (score 0,41) aparece marcado
   como `abaixo do limiar — avaliar manualmente`, nunca como veredito. Clicar num achado
   destaca o alvo na bancada.
4. **Cotas críticas.** Serrilha (41% de perda contra limite de 35%), planicidade (0,06 contra
   limite 0,10), e o resumo das cavidades: 1 fora, 2 em atenção, 29 dentro.
5. **Ciclos.** 812.400 golpes desde a última medição, com a fonte: `derivado de OP × bolhas
   por golpe (SAP PP)`.
6. **Decisão.** Quatro ações: `Aprovar para uso`, `Enviar para reparo`, `Condenar`,
   `Pedir segunda opinião`. Ao escolher, abre campo de observação e registra com o perfil
   ativo e a hora. Depois de registrada, o bloco vira histórico e some o botão.
7. **Legenda** das cinco cores.

### 1.5 Painéis secundários (abas acima do painel de leitura)

- **Comparar** — cortina deslizante entre a captura atual e o ponto zero (`MED-FS0192-000`,
  escaneada em 12/12/2025). O mesmo enquadramento, com as cotas de cada lado.
- **Histórico** — as 5 medições numa linha do tempo; gráfico de desgaste da serrilha contra
  ciclos, com os 5 pontos de `tendencia.pontos`, a reta de tendência, a linha de condenação em
  45% e a projeção pontilhada até ela. Abaixo do gráfico, em destaque:
  `Degrau 2 · extrapolação linear sobre 4 medições. Não é predição. O modelo preditivo é
  entregável da Fase 4, com ~18 meses de base.` A vida remanescente aparece **dentro** desse
  bloco, nunca solta.

  > **Correção de 08/09/2026.** Este parágrafo dizia `~60.000 golpes` e o passo 5 do roteiro
  > falava em `9% a cada 100 mil golpes`. Nenhum dos dois decorre dos pontos medidos: a série
  > 0 / 12 / 23 / 33 / 41% contra 0 / 214.800 / 438.100 / 651.300 / 812.400 golpes produz
  > **5,00% por 100 mil golpes** e cruza os 45% aos **887.310 golpes**, ou seja **~75.000
  > golpes** de vida remanescente. Os 9% seriam 73% de perda aos 812.400 golpes, contra os 41%
  > que a medição registra. Como a tela desenha a curva ao lado do número, a contradição
  > apareceria na sala. `scripts/gerar_seed.py` passou a **derivar** inclinação, cruzamento e
  > vida remanescente dos próprios pontos, e o painel lê essa conta em vez de refazer o ajuste.
  > Os números do deck seguem intactos: 812.400 golpes, 41% de serrilha, cavidade 06 em 4,12
  > contra 4,30 ± 0,10, cavidade 17 em 4,28, planicidade 0,06 contra 0,10 e 94% de concordância.
- **Fila** — as demais peças aguardando avaliação, incluindo as duas peças de PoC das outras
  áreas (punção de compressão e tela de granulador), para mostrar que o conceito atravessa as
  três áreas.

### 1.6 Recebimento

Uma aba `Recebimento` na fila: mesma bancada, peça nova, comparação dimensional contra o
desenho. É o caso de uso que paga rápido e que o cliente levantou na reunião
(*"entrou boa, veio ruim"*). Uma tela simples basta; ela alimenta a comparação de fornecedores.

---

## 2. Guardião de Dados — `/guardiao`

### 2.1 Fila de desvios (padrão)

Lista dos 6 registros de `desvios`, ordenada por severidade e data. Cada linha: tipo, item
serial, tempo aberto, severidade. Ao expandir: detalhe, ação recomendada, responsável, e o
botão `Tratar` que registra a tratativa.

Acima da lista, cinco contadores — um por tipo de desvio. Chip: `Fase 1 · Degrau 2`.

Frase de contexto, porque é o argumento comercial da Fase 1:
`Tudo nesta tela usa dados que a Hypera já tem hoje. Nenhum modelo de IA envolvido.`

### 2.2 Base serializada

Tabela dos 57 itens, com busca e filtros por área, sub-área, família, máquina, estado e
local. Colunas: item serial, família, área/sub-área, máquina, formato, ciclos, barra de
consumo de vida (ciclos ÷ limite), estado, local, última medição. Ordenável. Densa: é uma
tabela de dados, não cartões.

### 2.3 Ficha do item — `/guardiao/item/:serial`

Aberta ao clicar numa linha. Reproduz o modelo de dados mínimo do slide 47, em seis blocos:
**Identidade · Movimentação · Uso · Condição · Eventos · Economia**.
Linha do tempo unificada com movimentações, medições e desvios em ordem cronológica.
Para FS-0192, a ficha tem link direto para a bancada de visão.

---

## 3. Check-in / check-out — `/checkin`

Uma moldura de celular (~390×844) centralizada num fundo escuro, com uma legenda ao lado
explicando o poka-yoke. Dentro da moldura, um fluxo de quatro passos:

1. Ler o DataMatrix (simulado por um botão `Ler etiqueta` que preenche FS-0192)
2. Confirmar item, kit, OP e máquina
3. Escolher `Saída` ou `Retorno`; em retorno, motivo obrigatório se houve troca em produção
4. Confirmação com hora e operador

Ao concluir, o evento entra em `movimentacoes` no estado global e aparece na ficha do item e
na fila do Guardião. É esse encadeamento que faz a demo parecer um sistema.

Legenda ao lado: `Sem check-in do kit, o pré-setup não é liberado pelo procedimento. É o que
faz a adesão acontecer — e é o que faz o contador de ciclos existir.`

---

## 4. Trade-Off CAPEX × OPEX — `/tradeoff`

Uma tela, dividida em três:

1. **A curva.** Gráfico com custo de manter (crescente, `--condenar`) e custo de repor
   (constante, `--dimensional`) contra ciclos acumulados, dados de `tradeoff.curva`. Marcador
   na posição atual (812.400) e no ponto ótimo (845.000). O cruzamento é o argumento inteiro.
2. **Os dois lados, abertos.** Custo de manter mais 100 mil golpes: R$ 38 mil, decomposto em
   velocidade, refugo e setup. Custo de repor: R$ 21 mil mais seis semanas de prazo.
3. **Recomendação e destino.** Texto do agente, e o botão `Incluir na ficha de aquisição`, que
   cria uma ficha e leva à tela de reposição. Chip: `Fase 3 · Degrau 3`.

Aviso obrigatório no rodapé do painel: `Hora de linha e OEE de referência são placeholders do
business case; serão substituídos pelo baseline auditado da Fase 1.`

---

## 5. Reposição & Fornecedores — `/reposicao`

Três blocos numa tela:

1. **Fichas de aquisição 2027** — tabela de `fichasAquisicao`, com origem de cada ficha
   (condição medida, ciclos acima do limite, tendência de desgaste). A ficha criada na tela de
   trade-off aparece no topo, marcada como nova.
2. **3YP** — barras empilhadas por exercício (2027–2029) e família, de `plano3YP`.
3. **Fornecedores** — comparação P&F contra F&G: preço médio, prazo, durabilidade média
   observada, percentual fora de spec no recebimento, número de amostras. O número de amostras
   precisa estar visível, com a ressalva de que 15 a 18 peças ainda não fecham a conclusão.

Chip: `Fase 4 · Degrau 4`.

---

## 6. Valor — `/valor`

Para Controladoria e Diretoria. Foi pedido explicitamente que o business case entre no mockup.

1. **Cascata.** Do zero ao ganho anual do piloto (R$ 2,08 MM, cenário base), uma barra por
   alavanca de `businessCase.alavancas`. Alternador piloto / parque e conservador / base /
   otimista.
2. **Captura por fase.** Curva acumulada de `businessCase.capturaPorFase`, mostrando que a
   Fase 1 já captura antes de qualquer IA entrar em rotina.
3. **Saúde do parque.** Distribuição dos 57 itens por estado e por área; itens acima do limite
   de ciclos; itens sem medição.
4. **Efeito contábil.** 10 anos de vida contábil contra ~3 de vida real, marcado como
   informativo (CPC 27 / IAS 16).

Aviso do `businessCase.aviso` visível na tela.

---

## 7. Diagnóstico de Máquina — `/diagnostico` (bloqueado)

Tela de próxima onda: acessível, mas com o conteúdo esmaecido e um selo `Próxima onda`.
Explica o conceito em três frases e um esquema: desgaste assimétrico medido na ferramenta
como sinal de empeno ou desalinhamento da máquina, conectando ferramentaria e manutenção de
ativos. Sem dado sintético — aqui não inventamos nada, porque é a próxima venda.

---

## 8. Roteiro guiado — `/roteiro`

Modo apresentação, para quem vai conduzir a reunião sem ter construído o produto.

- Ativado pelo botão no trilho ou pela tecla `R`.
- Barra inferior fixa com: número do passo, título, a fala sugerida, `←` e `→`.
- Cada passo navega para a rota de `roteiro[].rota`, troca o perfil ativo e, quando a rota tem
  `acao=varrer`, dispara a varredura automaticamente.
- `Esc` sai do modo. `Espaço` avança.
- Nove passos, definidos em `roteiro` no seed. Não invente passos novos: a sequência foi
  desenhada para 8 a 10 minutos.
- Um botão `Reiniciar demonstração` limpa todas as decisões e movimentações registradas na
  sessão e volta ao estado inicial. Precisa existir e precisa ser fácil de achar: a demo vai
  rodar várias vezes seguidas.

---

## 9. Critérios de aceite do produto inteiro

1. Alguém que nunca viu o repositório consegue rodar a demo inteira só apertando `→`.
2. O selo de ambiente demonstrativo é visível em toda tela, em toda rota.
3. Todo número derivado tem chip de fase e degrau.
4. A vida remanescente só aparece dentro do bloco de tendência, com o aviso de degrau 2.
5. Nenhuma tela mostra aprovação automática; toda decisão tem autor e hora.
6. A build estática abre por duplo clique no `index.html` sem servidor.
7. A demo inteira roda sem rede.
8. Cada tela consegue virar captura de tela legível a 1920×1080 para entrar no deck.
