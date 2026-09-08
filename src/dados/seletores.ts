/*
 * Funções puras de consulta sobre o seed. Toda tela lê daqui.
 * Se uma tela precisa de um recorte novo, ele nasce neste arquivo — nunca
 * dentro do componente, e nunca com dado inventado.
 */
import bruto from './seed.json'
import type {
  Achado,
  Agente,
  Area,
  Cavidade,
  Cota,
  Desvio,
  EstadoCondicao,
  Item,
  LocalItem,
  Medicao,
  Movimentacao,
  Perfil,
  Seed,
  StatusCota,
} from './tipos'

export const seed = bruto as unknown as Seed

export const meta = seed.meta
export const agentes = seed.agentes
export const perfis = seed.perfis
export const roteiro = seed.roteiro
export const geometria = seed.geometria
export const specs = seed.specs
export const itens = seed.itens
export const medicoes = seed.medicoes
export const tendencia = seed.tendencia
export const movimentacoes = seed.movimentacoes
export const desvios = seed.desvios
export const ops = seed.ops
export const tradeoff = seed.tradeoff
export const fornecedores = seed.fornecedores
export const fichasAquisicao = seed.fichasAquisicao
export const plano3YP = seed.plano3YP
export const businessCase = seed.businessCase
export const formatos = seed.formatos

/** A peça herói da demonstração. */
export const SERIAL_HEROI = 'FS-0192'

// ---------------------------------------------------------------- itens

export function itemPorSerial(serial: string): Item | undefined {
  return itens.find((i) => i.serial === serial)
}

export function itensPorArea(area: Area): Item[] {
  return itens.filter((i) => i.area === area)
}

export function itensPorLocal(local: LocalItem): Item[] {
  return itens.filter((i) => i.local === local)
}

export function itensPorFamilia(familia: string): Item[] {
  return itens.filter((i) => i.familia === familia)
}

/** Peças da prova de conceito — uma por área, para mostrar que o conceito atravessa as três. */
export function itensPoc(): Item[] {
  return itens.filter((i) => i.poc)
}

/** Fração de vida consumida: ciclos ÷ limite. Pode passar de 1. */
export function consumoDeVida(item: Item): number {
  if (!item.limiteCiclos) return 0
  return item.ciclos / item.limiteCiclos
}

/** A barra de consumo de vida usa a mesma semântica de cor das cotas. */
export function statusDoConsumo(item: Item): StatusCota {
  const r = consumoDeVida(item)
  if (r >= 1) return 'fora'
  if (r >= 0.75) return 'atencao'
  return 'ok'
}

// ---------------------------------------------------------------- medições

export function medicoesDoItem(serial: string): Medicao[] {
  return medicoes
    .filter((m) => m.itemSerial === serial)
    .slice()
    .sort((a, b) => a.data.localeCompare(b.data))
}

export function ultimaMedicao(serial: string): Medicao | undefined {
  const lista = medicoesDoItem(serial)
  return lista.length ? lista[lista.length - 1] : undefined
}

export function medicaoPorId(id: string): Medicao | undefined {
  return medicoes.find((m) => m.id === id)
}

/** O escaneamento da peça nova, referência de comparação. */
export function pontoZero(serial: string): Medicao | undefined {
  const item = itemPorSerial(serial)
  if (item?.referenciaZero) return medicaoPorId(item.referenciaZero.medicaoId)
  return medicoesDoItem(serial)[0]
}

export function cotaPorAlvo(medicao: Medicao | undefined, alvo: string): Cota | undefined {
  return medicao?.cotas.find((c) => c.alvo === alvo)
}

/** Quantas cavidades estão fora, em atenção e dentro. Alimenta o resumo do painel. */
export function resumoDasCotas(medicao: Medicao | undefined) {
  const base = { fora: 0, atencao: 0, ok: 0, total: 0 }
  if (!medicao) return base
  for (const c of medicao.cotas) {
    base.total += 1
    base[c.status] += 1
  }
  return base
}

/** Achados em ordem decrescente de score — é a ordem em que aparecem na varredura. */
export function achadosPorScore(medicao: Medicao | undefined): Achado[] {
  if (!medicao) return []
  return medicao.achados.slice().sort((a, b) => b.score - a.score)
}

/** Abaixo deste score o achado é registrado para acompanhamento, nunca vira veredito. */
export const LIMIAR_DECISAO = 0.5

export function abaixoDoLimiar(achado: Achado): boolean {
  return achado.score < LIMIAR_DECISAO
}

/** Ids de cavidade/serrilha que um achado aponta ("C11,C12" → ["C11","C12"]). */
export function alvosDoAchado(achado: Achado): string[] {
  return achado.alvo
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/** A mesma cota ao longo das medições, para o cartão da cavidade mostrar o histórico. */
export function historicoDaCota(serial: string, alvo: string) {
  return medicoesDoItem(serial).map((m) => ({
    medicaoId: m.id,
    data: m.data,
    ciclos: m.ciclosNaMedicao,
    valor: cotaPorAlvo(m, alvo)?.valor ?? null,
    status: cotaPorAlvo(m, alvo)?.status ?? null,
  }))
}

// ---------------------------------------------------------------- geometria

export function cavidadePorId(id: string): Cavidade | undefined {
  return geometria.cavidades.find((c) => c.id === id)
}

export function serrilhaPorId(id: string) {
  return geometria.serrilhas.find((s) => s.id === id)
}

// ---------------------------------------------------------------- desvios

export function desviosAbertos(): Desvio[] {
  const ordemSeveridade = { alta: 0, media: 1, baixa: 2 }
  return desvios
    .filter((d) => d.aberto)
    .slice()
    .sort(
      (a, b) =>
        ordemSeveridade[a.severidade] - ordemSeveridade[b.severidade] ||
        b.abertoEm.localeCompare(a.abertoEm),
    )
}

export function desviosDoItem(serial: string): Desvio[] {
  return desvios.filter((d) => d.itemSerial === serial)
}

/** Um contador por tipo de desvio, na ordem em que aparecem no seed. */
export function contadoresDeDesvio() {
  const tipos = Array.from(new Set(desvios.map((d) => d.tipo)))
  return tipos.map((tipo) => {
    const doTipo = desvios.filter((d) => d.tipo === tipo)
    return {
      tipo,
      rotulo: doTipo[0].rotulo,
      abertos: doTipo.filter((d) => d.aberto).length,
      total: doTipo.length,
    }
  })
}

// ---------------------------------------------------------------- movimentações

/** Mais recente primeiro. */
export function movimentacoesDoItem(serial: string): Movimentacao[] {
  return movimentacoes
    .filter((m) => m.itemSerial === serial)
    .slice()
    .sort((a, b) => b.data.localeCompare(a.data))
}

export function ultimaMovimentacao(serial: string): Movimentacao | undefined {
  return movimentacoesDoItem(serial)[0]
}

export function opPorCodigo(codigo: string) {
  return ops.find((o) => o.op === codigo)
}

// ---------------------------------------------------------------- parque

/**
 * Saúde do parque a partir dos 57 itens. Tudo derivado, nada digitado:
 * é o que a tela de valor e o painel de excelência mostram.
 */
export function resumoDoParque() {
  const porEstado: Record<EstadoCondicao, number> = {
    novo: 0,
    ok: 0,
    desgastado: 0,
    danificado: 0,
  }
  const porArea: Record<string, number> = {}
  const porLocal: Record<string, number> = {}
  let acimaDoLimite = 0
  let semMedicao = 0
  let valorTotal = 0

  for (const i of itens) {
    porEstado[i.estado] += 1
    porArea[i.area] = (porArea[i.area] ?? 0) + 1
    porLocal[i.local] = (porLocal[i.local] ?? 0) + 1
    if (i.ciclos > i.limiteCiclos) acimaDoLimite += 1
    if (!i.temMedicao) semMedicao += 1
    valorTotal += i.aquisicao.valor
  }

  return {
    total: itens.length,
    porEstado,
    porArea,
    porLocal,
    acimaDoLimite,
    semMedicao,
    valorTotal,
  }
}

/** Distribuição de estado dentro de uma área — usado no painel de valor. */
export function saudePorArea() {
  const areas = Array.from(new Set(itens.map((i) => i.area)))
  return areas.map((area) => {
    const daArea = itens.filter((i) => i.area === area)
    return {
      area,
      total: daArea.length,
      novo: daArea.filter((i) => i.estado === 'novo').length,
      ok: daArea.filter((i) => i.estado === 'ok').length,
      desgastado: daArea.filter((i) => i.estado === 'desgastado').length,
      danificado: daArea.filter((i) => i.estado === 'danificado').length,
    }
  })
}

// ---------------------------------------------------------------- casca

export function agentePorId(id: string): Agente | undefined {
  return agentes.find((a) => a.id === id)
}

export function perfilPorId(id: string): Perfil | undefined {
  return perfis.find((p) => p.id === id)
}

/** Lista de valores distintos de um campo, para montar os filtros da base serializada. */
export function valoresDistintos<C extends keyof Item>(campo: C): NonNullable<Item[C]>[] {
  const vistos = new Set<NonNullable<Item[C]>>()
  for (const i of itens) {
    const v = i[campo]
    if (v !== null && v !== undefined) vistos.add(v as NonNullable<Item[C]>)
  }
  return Array.from(vistos).sort((a, b) => String(a).localeCompare(String(b), 'pt-BR'))
}

/**
 * Resolve um caminho de asset do seed ("/assets/placa-FS-0192.jpg") para uma
 * referência relativa ao documento. Sem isso, a build aberta por file://
 * procuraria a foto na raiz do sistema de arquivos.
 */
export function caminhoAsset(caminho: string): string {
  return caminho.startsWith('/') ? `.${caminho}` : caminho
}
