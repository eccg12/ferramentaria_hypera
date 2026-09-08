# Sequência de prompts — FerraMon

Cada bloco abaixo é um prompt para colar no Claude Code, um de cada vez, na ordem.
Rode `npm run dev` e confira a tela antes de passar para o próximo. Faça commit ao fim de
cada prompt — se um passo sair torto, você volta um commit em vez de recomeçar.

**Antes do primeiro prompt:** garanta que o repositório já contém `CLAUDE.md`,
`docs/SPEC.md`, `docs/PROMPTS.md`, `src/dados/seed.json` e `public/assets/placa-FS-0192.jpg`.

**Duas ondas.** Prompts 1 a 8 entregam uma demo que já roda de ponta a ponta. Prompts 9 a 14
são a segunda camada. Se o prazo apertar, apresente depois do 8.

---

## Onda 1 — a demo que já se apresenta

### Prompt 1 — Fundação

```
Leia CLAUDE.md e docs/SPEC.md por inteiro antes de começar.

Monte o projeto: Vite + React 18 + TypeScript + Tailwind, react-router-dom com HashRouter,
recharts e lucide-react. vite.config.ts com base: './'.

Crie src/estilos/tokens.css com as variáveis de cor do CLAUDE.md e exponha todas no
tailwind.config como cores nomeadas (aco-900, sinal, condenar, atencao, tolerancia,
dimensional, identidade, etc.). Carregue Montserrat (500/600/700) e IBM Plex Mono (400/500)
do Google Fonts, com fallback local para o caso de a demo rodar sem rede — baixe os arquivos
woff2 para public/fontes e sirva por @font-face.

Crie src/dados/tipos.ts com as interfaces TypeScript de todas as chaves do seed.json, e
src/dados/seletores.ts com funções puras de consulta: itemPorSerial, medicoesDoItem,
ultimaMedicao, desviosAbertos, itensPorArea, resumoDoParque.

Não construa nenhuma tela ainda. Ao final, `npm run build` precisa passar e a página deve
mostrar só o nome do produto no fundo escuro correto.

Commit: "fundação: vite, tokens, tipografia e camada de dados"
```

### Prompt 2 — Casca, navegação e componentes base

```
Construa a casca descrita na seção 0 do SPEC: cabeçalho com marca, seletor de perfil e selo
de ambiente demonstrativo; trilho esquerdo de 72px com os cinco agentes que expande para
240px no hover; rodapé técnico de 28px que lê agentes[].stack da tela atual.

Crie o contexto da aplicação (React Context + useReducer) com: perfil ativo, decisões
registradas, movimentações registradas na sessão, estado do roteiro. Inclua a ação de
reiniciar demonstração.

Construa os componentes base da tabela do SPEC seção 0: ChipFase, SeloVeredito, Cota, Fio,
PainelLeitura, BlocoDecisao, Legenda. Documente cada um com um comentário curto.

Rotas: /guardiao /visao /checkin /tradeoff /reposicao /valor /diagnostico, todas ainda com
um placeholder nomeado. Rota padrão: /guardiao.

Atenção à direção visual: separação por fio de 1px, não por cartões com sombra. Sem
gradiente, sem faixa decorativa, raio 4px em controles e 0 em regiões de dado.

Commit: "casca: navegação, perfis, contexto e componentes base"
```

### Prompt 3 — Guardião de Dados

```
Implemente a tela /guardiao conforme a seção 2 do SPEC: fila de desvios com os cinco
contadores por tipo, lista expansível com detalhe, ação recomendada, responsável e botão
Tratar que registra a tratativa no contexto.

Na mesma tela, uma segunda aba com a base serializada: tabela densa dos 57 itens, busca e
filtros por área, sub-área, família, máquina, estado e local, colunas ordenáveis e barra de
consumo de vida (ciclos ÷ limiteCiclos) colorida pela semântica.

Inclua a frase de contexto do SPEC 2.1 e o ChipFase "Fase 1 · Degrau 2".

Commit: "guardião: fila de desvios e base serializada"
```

### Prompt 4 — Bancada de visão: o visualizador

```
Implemente a base da tela /visao conforme SPEC 1.1 e 1.2, sem varredura ainda.

Barra de identificação do item com dados do rig e da calibração rastreável.

Bancada com a foto public/assets/placa-FS-0192.jpg, zoom por roda do mouse de 0,8x a 4x,
arrasto e botão de reenquadrar. Use geometria.cavidades e geometria.serrilhas do seed para
desenhar as sobreposições em SVG posicionado sobre a imagem, em coordenadas normalizadas —
as marcações precisam continuar coladas na peça em qualquer nível de zoom.

Camadas alternáveis: Cavidades, Achados, Serrilha, Mapa de desgaste, Régua. Ligadas por
padrão: cavidades e achados. O mapa de desgaste é interpolação das cotas, gerado por código —
deixe explícito na interface que é camada computada, não fotografia.

Clique na cavidade abre o cartão ancorado com a cota, o nominal, a tolerância, o status e o
mesmo valor nas medições anteriores.

Verifique visualmente que os círculos caem exatamente sobre as cavidades da foto. Se houver
desvio, ajuste as coordenadas no seed, não no componente.

Commit: "visão: bancada, camadas e inspeção por cavidade"
```

### Prompt 5 — Bancada de visão: varredura, leitura e decisão

```
Complete a tela /visao com SPEC 1.3 e 1.4.

A varredura: botão Avaliar peça, linha de --sinal atravessando a placa em ~2,2s, cavidades
sendo classificadas conforme a linha passa, achados aparecendo em ordem decrescente de score
com 180ms entre eles, painel de leitura preenchendo no mesmo ritmo, selo de veredito
estampando ao final. Respeite prefers-reduced-motion revelando tudo de uma vez.

Rótulo obrigatório junto ao botão: "inferência simulada — na PoC roda em Vertex AI".

Painel de leitura com os sete blocos do SPEC 1.4, separados por fio, sem gaps de cartão. O
achado de score 0,41 aparece como "abaixo do limiar — avaliar manualmente", nunca como
veredito. O bloco de decisão registra usuário, ação, hora e observação no contexto, e depois
de registrado vira histórico.

Commit: "visão: varredura, painel de leitura e decisão registrada"
```

### Prompt 6 — Comparação, histórico e a escada analítica

```
Implemente as abas do SPEC 1.5 sobre a tela /visao.

Comparar: cortina deslizante entre a captura atual e o ponto zero MED-FS0192-000.

Histórico: linha do tempo das 5 medições e gráfico de desgaste da serrilha contra ciclos com
os pontos de tendencia.pontos, reta de tendência, linha de condenação em 45% e projeção
pontilhada até o cruzamento.

Este é o ponto mais delicado do produto. A vida remanescente de ~60.000 golpes só pode
aparecer dentro deste bloco, acompanhada do aviso de tendencia.avisoDegrau, com o chip
"Degrau 2". Não crie nenhum outro lugar no produto onde esse número apareça solto.

Fila: as demais peças aguardando avaliação, incluindo as duas peças de PoC de compressão e
manipulação.

Commit: "visão: comparação com peça nova, histórico e tendência de desgaste"
```

### Prompt 7 — Check-in / check-out

```
Implemente /checkin conforme a seção 3 do SPEC: moldura de celular de ~390x844 centralizada,
fluxo de quatro passos, motivo obrigatório quando houver troca em produção.

O evento concluído entra em movimentações no contexto e precisa aparecer imediatamente na
ficha do item e na fila do Guardião. Teste esse encadeamento antes de fechar o prompt — é ele
que faz a demo parecer um sistema e não telas soltas.

Inclua a legenda do poka-yoke ao lado da moldura.

Commit: "check-in/check-out no celular do operador"
```

### Prompt 8 — Roteiro guiado e reinício

```
Implemente o modo roteiro do SPEC seção 8, lendo os nove passos de roteiro no seed.

Barra inferior fixa com número, título e fala sugerida; navegação por setas, espaço e Esc;
tecla R para entrar. Cada passo navega para a rota, troca o perfil ativo e, quando a rota
traz acao=varrer, dispara a varredura sozinho.

Botão Reiniciar demonstração visível e fácil de achar, limpando decisões e movimentações da
sessão.

Ao final deste prompt, alguém que nunca viu o repositório precisa conseguir apresentar a demo
inteira só apertando a seta para a direita. Teste isso do começo ao fim antes de commitar.

Commit: "roteiro guiado de apresentação e reinício da demonstração"
```

---

## Onda 2 — profundidade e fechamento

### Prompt 9 — Ficha do item

```
Implemente /guardiao/item/:serial conforme SPEC 2.3: os seis blocos do modelo de dados mínimo
(Identidade, Movimentação, Uso, Condição, Eventos, Economia) e a linha do tempo unificada com
movimentações, medições e desvios em ordem cronológica.

Para FS-0192, inclua o atalho para a bancada de visão. Cada linha da base serializada abre
esta ficha.

Commit: "ficha do item serial com linha do tempo"
```

### Prompt 10 — Trade-Off CAPEX × OPEX

```
Implemente /tradeoff conforme a seção 4 do SPEC: a curva de custo de manter contra custo de
repor com os marcadores da posição atual e do ponto ótimo, a decomposição dos dois lados, e a
recomendação com o botão Incluir na ficha de aquisição.

O aviso sobre hora de linha e OEE serem placeholders é obrigatório e fica no rodapé do painel.

Commit: "agente de trade-off capex × opex"
```

### Prompt 11 — Reposição, fornecedores e 3YP

```
Implemente /reposicao conforme a seção 5 do SPEC: fichas de aquisição 2027 com a origem de
cada uma, 3YP em barras empilhadas por exercício e família, e a comparação P&F contra F&G.

A ficha criada na tela de trade-off aparece no topo, marcada como nova.

Na comparação de fornecedores, o número de amostras precisa estar visível junto com a
ressalva de que 15 a 18 peças ainda não fecham a conclusão. Não deixe a tela sugerir que a
diferença entre fornecedores já está provada.

Commit: "agente de reposição, fornecedores e 3YP"
```

### Prompt 12 — Painel de Valor

```
Implemente /valor conforme a seção 6 do SPEC: cascata do business case com alternadores de
piloto/parque e conservador/base/otimista, curva de captura por fase, saúde do parque
calculada a partir dos 57 itens, e o bloco informativo do efeito contábil.

A cascata é a que substitui a tabela densa do slide 15 da proposta, então ela precisa ser
legível de longe: poucas barras, rótulos grandes, valores em R$ MM.

Commit: "painel de valor: cascata, captura por fase e saúde do parque"
```

### Prompt 13 — Recebimento e Diagnóstico de Máquina

```
Implemente a aba Recebimento do SPEC 1.6: mesma bancada, peça nova, comparação dimensional
contra o desenho, alimentando a comparação de fornecedores.

Implemente /diagnostico conforme a seção 7: tela acessível, conteúdo esmaecido, selo Próxima
onda, conceito explicado em três frases e um esquema. Sem dado sintético nesta tela.

Commit: "inspeção de recebimento e diagnóstico de máquina como próxima onda"
```

### Prompt 14 — Acabamento e entrega

```
Passe o produto inteiro pelos oito critérios de aceite da seção 9 do SPEC e corrija o que
falhar. Em especial:

1. Rode a demo inteira pelo roteiro e verifique o selo de ambiente demonstrativo em toda rota.
2. Verifique que todo número derivado tem ChipFase.
3. Verifique que a vida remanescente só aparece no bloco de tendência.
4. Teste com prefers-reduced-motion ligado.
5. Teste o foco de teclado em toda a navegação.
6. Rode npm run build e abra o dist/index.html por file:// — precisa funcionar sem servidor.
7. Corte a rede e rode de novo.

Depois, escreva no README como rodar, como apresentar e o que é fictício. E gere um roteiro
de capturas de tela em docs/CAPTURAS.md listando quais telas entram no deck da proposta e em
que estado capturar cada uma.

Commit: "acabamento, verificação dos critérios de aceite e instruções de apresentação"
```

---

## Como corrigir sem quebrar

Se uma tela sair errada, prefira um prompt corretivo curto e específico a refazer o passo:

```
Na tela X, o elemento Y está Z. Corrija apenas isso, sem tocar em outros arquivos.
Reveja a seção N do SPEC antes.
```

Se o Claude Code começar a inventar dado dentro de componente, corte na hora:

```
Você criou dados dentro do componente. Toda informação vem de src/dados/seed.json.
Mova para o seed e leia por seletor.
```
