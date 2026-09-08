# FerraMon

Mockup navegável da plataforma agêntica de ferramentaria — Monoda Consulting × Google Cloud,
para a Hypera Pharma (P-19, Anápolis, embalagem).

> **Ambiente demonstrativo.** Todos os dados, medições, scores e valores deste repositório são
> fictícios e existem para demonstrar a mecânica da plataforma. Nenhum número aqui é medição
> real de ferramental da Hypera. A única coisa real é a fotografia da placa de selagem.

## Como rodar

```bash
npm install
npm run dev        # abre em http://localhost:5173
```

Para gerar a versão que roda offline no notebook de quem apresenta:

```bash
npm run build
# abra dist/index.html com dois cliques — não precisa de servidor nem de rede
```

A build é empacotada num único `dist/index.html` autossuficiente: script, estilos e as fontes
vão embutidos. Sob `file://` o navegador bloqueia por CORS o módulo, a folha de estilo e as
fontes, e é por isso que o empacotamento existe (`scripts/empacotar.mjs`).

A fotografia da placa fica fora do HTML, em `dist/assets/placa-FS-0192.jpg`, porque `<img>` não
sofre essa restrição. Leve a pasta `dist/` inteira.

## Como apresentar

Aperte **`R`** em qualquer tela. A barra do roteiro aparece embaixo com o passo, o título e a
fala sugerida. Depois disso, **só a seta para a direita**: são nove passos, desenhados para 8 a
10 minutos.

| Tecla | O que faz |
|---|---|
| `R` | entra no modo roteiro |
| `→` ou espaço | próximo passo |
| `←` | passo anterior |
| `Esc` | sai do modo roteiro |

Cada passo troca a rota e o perfil ativo sozinho. O passo 4 dispara a varredura da peça sem
que você precise clicar.

**Antes de cada rodada**, aperte `Reiniciar demonstração`, no canto superior direito de toda
tela e também na barra do roteiro. Ele limpa decisões, tratativas, movimentações e fichas
registradas na sessão. A demo vai rodar várias vezes seguidas na mesma reunião.

### Os nove passos

| # | Rota | Perfil | O argumento |
|---|---|---|---|
| 1 | `/guardiao` | Líder | O dia começa com desvios. Fase 1, sem nenhuma IA |
| 2 | `/checkin` | Operador | Sem check-in não existe contador de ciclos |
| 3 | `/visao` | Líder | A peça voltou e entrou na fila de avaliação |
| 4 | `/visao` varrendo | Líder | O agente vê e mede; a cor vem da tolerância |
| 5 | `/visao` histórico | Líder | Contra a peça nova e contra ela mesma. Degrau 2 |
| 6 | `/visao` decisão | Líder | Quem decide é o líder, e fica registrado |
| 7 | `/tradeoff` | Excelência | Quanto custa manter essa peça na máquina |
| 8 | `/reposicao` | Controladoria | A decisão vira ficha, e a ficha vira 3YP |
| 9 | `/valor` | Controladoria | O que isso vale por ano |

Fora do roteiro, o trilho da esquerda expande no hover e leva a qualquer agente. As telas de
recebimento e de diagnóstico de máquina não estão no roteiro: são material de reserva, para
quando a sala perguntar.

## O que é fictício

Praticamente tudo. Vale a pena ter isso na ponta da língua, porque a pergunta vem.

| O quê | Situação |
|---|---|
| A fotografia da placa FS-0192 | **Real.** Ferramental da Hypera, sem nenhuma alteração |
| As marcações sobre a foto | Camada de análise computada; nada é pintado sobre o metal |
| Os 57 itens seriais | Fictícios, gerados por `scripts/gerar_seed.py` |
| As 5 medições de FS-0192 | Fictícias; os números batem com a imagem conceito do deck |
| Scores dos achados | Fictícios. Não há modelo rodando: a inferência é lida do seed |
| Curva de trade-off e business case | Fictícios, com os placeholders declarados na própria tela |
| Nomes de produto Google | Aparecem como rodapé técnico, a confirmar com o time Google Cloud |

O selo `Ambiente demonstrativo · dados fictícios` fica no cabeçalho de toda rota e não fecha.

### As três regras que a tela nunca quebra

1. **Nada é pintado sobre o metal da foto.** Contorno, régua, número de cavidade e mapa de calor
   são camadas de análise, e o mapa diz na barra que é computado, não fotografia.
2. **A vida remanescente só existe dentro do bloco de tendência**, colada ao aviso de que aquilo
   é degrau 2 — extrapolação linear sobre quatro medições, não predição.
3. **Não existe aprovação automática.** Toda disposição de peça tem autor, hora e observação, e
   achado com score abaixo de 0,50 aparece como *avaliar manualmente*, nunca como veredito.

## O que falta no repositório

`public/assets/placa-FS-0192.jpg` (2000×1132) não está versionado, por ser material do cliente.
Coloque o arquivo com exatamente esse nome e a bancada passa a funcionar sem alteração de
código. Enquanto ele não estiver lá, a tela `/visao` desenha a grade das 32 cavidades sobre um
painel neutro e diz o que fazer. Nenhuma imagem sintética entra no lugar da foto.

`docs/verificacao-grade.jpg` é a referência de conferência da grade, com as cavidades numeradas
e coloridas pela medição atual.

## Estrutura

```
src/
  dados/        seed.json, tipos.ts, seletores.ts, formato.ts
  estado/       contexto da aplicação, reducer, registros da sessão
  componentes/  base reutilizável (ChipFase, Fio, SeloVeredito, Cota…)
  casca/        cabeçalho, trilho, rodapé técnico
  telas/        uma pasta por agente
  roteiro/      modo apresentação guiada
  estilos/      tokens.css, tailwind
scripts/        gerar_seed.py, empacotar.mjs
docs/           SPEC.md, PROMPTS.md, CAPTURAS.md
```

`src/dados/seed.json` é a fonte única de verdade: todos os agentes leem dele. Não crie dados
paralelos dentro de componentes; se faltar algo, adicione ao seed.

`scripts/gerar_seed.py` regenera o seed de forma determinística. A peça herói FS-0192 é fixa no
script, e a tendência de desgaste é **derivada** dos pontos medidos por mínimos quadrados — a
curva desenhada e o número escrito ao lado dela vêm da mesma conta.

## Ordem de leitura

1. `CLAUDE.md` — contexto permanente, vocabulário, regras de honestidade, direção visual e tokens
2. `docs/SPEC.md` — o que cada tela mostra e como se comporta
3. `docs/PROMPTS.md` — a sequência de prompts que construiu isto
4. `docs/CAPTURAS.md` — quais telas entram no deck e em que estado capturar cada uma

## Continuidade com a proposta

Os números de FS-0192 são os mesmos da imagem conceito que já está no deck
(`Hypera_Visao_Computacional_Placa_Selagem_Conceito.png`, slide 22): 812.400 golpes, serrilha
com 41% de perda de altura de pico, cavidade 06 em 4,12 contra 4,30 ± 0,10, cavidade 17 em
4,28, planicidade 0,06 contra limite 0,10, concordância de 94% com o painel de especialistas.
O cliente vai ver o slide e a tela na mesma reunião — eles contam a mesma história.

Uma ressalva registrada em `docs/SPEC.md` 1.5: a inclinação de desgaste e a vida remanescente
que constavam nos documentos (9% por 100 mil golpes e ~60.000 golpes) não decorriam dos pontos
medidos. Os valores da tela são os derivados: **5,00% por 100 mil golpes** e **~75.000 golpes**,
com cruzamento aos 887.310. Se o deck citar os antigos, alinhe antes da reunião.
