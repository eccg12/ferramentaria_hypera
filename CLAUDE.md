# FerraMon — contexto do projeto

Leia este arquivo inteiro antes de escrever qualquer código. Ele vale para todas as sessões.

## O que estamos construindo

Um **mockup navegável** da plataforma agêntica de ferramentaria que a Monoda Consulting está
propondo à Hypera Pharma, em parceria com o Google Cloud. Não é software de produção: é um
instrumento de venda e de alinhamento, apresentado ao vivo em reunião, rodando offline no
notebook de quem apresenta.

**Nome do produto:** FerraMon
**Assinatura:** Ferramentaria Guiada por Dados · Monoda Consulting × Google Cloud
**Cliente da demo:** Hypera Pharma — planta P-19, Anápolis (GO), sub-área de embalagem

### O trabalho que este mockup precisa fazer

1. Tornar concreto o que hoje é um deck de 57 slides: quatro agentes, uma base de dados, um
   ciclo de vida por item serial.
2. Mostrar que a Fase 1 (Guardião de Dados + check-in/check-out) entrega valor **sem nenhuma
   IA**, porque é a fase que a Hypera compra primeiro.
3. Fazer a avaliação de condição por visão computacional parecer real, sem prometer o que a
   Fase 1 não entrega.
4. Terminar em dinheiro: o business case com lastro em medição.

### O que este mockup NÃO é

- Não chama API de IA nenhuma. Toda "inferência" é determinística, lida do dataset semente.
- Não tem back-end, banco, login, cadastro, configurações ou administração.
- Não integra com SAP, Google Cloud ou qualquer sistema. Os nomes de produto Google aparecem
  como rodapé técnico, nunca como conexão real.
- Não é responsivo para celular como aplicativo. A tela de check-in/check-out é uma **moldura
  de celular dentro da tela de desktop**, para contar a história do operador.

## A regra que governa tudo: honestidade projetada

Este mockup vai ser projetado numa parede para diretores de uma farmacêutica. Um número
inventado que pareça medição real vira expectativa contratual no Gate 1. Por isso:

1. **Selo de ambiente demonstrativo** permanente no cabeçalho, discreto e sempre visível:
   `Ambiente demonstrativo · dados fictícios`. Nunca escondido, nunca fechável.
2. **Chip de fase e degrau em todo painel que mostra um número derivado.** O chip diz qual
   fase do programa entrega aquilo e em que degrau da escada analítica ele está:
   - Degrau 1 — Identidade (peça com código unívoco)
   - Degrau 2 — Rastreabilidade (onde esteve, quantos ciclos)
   - Degrau 3 — Critério objetivo (condição medida contra tolerância)
   - Degrau 4 — Predição (vida remanescente por modelo)
   A tela de tendência de desgaste é **Degrau 2**, não 4, e precisa dizer isso na cara:
   é extrapolação linear sobre 4 medições, não modelo preditivo.
3. **Nunca forjar defeito na foto.** A imagem da placa é uma foto real de ferramental da
   Hypera. Anotação, contorno, régua, mapa de calor computado: tudo permitido, porque é
   camada de análise. Pintar uma trinca ou uma ranhura em cima do metal: proibido.
4. **A decisão é humana e fica registrada.** Toda recomendação do agente termina num bloco de
   decisão com usuário, hora e observação. Nunca existe aprovação automática. Score abaixo do
   limiar mostra `avaliar manualmente`, não um veredito.
5. **Nomes de produto Google aparecem com ressalva** no rodapé técnico das telas:
   `a confirmar com o time Google Cloud`.

Se um pedido futuro entrar em conflito com um destes cinco pontos, pare e pergunte.

## Vocabulário do domínio (use exatamente estes termos, em português)

| Termo | Significado |
|---|---|
| Ferramentaria | Oficina e processo de gestão do ferramental de produção |
| Ferramental | Peças trocadas a cada mudança de formato, que atuam sobre o produto |
| Item serial | Uma peça física individual, com identidade única (ex.: FS-0192) |
| Kit | Conjunto de peças de um formato numa máquina |
| Formato | Configuração de produto/embalagem (ex.: NEO-4x8, Neosaldina 4×8) |
| Golpe / ciclo | Um acionamento da máquina; unidades produzidas ÷ bolhas por golpe |
| Cota | Medida dimensional crítica (profundidade de cavidade, altura de serrilha) |
| Tolerância | Faixa aceitável da cota (ex.: 4,30 ± 0,10 mm) |
| Serrilha | Relevo da placa de selagem que forma a barreira do blister |
| Ranhura | Sulco/risco na superfície, cria caminho de vazamento |
| Rebarba | Excesso de material na borda, gera blister cortante |
| Pré-setup | Conferência do ferramental antes de montar na máquina |
| Check-out / check-in | Saída e retorno da peça, com item serial e motivo |
| Rig | Estação de captura: gabarito, iluminação, câmera/scanner calibrados |
| Peça nova / ponto zero | Escaneamento da peça nova, referência de comparação |
| Estados de condição | novo · ok · desgastado · danificado (os 4 níveis da Hypera) |
| OP | Ordem de produção (SAP PP) |
| 3YP | Three Years Plan — plano de reposição de três exercícios |
| OEE | Disponibilidade × Performance × Qualidade |

Áreas: **manipulação**, **compressão**, **embalagem**.
Sub-áreas de embalagem: **formação**, **alimentação**, **selagem**, **corte**.

## Os cinco agentes

| # | Agente | Fase | Estado no mockup |
|---|---|---|---|
| 1 | Guardião de Dados | Fase 1 | ativo, profundidade alta |
| 2 | Agente de Visão | Fase 2 | ativo, **é o centro da demo** |
| 3 | Trade-Off CAPEX × OPEX | Fase 3 | ativo, profundidade média |
| 4 | Reposição & Fornecedores | Fase 4 | ativo, uma tela |
| 5 | Diagnóstico de Máquina | Próxima onda | **bloqueado** e visível |

São cinco e não mudam. Cada fase do programa entrega um agente — é essa amarração que
justifica o modelo de fee por fase com gate. Não adicione agentes.

## Direção visual: bancada de metrologia, não painel de SaaS

A referência não é dashboard de startup. É **estação de inspeção**: fundo escuro porque a
captura é feita com backlight, contraste alto porque a tela fica ao lado da máquina, e os
números alinhados como num laudo dimensional.

**Onde gastar a ousadia:** na área de trabalho da placa. Ela ocupa o maior espaço da tela,
sangra até a borda do painel e recebe a única animação orquestrada do produto (a varredura).
Todo o resto é quieto.

### Tokens

```css
--aco-900: #071723;  /* fundo profundo */
--aco-800: #0D2334;  /* superfície */
--aco-700: #16344A;  /* superfície elevada, cabeçalhos de tabela */
--linha:   #1F4460;  /* fios de 1px, divisores */
--texto:   #EAF2F8;
--texto-2: #93AFC4;  /* rótulos, metadados */
--sinal:   #3DD2E8;  /* interativo, foco, marca */

/* semântica — igual à legenda da imagem conceito, cor é dado, não decoração */
--condenar:    #EF3B4E;  /* fora de condição */
--atencao:     #F5A623;  /* acompanhar */
--tolerancia:  #16D07E;  /* dentro da tolerância */
--dimensional: #35C6E0;  /* medição dimensional */
--identidade:  #2B5BD7;  /* identificação do item */
```

Regras de cor: essas cinco cores semânticas **só** aparecem carregando significado de
condição. Nunca como enfeite, nunca em botão, nunca em gradiente. Não existe gradiente
neste produto.

### Tipografia

- **Montserrat** (600/700 títulos, 500 interface) — é a fonte do padrão Monoda, obrigatória.
- **IBM Plex Mono** (400/500) — exclusivamente para valores medidos, item seriais, números de
  OP e contagens de ciclos. Nunca para rótulo, título ou texto corrido. A justificativa é
  funcional: cotas precisam alinhar dígito com dígito como num laudo.
- Rótulos em caixa de frase. Caixa alta só no selo de veredito (`DESGASTADO`), que é carimbo
  de status, e na legenda de cores.

### Forma

- Raio de borda: 4px em controles, 0 em regiões de dado. Não uniformize tudo em 12px.
- Separação por fio de 1px em `--linha`, não por espaçamento entre cartões. O painel de
  leitura é uma coluna contínua dividida por fios, como a régua de um instrumento.
- Sem sombra. Sem faixa decorativa. Sem barra de destaque na lateral de cartão.
- Uma única animação não disparada pelo usuário: a passada da varredura. Respeite
  `prefers-reduced-motion` — nesse caso, revele os achados sem a passada.

## Stack e convenções

- **Vite + React 18 + TypeScript + Tailwind CSS**
- **HashRouter** do `react-router-dom` (a build precisa abrir por `file://` e no GitHub Pages)
- **Recharts** para gráficos, **lucide-react** para ícones
- `vite.config.ts` com `base: './'`
- Sem back-end. Sem `localStorage`. Estado em React (Context + `useReducer`).
- Idioma da interface: **português do Brasil**. Código, nomes de variáveis e commits em
  português também — quem vai manter isso é o time Monoda.
- Números: `Intl.NumberFormat('pt-BR')`. Milhar com ponto, decimal com vírgula.
  Cotas sempre com 2 casas (`4,12 mm`). Ciclos sempre com separador (`812.400 golpes`).

### Estrutura de pastas

```
src/
  dados/            seed.json, tipos.ts, seletores.ts
  estado/           contexto da aplicação, reducer, decisões registradas
  componentes/      base reutilizável (Chip, Fio, Selo, Cota, PainelLeitura...)
  telas/            uma pasta por agente
  roteiro/          modo apresentação guiada
  estilos/          tokens.css, tailwind
public/assets/      placa-FS-0192.jpg
docs/               SPEC.md, PROMPTS.md
```

## O dataset

`src/dados/seed.json` já existe e é a **fonte única de verdade**. Todos os agentes leem dele.
É isso que faz o produto parecer uma plataforma e não quatro telas soltas. Não crie dados
paralelos dentro de componentes; se faltar algo, adicione ao seed.

Chaves principais: `meta`, `agentes`, `perfis`, `roteiro`, `geometria`, `specs`, `itens`,
`medicoes`, `tendencia`, `movimentacoes`, `desvios`, `ops`, `tradeoff`, `fornecedores`,
`fichasAquisicao`, `plano3YP`, `businessCase`, `formatos`.

A peça herói é **FS-0192**, placa de selagem, máquina BL-04, formato NEO-4x8, 812.400 golpes,
estado `desgastado`. Os números dela são exatamente os da imagem conceito que já está no deck
da proposta — mantenha essa continuidade, porque o cliente vai ver as duas coisas.

`geometria` traz as coordenadas normalizadas (0..1) das 32 cavidades e das 16 serrilhas sobre
a foto. Numeração das cavidades em ordem de leitura: 8 por linha, 4 linhas, de cima para
baixo. A cavidade 06 é a que está fora de tolerância (4,12 contra 4,30 ± 0,10); a 17 é a
verde de contraponto.

## Qualidade mínima, sem anunciar

Responsivo até 1280px de largura (é uma demo de notebook e projetor, não de celular), foco de
teclado visível, contraste suficiente, `prefers-reduced-motion` respeitado, nenhuma tela em
branco sem instrução do que fazer.
