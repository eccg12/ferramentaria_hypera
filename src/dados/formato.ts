/*
 * Formatação pt-BR. Milhar com ponto, decimal com vírgula.
 * Cotas sempre com 2 casas; ciclos sempre com separador.
 */

const inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const duasCasas = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const umaCasa = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

/** 812400 → "812.400" */
export const num = (v: number) => inteiro.format(v)

/** 812400 → "812.400 golpes" */
export const golpes = (v: number) => `${inteiro.format(v)} golpes`

/** 4.12 → "4,12" */
export const cota = (v: number) => duasCasas.format(v)

/** 41 → "41,0%" */
export const pct = (v: number) => `${umaCasa.format(v)}%`

/** 38000 → "R$ 38.000" */
export const brl = (v: number) => moeda.format(v)

/** 2.08 → "R$ 2,08 MM" */
export const milhoes = (v: number) => `R$ ${duasCasas.format(v)} MM`

/** "2026-09-07T14:32:00" → "07/09/2026" */
export function data(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** "2026-09-07T14:32:00" → "07/09/2026 14:32" */
export function dataHora(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${data(iso)} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

/** "2026-09-07T14:32:00" → "14:32" */
export function hora(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Tempo decorrido em linguagem de chão de fábrica: "há 3 dias", "há 4 h".
 * `agora` é injetável para a demo não depender do relógio da máquina.
 */
export function decorrido(iso: string, agora: Date = new Date()): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const min = Math.max(0, Math.round((agora.getTime() - d.getTime()) / 60000))
  if (min < 60) return `há ${min} min`
  const h = Math.round(min / 60)
  if (h < 48) return `há ${h} h`
  return `há ${Math.round(h / 24)} dias`
}

/** "PLACA_SELAGEM" → "Placa selagem" (só para rótulos de agregação, sem familiaLabel à mão) */
export function familiaLegivel(chave: string): string {
  const s = chave.toLowerCase().replace(/_/g, ' ')
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** "selagem" → "Selagem"; null → "—" */
export function capitalizar(v: string | null | undefined): string {
  if (!v) return '—'
  return v.charAt(0).toUpperCase() + v.slice(1)
}
