# Roteiro de capturas para o deck

Quais telas do FerraMon entram na proposta e em que estado capturar cada uma.

**Antes de começar:** `npm run build`, abra `dist/index.html`, deixe a janela em **1920×1080**
e aperte `Reiniciar demonstração`. Todas as capturas abaixo assumem esse ponto de partida.

Capture com a janela do navegador em tela cheia e sem a barra de favoritos. O selo de ambiente
demonstrativo precisa aparecer em toda captura: ele é parte do argumento, não um estorvo.

---

## Prioridade 1 — as quatro que sustentam a proposta

### C1 · A bancada com o resultado da avaliação
**Rota** `#/visao?item=FS-0192`
**Estado** aperte `Avaliar peça` e espere a varredura terminar (~3 s). Camadas ligadas:
cavidades e achados.
**Entra em** o slide do Agente de Visão, substituindo a imagem conceito.
**O que precisa aparecer** o selo `DESGASTADO`, os quatro achados em ordem de score, o A4
marcado como `abaixo do limiar — avaliar manualmente`, e o resumo `1 fora · 2 em atenção ·
29 dentro`.

### C2 · A tendência de desgaste
**Rota** `#/visao?item=FS-0192&painel=historico`
**Estado** direto, sem ação.
**Entra em** o slide da escada analítica.
**O que precisa aparecer** o gráfico com a linha de condenação em 45%, a projeção pontilhada, e
o bloco de vida remanescente com o aviso de degrau 2 colado nele. **Não recorte o aviso.** Ele é
o que impede o número virar promessa.

### C3 · O trade-off
**Rota** `#/tradeoff?item=FS-0192`
**Estado** direto, antes de criar a ficha.
**Entra em** o slide de CAPEX × OPEX.
**O que precisa aparecer** o cruzamento das duas curvas, os R$ 38 mil decompostos, os R$ 21 mil
de reposição, e o aviso de placeholders no rodapé do painel.

### C4 · O painel de valor
**Rota** `#/valor`
**Estado** escopo `Piloto`, cenário `Base`.
**Entra em** o slide do business case, substituindo a tabela densa do slide 15.
**O que precisa aparecer** a cascata inteira com os rótulos das cinco alavancas e a barra de
ganho anual em R$ 2,08 MM. Capture também com escopo `Parque declarado` para o número de
R$ 9,37 MM.

---

## Prioridade 2 — o que responde às perguntas da sala

### C5 · A fila de desvios da Fase 1
**Rota** `#/guardiao`
**Estado** aba `Fila de desvios`, com a primeira linha expandida.
**Argumento** a Fase 1 entrega valor sem nenhuma IA. A frase de contexto no topo é o slide
inteiro.

### C6 · A base serializada
**Rota** `#/guardiao`, aba `Base serializada`
**Estado** sem filtro, ordenada por item serial.
**Argumento** o modelo de dados existe e tem 57 itens com ciclos, estado e local.

### C7 · O check-in no celular
**Rota** `#/checkin`
**Estado** passo 3, com `Retorno` escolhido e o motivo ainda em branco, para mostrar o botão
bloqueado.
**Argumento** o poka-yoke. Sem motivo, o retorno não é aceito.

### C8 · A ficha do item
**Rota** `#/guardiao/item/FS-0192`
**Estado** direto.
**Argumento** o modelo de dados mínimo do slide 47, com a linha do tempo unificada.

### C9 · A comparação com a peça nova
**Rota** `#/visao?item=FS-0192&painel=comparar`
**Estado** cortina no meio.
**Argumento** o mesmo enquadramento, o mesmo rig, a mesma calibração. À esquerda tudo verde, à
direita a cavidade 06 fora.

### C10 · Reposição e fornecedores
**Rota** `#/reposicao`
**Estado** venha do trade-off com a ficha já criada, para ela aparecer marcada como nova.
**Argumento** a decisão vira ficha e a ficha vira 3YP. **Capture a ressalva das amostras junto**
com a comparação de fornecedores — ela não pode ficar de fora.

---

## Prioridade 3 — reserva

### C11 · Inspeção de recebimento
**Rota** `#/visao?item=FS-0192&painel=recebimento`
**Argumento** "entrou boa e veio ruim". É o caso de uso que paga rápido.

### C12 · Diagnóstico de máquina
**Rota** `#/diagnostico`
**Argumento** a próxima onda. Mostra que existe caminho depois da Fase 4, sem prometer.

### C13 · O trilho expandido
**Rota** qualquer, com o mouse sobre o trilho da esquerda.
**Argumento** os cinco agentes, um por fase, com o quinto bloqueado e visível.

---

## O que não capturar

- Nenhuma tela **sem** o selo de ambiente demonstrativo. Se aparecer alguma, é defeito.
- A vida remanescente **recortada** do aviso de degrau 2.
- A comparação de fornecedores **sem** a ressalva do número de amostras.
- A bancada **sem** a fotografia, se o arquivo ainda não estiver em `public/assets/`.
