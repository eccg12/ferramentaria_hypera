/*
 * Mapa de desgaste: camada COMPUTADA, não fotografia.
 *
 * Interpola as profundidades medidas das 32 cavidades por ponderação do
 * inverso da distância e devolve um PNG pequeno para ser esticado sobre a
 * peça. Nada é pintado sobre o metal da foto: o que se vê é a superfície de
 * interpolação das cotas, sobreposta em translucidez.
 */
import type { Cavidade, Cota } from '../../dados/tipos'

const LARG = 96
const ALT = 54
const POTENCIA = 2.4

/** Rampa das cinco cores semânticas: verde dentro, âmbar em atenção, vermelho fora. */
function cor(t: number): [number, number, number] {
  // t = 0 no nominal, 1 no pior desvio observado
  const paradas: [number, [number, number, number]][] = [
    [0.0, [22, 208, 126]], // --tolerancia
    [0.55, [245, 166, 35]], // --atencao
    [1.0, [239, 59, 78]], // --condenar
  ]
  const u = Math.min(1, Math.max(0, t))
  for (let i = 1; i < paradas.length; i += 1) {
    const [p1, c1] = paradas[i]
    const [p0, c0] = paradas[i - 1]
    if (u <= p1) {
      const f = (u - p0) / (p1 - p0)
      return [
        Math.round(c0[0] + (c1[0] - c0[0]) * f),
        Math.round(c0[1] + (c1[1] - c0[1]) * f),
        Math.round(c0[2] + (c1[2] - c0[2]) * f),
      ]
    }
  }
  return paradas[paradas.length - 1][1]
}

/**
 * Devolve um data: URL com a superfície interpolada, ou null quando não há
 * cotas suficientes. Cada pixel é o desvio absoluto em relação ao nominal,
 * normalizado pelo maior desvio da própria medição.
 */
export function gerarMapaDesgaste(cavidades: Cavidade[], cotas: Cota[]): string | null {
  const pontos = cavidades
    .map((c) => ({ cav: c, cota: cotas.find((k) => k.alvo === c.id) }))
    .filter((p): p is { cav: Cavidade; cota: Cota } => Boolean(p.cota))

  if (pontos.length < 3) return null

  const desvios = pontos.map((p) => Math.abs(p.cota.valor - p.cota.nominal))
  const maior = Math.max(...desvios, 1e-6)

  const tela = document.createElement('canvas')
  tela.width = LARG
  tela.height = ALT
  const ctx = tela.getContext('2d')
  if (!ctx) return null

  const img = ctx.createImageData(LARG, ALT)

  for (let y = 0; y < ALT; y += 1) {
    for (let x = 0; x < LARG; x += 1) {
      const nx = (x + 0.5) / LARG
      const ny = (y + 0.5) / ALT

      let soma = 0
      let peso = 0
      for (let i = 0; i < pontos.length; i += 1) {
        const { cav } = pontos[i]
        // distância no espaço da imagem, corrigida pela proporção 2000×1132
        const dx = nx - cav.cx
        const dy = (ny - cav.cy) * (1132 / 2000)
        const d2 = dx * dx + dy * dy
        if (d2 < 1e-9) {
          soma = desvios[i]
          peso = 1
          break
        }
        const w = 1 / Math.pow(d2, POTENCIA / 2)
        soma += desvios[i] * w
        peso += w
      }

      const valor = peso > 0 ? soma / peso : 0
      const [r, g, b] = cor(valor / maior)
      const p = (y * LARG + x) * 4
      img.data[p] = r
      img.data[p + 1] = g
      img.data[p + 2] = b
      // mais opaco onde o desvio é maior: a atenção vai para o problema
      img.data[p + 3] = Math.round(40 + 150 * Math.min(1, valor / maior))
    }
  }

  ctx.putImageData(img, 0, 0)
  return tela.toDataURL('image/png')
}
