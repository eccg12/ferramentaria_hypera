#!/usr/bin/env python3
"""Gera o dataset semente do FerraMon. Determinístico (seed fixa)."""
import json, pathlib, random
from datetime import date, datetime, timedelta

R = random.Random(19)
HOJE = date(2026, 9, 8)


def d(offset_dias):
    return (HOJE + timedelta(days=offset_dias)).isoformat()


def dt(offset_dias, hh, mm):
    base = datetime(HOJE.year, HOJE.month, HOJE.day, hh, mm) + timedelta(days=offset_dias)
    return base.strftime("%Y-%m-%dT%H:%M:00")


# ---------------------------------------------------------------- catálogo
COLS_X = [0.0705, 0.1925, 0.3125, 0.4405, 0.5620, 0.6885, 0.8100, 0.9345]
ROWS_Y = [0.1495, 0.3160, 0.6535, 0.8345]
SLOT_X = [0.137, 0.380, 0.624, 0.869]
SLOT_Y = [0.040, 0.442, 0.531, 0.943]

cavidades = []
n = 0
for ri, y in enumerate(ROWS_Y):
    for ci, x in enumerate(COLS_X):
        n += 1
        cavidades.append({
            "id": f"C{n:02d}",
            "numero": n,
            "linha": ri + 1,
            "coluna": ci + 1,
            "cx": x,
            "cy": y,
            "r": 0.0375,
        })

serrilhas = []
m = 0
for bi, y in enumerate(SLOT_Y):
    banda = "ABCD"[bi]
    for si, x in enumerate(SLOT_X):
        m += 1
        serrilhas.append({
            "id": f"S{banda}{si+1}",
            "banda": banda,
            "tipo": "vedacao" if banda in ("A", "C") else "guia",
            "cx": x,
            "cy": y,
            "w": 0.198,
            "h": 0.040,
        })

geometria = {
    "imagem": "/assets/placa-FS-0192.jpg",
    "larguraPx": 2000,
    "alturaPx": 1132,
    "larguraPecaMm": 140.0,
    "notaEscala": "Largura útil da peça, em milímetros. É a única escala planar do dataset: a régua da bancada e o comprimento dos achados são derivados dela, para nenhum componente precisar inventar uma escala.",
    "nota": "Coordenadas normalizadas 0..1 sobre a imagem. Numeração das cavidades em ordem de leitura: 8 por linha, 4 linhas, de cima para baixo.",
    "cavidades": cavidades,
    "serrilhas": serrilhas,
}

# escala derivada, usada abaixo para posicionar achados com comprimento declarado
MM_POR_X = 1.0 / geometria["larguraPecaMm"]  # 1 mm em fração da largura
ASPECTO = geometria["larguraPx"] / geometria["alturaPx"]

# ---------------------------------------------------------------- medições FS-0192
SPEC_PROF = {"nominal": 4.30, "tol": 0.10, "unidade": "mm"}


def gerar_profundidades(desgaste):
    """desgaste 0..1 -> profundidades por cavidade. Determinístico."""
    rr = random.Random(1000 + int(desgaste * 1000))
    vals = {}
    for c in cavidades:
        base = SPEC_PROF["nominal"] - 0.008 - desgaste * 0.065
        ruido = rr.gauss(0, 0.018)
        v = min(max(base + ruido, 4.205), 4.385)
        vals[c["id"]] = round(v, 2)
    return vals


def classifica(v):
    lo = SPEC_PROF["nominal"] - SPEC_PROF["tol"]
    hi = SPEC_PROF["nominal"] + SPEC_PROF["tol"]
    if v < lo or v > hi:
        return "fora"
    if v < lo + 0.03 or v > hi - 0.03:
        return "atencao"
    return "ok"


def medicao_fs0192(idx, ciclos, quando, desgaste_serrilha, estado, achados, decisao=None,
                   profundidades=None):
    prof = profundidades or gerar_profundidades(desgaste_serrilha)
    cotas = []
    for c in cavidades:
        v = prof[c["id"]]
        cotas.append({
            "alvo": c["id"],
            "tipo": "profundidade_cavidade",
            "valor": v,
            "nominal": SPEC_PROF["nominal"],
            "tolerancia": SPEC_PROF["tol"],
            "unidade": "mm",
            "status": classifica(v),
        })
    return {
        "id": f"MED-FS0192-{idx:03d}",
        "itemSerial": "FS-0192",
        "data": quando,
        "rig": "EMB-01",
        "rigDescricao": "gabarito fixo + backlight + lente telecêntrica",
        "calibracao": {"certificado": "LOC-2026-0413", "validade": "2027-02-28", "rastreavel": True},
        "ciclosNaMedicao": ciclos,
        "cotas": cotas,
        "serrilha": {
            "perdaAlturaPico": round(desgaste_serrilha * 100, 1),
            "unidade": "%",
            "limite": 35.0,
            "alvo": "SB1",
            "status": "fora" if desgaste_serrilha * 100 > 35 else ("atencao" if desgaste_serrilha * 100 > 28 else "ok"),
        },
        "planicidade": {"valor": round(0.02 + desgaste_serrilha * 0.10, 2), "limite": 0.10, "unidade": "mm",
                        "status": "ok" if 0.02 + desgaste_serrilha * 0.10 <= 0.10 else "fora"},
        "achados": achados,
        "estado": estado,
        "concordanciaPainel": 94 if idx == 4 else None,
        "avaliadoresPainel": 3 if idx == 4 else None,
        "decisaoHumana": decisao,
    }


prof_atual = gerar_profundidades(0.41)
prof_atual["C06"] = 4.12   # fora de tolerância — o achado do conceito
prof_atual["C17"] = 4.28   # dentro — o contraponto verde
prof_atual["C11"] = 4.21
prof_atual["C24"] = 4.39

def _ranhura_entre(id_a, id_b, comprimento_mm, espessura_mm, caimento_mm):
    """Banda fina cruzando o centro de duas cavidades, com o comprimento declarado.

    Devolve o polígono em coordenadas normalizadas, centrado no ponto médio das
    duas cavidades. Assim o contorno desenhado, o alvo declarado e o
    comprimento do detalhe contam a mesma coisa.
    """
    a = next(c for c in cavidades if c["id"] == id_a)
    b = next(c for c in cavidades if c["id"] == id_b)
    meio_x = (a["cx"] + b["cx"]) / 2
    meio_y = (a["cy"] + b["cy"]) / 2
    meia = comprimento_mm * MM_POR_X / 2
    esp = espessura_mm * MM_POR_X * ASPECTO
    cai = caimento_mm * MM_POR_X * ASPECTO
    x0, x1 = meio_x - meia, meio_x + meia
    y0 = meio_y + esp  # levemente abaixo do centro, para o sulco aparecer na bolha
    return [
        [round(x0, 4), round(y0 - esp / 2, 4)],
        [round(x1, 4), round(y0 - esp / 2 + cai, 4)],
        [round(x1, 4), round(y0 + esp / 2 + cai, 4)],
        [round(x0, 4), round(y0 + esp / 2, 4)],
    ]


achados_atual = [
    {"id": "A1", "tipo": "desgaste_serrilha", "rotulo": "Serrilha de selagem — perda de altura de pico",
     "score": 0.93, "severidade": "condenar", "alvo": "SB1",
     "detalhe": "41% de perda de altura de pico em relação à peça nova"},
    {"id": "A2", "tipo": "ranhura", "rotulo": "Ranhura transversal — risco de vazamento",
     "score": 0.84, "severidade": "atencao", "alvo": "C11,C12",
     "detalhe": "comprimento 38 mm, cruza 2 cavidades",
     "poligono": _ranhura_entre("C11", "C12", comprimento_mm=38.0, espessura_mm=1.3, caimento_mm=1.0)},
    {"id": "A3", "tipo": "rebarba", "rotulo": "Borda de cavidade — rebarba",
     "score": 0.78, "severidade": "atencao", "alvo": "C20",
     "detalhe": "2 pontos de rebarba na borda"},
    {"id": "A4", "tipo": "incrustacao", "rotulo": "Incrustação leve no canal de vácuo",
     "score": 0.41, "severidade": "observar", "alvo": "C29",
     "detalhe": "abaixo do limiar de decisão — registrado para acompanhamento"},
]

medicoes = [
    medicao_fs0192(0, 0, "2025-12-12T09:10:00", 0.0, "novo", [],
                   {"usuario": "Líder de ferramentaria · turno A", "decisao": "aprovar",
                    "data": "2025-12-12T09:40:00", "observacao": "Peça nova — escaneamento de referência (ponto zero)."}),
    medicao_fs0192(1, 214800, "2026-03-19T14:05:00", 0.12, "ok", [],
                   {"usuario": "Líder de ferramentaria · turno B", "decisao": "aprovar",
                    "data": "2026-03-19T14:22:00", "observacao": "Dentro do padrão."}),
    medicao_fs0192(2, 438100, "2026-06-02T10:30:00", 0.23, "ok",
                   [{"id": "A0", "tipo": "incrustacao", "rotulo": "Incrustação leve", "score": 0.38,
                     "severidade": "observar", "alvo": "C29", "detalhe": "limpeza realizada"}],
                   {"usuario": "Líder de ferramentaria · turno A", "decisao": "aprovar",
                    "data": "2026-06-02T10:52:00", "observacao": "Liberada após limpeza dos furos de vácuo."}),
    medicao_fs0192(3, 651300, "2026-07-28T08:15:00", 0.33, "desgastado",
                   [{"id": "A0", "tipo": "desgaste_serrilha", "rotulo": "Serrilha de selagem — perda de altura de pico",
                     "score": 0.71, "severidade": "atencao", "alvo": "SB1",
                     "detalhe": "33% de perda — acima do patamar de atenção"}],
                   {"usuario": "Líder de ferramentaria · turno C", "decisao": "aprovar",
                    "data": "2026-07-28T08:44:00", "observacao": "Liberada com acompanhamento; reavaliar em 150k golpes."}),
    medicao_fs0192(4, 812400, "2026-09-07T14:32:00", 0.41, "desgastado", achados_atual, None,
                   profundidades=prof_atual),
]

tendencia = {
    "itemSerial": "FS-0192",
    "degrau": 2,
    "metodo": "extrapolação linear do desgaste medido contra ciclos acumulados",
    "avisoDegrau": "Degrau 2 da escada analítica. Não é predição: é tendência sobre 4 medições. O modelo preditivo (degrau 4) exige ~18 meses de base histórica e é entregável da Fase 4.",
    "inclinacaoPorCemMilGolpes": 9.0,
    "unidadeInclinacao": "% de perda de altura de pico por 100 mil golpes",
    "limiteCondenacao": 45.0,
    "vidaRemanescenteGolpes": 60000,
    "pontos": [
        {"ciclos": 0, "desgaste": 0.0},
        {"ciclos": 214800, "desgaste": 12.0},
        {"ciclos": 438100, "desgaste": 23.0},
        {"ciclos": 651300, "desgaste": 33.0},
        {"ciclos": 812400, "desgaste": 41.0},
    ],
}

# ---------------------------------------------------------------- itens
FORMATOS = [
    {"codigo": "NEO-4x8", "produto": "Neosaldina", "bolhasPorGolpe": 32, "espessuraComprimidoMm": 3.0},
    {"codigo": "ALV-4x6", "produto": "Alivium", "bolhasPorGolpe": 24, "espessuraComprimidoMm": 4.0},
    {"codigo": "ENG-2x10", "produto": "Engov", "bolhasPorGolpe": 20, "espessuraComprimidoMm": 3.4},
    {"codigo": "BEN-4x4", "produto": "Benegrip", "bolhasPorGolpe": 16, "espessuraComprimidoMm": 3.2},
]
FAMILIAS = [
    ("FF", "FORMA_TERMOFORMAGEM", "Forma de termoformagem", "embalagem", "formacao", 38000, 900000),
    ("FA", "GUIA_ALIMENTACAO", "Guia de alimentação", "embalagem", "alimentacao", 12500, 1400000),
    ("FS", "PLACA_SELAGEM", "Placa de selagem", "embalagem", "selagem", 48200, 950000),
    ("FC", "FACA_CORTE", "Faca de corte", "embalagem", "corte", 21800, 700000),
]
FAM_POC = [
    ("PS", "PUNCAO_SUPERIOR", "Punção superior", "compressao", None, 4700, 1200000),
    ("TG", "TELA_GRANULADOR", "Tela de granulador", "manipulacao", None, 3900, 600000),
]
MAQUINAS_EMB = ["BL-01", "BL-02", "BL-03", "BL-04", "BL-05", "BL-06"]
FORNECEDORES = ["P&F", "F&G"]
LOCAIS = ["armario", "maquina", "avaliacao", "reparo"]

itens = []
serial_n = {p: 100 for p, *_ in FAMILIAS + FAM_POC}


def novo_item(prefixo, familia, familia_label, area, subarea, valor, limite_ciclos,
              maquina, formato, forcar=None):
    serial_n[prefixo] += R.randint(3, 21)
    serial = f"{prefixo}-{serial_n[prefixo]:04d}"
    ciclos = R.randint(40000, int(limite_ciclos * 1.15))
    razao = ciclos / limite_ciclos
    if razao > 1.0:
        estado = "danificado" if R.random() < 0.35 else "desgastado"
    elif razao > 0.75:
        estado = "desgastado" if R.random() < 0.6 else "ok"
    else:
        estado = "ok" if R.random() < 0.9 else "novo"
    item = {
        "serial": serial,
        "familia": familia,
        "familiaLabel": familia_label,
        "area": area,
        "subarea": subarea,
        "site": "P-19",
        "galpao": "G2" if area == "embalagem" else ("G1" if area == "compressao" else "G3"),
        "maquina": maquina,
        "formato": formato,
        "posicao": f"{prefixo}-{R.choice('ABCD')}",
        "kit": f"KIT-{formato}-{maquina}" if formato else None,
        "fornecedor": R.choice(FORNECEDORES),
        "aquisicao": {
            "data": d(-R.randint(180, 1100)),
            "valor": valor + R.randint(-2000, 2000),
            "vidaContabilAnos": 10,
        },
        "ciclos": ciclos,
        "limiteCiclos": limite_ciclos,
        "estado": estado,
        "local": R.choice(LOCAIS),
        "temMedicao": R.random() < 0.78,
        "reservaSap": f"RES-{R.randint(400000, 499999)}" if R.random() < 0.7 else None,
        "poc": False,
    }
    if forcar:
        item.update(forcar)
    return item


for prefixo, fam, label, area, sub, valor, limite in FAMILIAS:
    for maquina in MAQUINAS_EMB:
        for fmt in R.sample(FORMATOS, k=2):
            itens.append(novo_item(prefixo, fam, label, area, sub, valor, limite,
                                   maquina, fmt["codigo"]))

for prefixo, fam, label, area, sub, valor, limite in FAM_POC:
    for i in range(4):
        maquina = f"CP-0{i+1}" if area == "compressao" else f"GR-0{i+1}"
        itens.append(novo_item(prefixo, fam, label, area, sub, valor, limite, maquina, None))

# item herói (substitui qualquer FS gerado com mesmo serial)
itens = [i for i in itens if i["serial"] != "FS-0192"]
heroi = {
    "serial": "FS-0192",
    "familia": "PLACA_SELAGEM",
    "familiaLabel": "Placa de selagem",
    "area": "embalagem",
    "subarea": "selagem",
    "site": "P-19",
    "galpao": "G2",
    "maquina": "BL-04",
    "formato": "NEO-4x8",
    "posicao": "SEL-A",
    "kit": "KIT-NEO-4x8-BL-04",
    "fornecedor": "P&F",
    "aquisicao": {"data": "2025-12-08", "valor": 48200, "vidaContabilAnos": 10},
    "ciclos": 812400,
    "limiteCiclos": 950000,
    "estado": "desgastado",
    "local": "avaliacao",
    "temMedicao": True,
    "reservaSap": "RES-441907",
    "poc": True,
    "referenciaZero": {"medicaoId": "MED-FS0192-000", "escaneadaEm": "2025-12-12"},
    "destaque": True,
}
itens.insert(0, heroi)

# itens da PoC nas outras duas áreas (marcados)
for it in itens:
    if it["serial"].startswith("PS-") and not any(x.get("poc") and x["area"] == "compressao" for x in itens):
        it["poc"] = True
    if it["serial"].startswith("TG-") and not any(x.get("poc") and x["area"] == "manipulacao" for x in itens):
        it["poc"] = True

# ---------------------------------------------------------------- movimentações
OPERADORES = ["Operador · turno A", "Operador · turno B", "Operador · turno C"]
movimentacoes = []
mid = 0
for it in itens:
    for k in range(R.randint(1, 3)):
        mid += 1
        dia = -R.randint(1, 45)
        movimentacoes.append({
            "id": f"MOV-{mid:04d}",
            "itemSerial": it["serial"],
            "tipo": "check-out",
            "data": dt(dia, R.choice([6, 14, 22]), R.randint(0, 59)),
            "op": f"OP-{R.randint(4470000, 4479999)}",
            "maquina": it["maquina"],
            "produto": next((f["produto"] for f in FORMATOS if f["codigo"] == it["formato"]), "—"),
            "operador": R.choice(OPERADORES),
            "motivo": None,
        })
        if R.random() < 0.86:
            mid += 1
            movimentacoes.append({
                "id": f"MOV-{mid:04d}",
                "itemSerial": it["serial"],
                "tipo": "check-in",
                "data": dt(dia, R.choice([13, 21, 5]), R.randint(0, 59)),
                "op": movimentacoes[-1]["op"],
                "maquina": it["maquina"],
                "produto": movimentacoes[-1]["produto"],
                "operador": R.choice(OPERADORES),
                "motivo": R.choice([None, "fim de campanha", "troca de formato", "troca em produção"]),
            })
movimentacoes.sort(key=lambda m: m["data"], reverse=True)

# ---------------------------------------------------------------- desvios (Guardião)
def pick(pred, n=1):
    c = [i["serial"] for i in itens if pred(i)]
    R.shuffle(c)
    return c[:n]


desvios = [
    {"id": "DSV-001", "tipo": "nao_devolvido", "rotulo": "Peça não devolvida",
     "itemSerial": pick(lambda i: i["local"] == "maquina" and i["area"] == "embalagem")[0],
     "severidade": "alta", "aberto": True, "abertoEm": dt(-3, 7, 12),
     "detalhe": "Check-out registrado há 3 dias, sem check-in. OP encerrada há 2 dias.",
     "acao": "Localizar na linha e registrar o retorno; se houve troca, informar o motivo.",
     "responsavel": "Líder de ferramentaria"},
    {"id": "DSV-002", "tipo": "troca_sem_motivo", "rotulo": "Troca em produção sem motivo registrado",
     "itemSerial": pick(lambda i: i["familia"] == "FACA_CORTE")[0],
     "severidade": "media", "aberto": True, "abertoEm": dt(-1, 22, 40),
     "detalhe": "Substituição durante a OP sem campo de motivo preenchido.",
     "acao": "Completar o registro no check-in; sem o motivo, a causa de desgaste não entra na curva.",
     "responsavel": "Operador · turno C"},
    {"id": "DSV-003", "tipo": "ciclos_acima_limite", "rotulo": "Ciclos acima do limite da família",
     "itemSerial": pick(lambda i: i["ciclos"] > i["limiteCiclos"])[0],
     "severidade": "alta", "aberto": True, "abertoEm": dt(-2, 9, 5),
     "detalhe": "Contador de ciclos ultrapassou o limite definido para a família sem medição de condição.",
     "acao": "Bloquear para avaliação no pré-setup do próximo formato.",
     "responsavel": "Líder de ferramentaria"},
    {"id": "DSV-004", "tipo": "sem_medicao", "rotulo": "Peça sem medição em dois ciclos de inventário",
     "itemSerial": pick(lambda i: not i["temMedicao"])[0],
     "severidade": "media", "aberto": True, "abertoEm": dt(-6, 11, 30),
     "detalhe": "Sem registro de condição desde a entrada na base serializada.",
     "acao": "Incluir na fila de avaliação do rig EMB-01.",
     "responsavel": "Excelência Operacional"},
    {"id": "DSV-005", "tipo": "divergencia_reserva", "rotulo": "Divergência entre reserva SAP e uso",
     "itemSerial": pick(lambda i: i["reservaSap"] is not None)[0],
     "severidade": "media", "aberto": True, "abertoEm": dt(-1, 6, 50),
     "detalhe": "Reserva emitida para a OP-4471023 e check-out feito com outro item da mesma posição.",
     "acao": "Confirmar qual peça rodou; a reserva alimenta o contador de ciclos.",
     "responsavel": "Planejamento"},
    {"id": "DSV-006", "tipo": "nao_devolvido", "rotulo": "Peça não devolvida",
     "itemSerial": pick(lambda i: i["area"] == "compressao")[0],
     "severidade": "baixa", "aberto": False, "abertoEm": dt(-12, 8, 0), "fechadoEm": dt(-11, 16, 20),
     "detalhe": "Retorno registrado com 1 dia de atraso.",
     "acao": "Encerrado.", "responsavel": "Líder de ferramentaria"},
]

# ---------------------------------------------------------------- OPs / ciclos
ops = []
for i in range(14):
    fmt = R.choice(FORMATOS)
    unidades = R.randint(180000, 900000)
    ops.append({
        "op": f"OP-447{1000 + i*137}",
        "produto": fmt["produto"],
        "formato": fmt["codigo"],
        "maquina": R.choice(MAQUINAS_EMB),
        "unidadesProduzidas": unidades,
        "bolhasPorGolpe": fmt["bolhasPorGolpe"],
        "golpes": round(unidades / fmt["bolhasPorGolpe"]),
        "inicio": d(-R.randint(10, 80)),
        "fonte": "SAP PP",
    })

# ---------------------------------------------------------------- trade-off
tradeoff = {
    "itemSerial": "FS-0192",
    "moeda": "BRL",
    "custoRepor": {"valor": 21000, "detalhe": "reposição + 6 semanas de prazo do fornecedor"},
    "custoManterProximos100k": {
        "valor": 38000,
        "componentes": [
            {"rotulo": "Velocidade abaixo da nominal (−3%)", "valor": 21400},
            {"rotulo": "Refugo e retrabalho (+0,5 p.p.)", "valor": 9200},
            {"rotulo": "2 setups longos por reavaliação", "valor": 7400},
        ],
    },
    "pontoOtimoGolpes": 845000,
    "curva": [
        {"ciclos": 400000, "manter": 4200, "repor": 21000},
        {"ciclos": 500000, "manter": 7100, "repor": 21000},
        {"ciclos": 600000, "manter": 11800, "repor": 21000},
        {"ciclos": 700000, "manter": 18600, "repor": 21000},
        {"ciclos": 812400, "manter": 29400, "repor": 21000},
        {"ciclos": 900000, "manter": 44500, "repor": 21000},
        {"ciclos": 1000000, "manter": 63200, "repor": 21000},
    ],
    "recomendacao": "substituir antes do próximo setup; acionar reserva e incluir na ficha de aquisição",
    "aviso": "Valores ilustrativos. A hora de linha e o OEE de referência são placeholders do business case e serão substituídos pelo baseline auditado da Fase 1.",
}

# ---------------------------------------------------------------- fornecedores
fornecedores = [
    {"codigo": "P&F", "nome": "Fornecedor P&F", "familias": ["PLACA_SELAGEM", "FORMA_TERMOFORMAGEM"],
     "precoMedio": 47500, "prazoSemanas": 6, "durabilidadeMediaGolpes": 890000,
     "foraDeSpecNoRecebimento": 4.0, "amostras": 18,
     "nota": "Referência da família de selagem."},
    {"codigo": "F&G", "nome": "Fornecedor F&G", "familias": ["FACA_CORTE", "GUIA_ALIMENTACAO"],
     "precoMedio": 38900, "prazoSemanas": 4, "durabilidadeMediaGolpes": 612000,
     "foraDeSpecNoRecebimento": 11.0, "amostras": 15,
     "nota": "Preço menor e prazo melhor, durabilidade observada 31% inferior — hipótese a confirmar com mais amostras na Fase 2."},
]

# ---------------------------------------------------------------- fichas e 3YP
fichas = [
    {"id": "FA-2027-001", "familia": "PLACA_SELAGEM", "itemOrigem": "FS-0192", "quantidade": 2,
     "valorUnitario": 48200, "exercicio": 2027, "origem": "condição medida", "status": "rascunho"},
    {"id": "FA-2027-002", "familia": "FACA_CORTE", "itemOrigem": None, "quantidade": 5,
     "valorUnitario": 21800, "exercicio": 2027, "origem": "ciclos acima do limite", "status": "rascunho"},
    {"id": "FA-2027-003", "familia": "FORMA_TERMOFORMAGEM", "itemOrigem": None, "quantidade": 3,
     "valorUnitario": 38000, "exercicio": 2027, "origem": "condição medida", "status": "rascunho"},
    {"id": "FA-2027-004", "familia": "PUNCAO_SUPERIOR", "itemOrigem": None, "quantidade": 24,
     "valorUnitario": 4700, "exercicio": 2027, "origem": "tendência de desgaste", "status": "rascunho"},
]
plano3yp = [
    {"exercicio": 2027, "familia": "PLACA_SELAGEM", "quantidade": 2, "valor": 96400},
    {"exercicio": 2027, "familia": "FACA_CORTE", "quantidade": 5, "valor": 109000},
    {"exercicio": 2027, "familia": "FORMA_TERMOFORMAGEM", "quantidade": 3, "valor": 114000},
    {"exercicio": 2027, "familia": "PUNCAO_SUPERIOR", "quantidade": 24, "valor": 112800},
    {"exercicio": 2028, "familia": "PLACA_SELAGEM", "quantidade": 4, "valor": 192800},
    {"exercicio": 2028, "familia": "FACA_CORTE", "quantidade": 6, "valor": 130800},
    {"exercicio": 2028, "familia": "FORMA_TERMOFORMAGEM", "quantidade": 2, "valor": 76000},
    {"exercicio": 2028, "familia": "PUNCAO_SUPERIOR", "quantidade": 18, "valor": 84600},
    {"exercicio": 2029, "familia": "PLACA_SELAGEM", "quantidade": 3, "valor": 144600},
    {"exercicio": 2029, "familia": "FACA_CORTE", "quantidade": 8, "valor": 174400},
    {"exercicio": 2029, "familia": "FORMA_TERMOFORMAGEM", "quantidade": 4, "valor": 152000},
    {"exercicio": 2029, "familia": "PUNCAO_SUPERIOR", "quantidade": 20, "valor": 94000},
]

# ---------------------------------------------------------------- business case
businessCase = {
    "fonte": "Hypera_Business_Case_Ferramentaria_Memorial_v0.xlsx",
    "moeda": "BRL",
    "unidade": "MM/ano",
    "aviso": "Hora de linha, OEE e tempo de setup são placeholders declarados pela Hypera como indisponíveis; serão substituídos pelo baseline auditado da Fase 1.",
    "alavancas": [
        {"id": "oee_disp", "rotulo": "OEE — Disponibilidade (setup mais curto)", "fase": "F3",
         "piloto": {"conservador": 0.29, "base": 0.43, "otimista": 0.58},
         "parque": {"conservador": 1.30, "base": 1.94, "otimista": 2.59}},
        {"id": "oee_perf", "rotulo": "OEE — Performance (velocidade nominal)", "fase": "F3",
         "piloto": {"conservador": 0.46, "base": 0.86, "otimista": 1.71},
         "parque": {"conservador": 2.06, "base": 3.86, "otimista": 7.71}},
        {"id": "oee_qual", "rotulo": "OEE — Qualidade (refugo e retrabalho)", "fase": "F2–F3",
         "piloto": {"conservador": 0.11, "base": 0.29, "otimista": 0.51},
         "parque": {"conservador": 0.51, "base": 1.29, "otimista": 2.31}},
        {"id": "capex", "rotulo": "CAPEX — compra evitada por condição medida", "fase": "F1 → F4",
         "piloto": {"conservador": 0.20, "base": 0.30, "otimista": 0.40},
         "parque": {"conservador": 0.90, "base": 1.35, "otimista": 1.80}},
        {"id": "opex", "rotulo": "OPEX — produtividade, reparo e capital de giro", "fase": "F1–F3",
         "piloto": {"conservador": 0.17, "base": 0.21, "otimista": 0.24},
         "parque": {"conservador": 0.77, "base": 0.93, "otimista": 1.10}},
    ],
    "totais": {
        "piloto": {"conservador": 1.23, "base": 2.08, "otimista": 3.45},
        "parque": {"conservador": 5.53, "base": 9.37, "otimista": 15.51},
    },
    "efeitoContabil": {"piloto": 0.47, "parque": 2.10,
                       "nota": "Informativo — vida útil contábil de 10 anos contra vida real de ~3 (CPC 27 / IAS 16)."},
    "capturaPorFase": [
        {"fase": "Fase 1", "acumulado": 0.30, "rotulo": "Baseline auditado + pacote CAPEX fev/27"},
        {"fase": "Fase 2", "acumulado": 0.59, "rotulo": "Critério objetivo em rotina"},
        {"fase": "Fase 3", "acumulado": 1.87, "rotulo": "OEE por ferramenta e trade-off"},
        {"fase": "Fase 4", "acumulado": 2.08, "rotulo": "Escala e política de reposição"},
    ],
}

# ---------------------------------------------------------------- agentes / perfis / roteiro
agentes = [
    {"id": "guardiao", "numero": 1, "nome": "Guardião de Dados", "fase": "Fase 1", "degrau": 2,
     "estado": "ativo",
     "resumo": "Lê a base serializada e o check-in/check-out; aponta desvios, explica como tratar e a quem alertar.",
     "stack": ["BigQuery", "ADK", "Gemini (explicação)"]},
    {"id": "visao", "numero": 2, "nome": "Agente de Visão", "fase": "Fase 2", "degrau": 3,
     "estado": "ativo",
     "resumo": "Classifica defeitos e mede cotas críticas no pré-setup e no recebimento; compara com a peça nova e com o histórico.",
     "stack": ["Vertex AI Vision", "Visual Inspection AI", "Cloud Storage"]},
    {"id": "tradeoff", "numero": 3, "nome": "Trade-Off CAPEX × OPEX", "fase": "Fase 3", "degrau": 3,
     "estado": "ativo",
     "resumo": "Conecta condição, ciclos e perdas de OEE ao custo de manter contra o custo de repor.",
     "stack": ["BigQuery", "Cortex Framework (SAP)", "Agent Engine"]},
    {"id": "reposicao", "numero": 4, "nome": "Reposição & Fornecedores", "fase": "Fase 4", "degrau": 4,
     "estado": "ativo",
     "resumo": "Fichas de aquisição, 3YP e comparação de durabilidade por fornecedor a partir do recebimento.",
     "stack": ["BigQuery", "Looker", "Gemini Enterprise"]},
    {"id": "diagnostico", "numero": 5, "nome": "Diagnóstico de Máquina", "fase": "Próxima onda", "degrau": 4,
     "estado": "bloqueado",
     "resumo": "Desgaste assimétrico medido na ferramenta como sinal de empeno ou desalinhamento do equipamento.",
     "stack": ["Manufacturing Data Engine", "Vertex AI"]},
]

perfis = [
    {"id": "operador", "nome": "Operador · separação", "ve": ["checkin", "guardiao"],
     "descricao": "Check-in e check-out, alerta de peça sem retorno, o que conferir antes do setup."},
    {"id": "lider", "nome": "Líder de ferramentaria", "ve": ["guardiao", "visao", "checkin"],
     "descricao": "Fila de avaliação, resultado do agente de visão, dupla checagem digital, peças a reparar."},
    {"id": "excelencia", "nome": "Excelência Operacional", "ve": ["guardiao", "visao", "tradeoff", "diagnostico"],
     "descricao": "Índice de saúde do parque, desvios abertos, OEE por ferramenta, causa raiz de desgaste anormal."},
    {"id": "controladoria", "nome": "Controladoria e Diretoria", "ve": ["tradeoff", "reposicao", "valor"],
     "descricao": "Trade-off consolidado, CAPEX com lastro em medição, 3YP e margem por SKU."},
]

roteiro = [
    {"passo": 1, "rota": "/guardiao", "perfil": "lider",
     "titulo": "O dia começa com desvios, não com relatório",
     "fala": "Cinco desvios abertos na sub-área. O Guardião já sabe qual peça não voltou, qual trocou sem motivo e qual passou do limite de ciclos. Isso é Fase 1, com os dados que a Hypera já tem hoje."},
    {"passo": 2, "rota": "/checkin", "perfil": "operador",
     "titulo": "A rastreabilidade nasce no celular do operador",
     "fala": "Check-out do kit com item serial, OP e máquina. Sem isso não existe contador de ciclos, e sem ciclos não existe trade-off nem predição."},
    {"passo": 3, "rota": "/visao?item=FS-0192",
     "perfil": "lider", "titulo": "A peça voltou e entrou na fila de avaliação",
     "fala": "Placa de selagem FS-0192, máquina BL-04, formato Neosaldina. 812 mil golpes desde a última medição."},
    {"passo": 4, "rota": "/visao?item=FS-0192&acao=varrer", "perfil": "lider",
     "titulo": "O agente vê e mede",
     "fala": "Classificação e metrologia são dois problemas diferentes. A cor vem da tolerância, não da opinião: a cavidade 06 está em 4,12 contra 4,30 ± 0,10."},
    {"passo": 5, "rota": "/visao?item=FS-0192&painel=historico", "perfil": "lider",
     "titulo": "Contra a peça nova e contra ela mesma",
     "fala": "Quatro medições desde dezembro. A tendência é de 9% a cada 100 mil golpes. Isso é degrau 2 — extrapolação, não predição."},
    {"passo": 6, "rota": "/visao?item=FS-0192&painel=decisao", "perfil": "lider",
     "titulo": "Quem decide é o líder, e fica registrado",
     "fala": "O sistema recomenda substituir antes do próximo setup. A disposição da peça é humana, com nome, hora e trilha — é o que sustenta o desenho de apoio à decisão."},
    {"passo": 7, "rota": "/tradeoff?item=FS-0192", "perfil": "excelencia",
     "titulo": "Quanto custa manter essa peça na máquina",
     "fala": "Manter mais 100 mil golpes custa R$ 38 mil em velocidade, refugo e setup. Repor custa R$ 21 mil e seis semanas. O ponto ótimo é agora."},
    {"passo": 8, "rota": "/reposicao", "perfil": "controladoria",
     "titulo": "A decisão vira ficha, e a ficha vira 3YP",
     "fala": "A peça entra na ficha de aquisição de 2027 com lastro em medição. E a comparação de fornecedores mostra por que a peça que 'entrou boa e veio ruim' não era acaso."},
    {"passo": 9, "rota": "/valor", "perfil": "controladoria",
     "titulo": "O que isso vale por ano",
     "fala": "R$ 2,08 milhões no piloto, R$ 9,37 milhões no parque declarado, cenário base. Cada fase captura uma parte e é medida contra o baseline."},
]

seed = {
    "meta": {
        "produto": "FerraMon",
        "subtitulo": "Ferramentaria Guiada por Dados",
        "cliente": "Hypera Pharma · P-19 Anápolis · embalagem",
        "parceria": "Monoda Consulting × Google Cloud",
        "versao": "0.1.0",
        "geradoEm": HOJE.isoformat(),
        "ambiente": "demonstrativo",
        "aviso": "Ambiente demonstrativo. Dados, medições, scores e valores são fictícios e servem para demonstrar a mecânica da plataforma. Nenhum número aqui é medição real de ferramental da Hypera.",
    },
    "agentes": agentes,
    "perfis": perfis,
    "roteiro": roteiro,
    "geometria": geometria,
    "specs": {"profundidadeCavidade": SPEC_PROF},
    "itens": itens,
    "medicoes": medicoes,
    "tendencia": tendencia,
    "movimentacoes": movimentacoes[:160],
    "desvios": desvios,
    "ops": ops,
    "tradeoff": tradeoff,
    "fornecedores": fornecedores,
    "fichasAquisicao": fichas,
    "plano3YP": plano3yp,
    "businessCase": businessCase,
    "formatos": FORMATOS,
}

SAIDA = pathlib.Path(__file__).resolve().parent.parent / "src" / "dados" / "seed.json"
SAIDA.parent.mkdir(parents=True, exist_ok=True)
with SAIDA.open("w", encoding="utf-8") as f:
    json.dump(seed, f, ensure_ascii=False, indent=2)

print("gravado em:", SAIDA)
print("itens:", len(itens))
print("movimentacoes:", len(seed["movimentacoes"]))
print("cavidades:", len(cavidades), "serrilhas:", len(serrilhas))
print("estados:", {e: sum(1 for i in itens if i["estado"] == e) for e in ["novo", "ok", "desgastado", "danificado"]})
print("C06:", prof_atual["C06"], "C17:", prof_atual["C17"])
fora = [c["alvo"] for c in medicoes[-1]["cotas"] if c["status"] == "fora"]
aten = [c["alvo"] for c in medicoes[-1]["cotas"] if c["status"] == "atencao"]
print("cotas fora:", fora)
print("cotas atencao:", aten)
