# FerraMon

Mockup navegável da plataforma agêntica de ferramentaria — Monoda Consulting × Google Cloud,
para a Hypera Pharma (P-19, Anápolis, embalagem).

> **Ambiente demonstrativo.** Todos os dados, medições, scores e valores deste repositório são
> fictícios e existem para demonstrar a mecânica da plataforma. Nenhum número aqui é medição
> real de ferramental da Hypera. A única coisa real é a fotografia da placa de selagem.

## Decisões já tomadas

| Decisão | Escolha | Por quê |
|---|---|---|
| Nome | **FerraMon** | Entra na família de aceleradores Monoda (IntegrityMon, LoRAMon, MonFEI) e é legível em português na primeira leitura |
| Agentes | **4 ativos + 1 bloqueado** | Cada fase entrega um agente; é essa amarração que sustenta o fee por fase com gate. Seis agentes quebram a lógica |
| Profundidade | Visão e Guardião fundo · Trade-Off médio · Reposição uma tela · Diagnóstico bloqueado | A Fase 1 é o que a Hypera compra primeiro e o Agente de Visão é o que ganha a sala |
| Prazo | Duas ondas | Prompts 1–8 já apresentam de ponta a ponta; 9–14 são a segunda camada |
| Tecnologia | Vite + React + TS + Tailwind, sem back-end | Roda offline no notebook de quem apresenta, sem depender da rede da planta |
| Imagem | Foto real, anotação computada | Blister gerado por IA é identificado por um líder de ferramentaria em dois segundos |

## Ordem de leitura

1. **`CLAUDE.md`** — contexto permanente, vocabulário, regras de honestidade, direção visual,
   tokens e convenções. O Claude Code lê isso em toda sessão.
2. **`docs/SPEC.md`** — o que cada tela mostra e como se comporta.
3. **`docs/PROMPTS.md`** — a sequência de 14 prompts, um por vez, com commit ao fim de cada.

## Já vem pronto

- `src/dados/seed.json` — 57 itens seriais, 5 medições da peça herói FS-0192, 160
  movimentações, 6 desvios, curva de trade-off, fornecedores, fichas, 3YP, business case e o
  roteiro de 9 passos da apresentação. Fonte única de verdade: todos os agentes leem daqui.
- `public/assets/placa-FS-0192.jpg` — a foto da placa, otimizada para web (2000×1132, 0,8 MB).
- `src/dados/` também recebe `geometria`: as coordenadas normalizadas das 32 cavidades e das
  16 serrilhas, derivadas da própria foto. As marcações caem em cima da peça sem ajuste manual.

## Continuidade com a proposta

Os números de FS-0192 são os mesmos da imagem conceito que já está no deck
(`Hypera_Visao_Computacional_Placa_Selagem_Conceito.png`, slide 22): 812.400 golpes, serrilha
com 41% de perda de altura de pico, cavidade 06 em 4,12 contra 4,30 ± 0,10, cavidade 17 em
4,28, planicidade 0,06 contra limite 0,10, concordância de 94% com o painel de especialistas.
O cliente vai ver o slide e a tela na mesma reunião — eles precisam contar a mesma história.

## Começar

```bash
git clone <este repositório>
cd ferramon
# abra o Claude Code e cole o Prompt 1 de docs/PROMPTS.md
```

## Verificação da grade

`docs/verificacao-grade.jpg` mostra as 32 cavidades e a numeração desenhadas sobre a foto, com
as cores da medição atual. Use como referência ao implementar as camadas do Prompt 4: se os
círculos da sua tela não caírem assim, ajuste as coordenadas em `geometria`, não no componente.

`scripts/gerar_seed.py` regenera `src/dados/seed.json` de forma determinística. Rode só se
precisar mudar a massa de dados; a peça herói FS-0192 é fixa no script.
