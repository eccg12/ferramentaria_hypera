# Assets da bancada

- `placa-FS-0192.jpg` — a fotografia real da placa de selagem FS-0192, 2000×1132.

É a única coisa real do mockup. Anotação, contorno, régua e mapa de calor são
camadas de análise desenhadas por cima; nada é pintado sobre o metal.

As coordenadas das 32 cavidades e das 16 serrilhas estão em `geometria`, no
seed, em unidades normalizadas sobre esta imagem. Se a foto for trocada, ela
precisa manter 2000×1132 — a proporção é o que faz as marcações continuarem
coladas na peça.

Verificado sobre esta foto: o centro das cavidades coincide com o do seed, e a
borda da bolha fica entre 63 e 86 px do centro, com o raio do seed (75 px)
dentro dessa faixa.
