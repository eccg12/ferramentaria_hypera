/*
 * A varredura: a única animação orquestrada do produto.
 *
 * Uma linha atravessa a placa de cima a baixo em ~2,2 s. As cavidades acima
 * dela vão sendo classificadas conforme a linha passa; os achados aparecem em
 * ordem decrescente de score, com 180 ms entre eles; o painel de leitura
 * preenche no mesmo ritmo.
 *
 * Com prefers-reduced-motion, tudo aparece de uma vez, sem a passada.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { geometria } from '../../dados/seletores'
import type { Achado, Cota, Medicao } from '../../dados/tipos'

export const DURACAO_MS = 2200
const INTERVALO_ACHADO_MS = 180

export type FaseVarredura = 'ociosa' | 'correndo' | 'concluida'

function prefereMenosMovimento(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  )
}

export function usarVarredura(medicao?: Medicao) {
  const [fase, setFase] = useState<FaseVarredura>('ociosa')
  const [progresso, setProgresso] = useState(0)
  const [achadosRevelados, setAchadosRevelados] = useState(0)
  const quadro = useRef<number | null>(null)
  const relogios = useRef<number[]>([])

  /** Cavidade por altura: a linha classifica o que já passou. */
  const alturaDaCavidade = useMemo(() => {
    const m = new Map<string, number>()
    for (const c of geometria.cavidades) m.set(c.id, c.cy)
    return m
  }, [])

  const achadosOrdenados = useMemo(
    () => (medicao?.achados ?? []).slice().sort((a, b) => b.score - a.score),
    [medicao],
  )

  const limpar = useCallback(() => {
    if (quadro.current !== null) cancelAnimationFrame(quadro.current)
    quadro.current = null
    relogios.current.forEach((t) => window.clearTimeout(t))
    relogios.current = []
  }, [])

  const reiniciar = useCallback(() => {
    limpar()
    setFase('ociosa')
    setProgresso(0)
    setAchadosRevelados(0)
  }, [limpar])

  const concluir = useCallback(() => {
    limpar()
    setProgresso(1)
    setAchadosRevelados(achadosOrdenados.length)
    setFase('concluida')
  }, [achadosOrdenados.length, limpar])

  const avaliar = useCallback(() => {
    limpar()
    if (prefereMenosMovimento()) {
      concluir()
      return
    }
    setFase('correndo')
    setProgresso(0)
    setAchadosRevelados(0)

    const inicio = performance.now()
    const passo = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / DURACAO_MS)
      setProgresso(t)
      if (t < 1) {
        quadro.current = requestAnimationFrame(passo)
      } else {
        quadro.current = null
        setFase('concluida')
      }
    }
    quadro.current = requestAnimationFrame(passo)

    // achados entram em sequência, na ordem de score, depois da passada
    achadosOrdenados.forEach((_, i) => {
      relogios.current.push(
        window.setTimeout(() => setAchadosRevelados(i + 1), DURACAO_MS + i * INTERVALO_ACHADO_MS),
      )
    })
  }, [achadosOrdenados, concluir, limpar])

  useEffect(() => limpar, [limpar])

  /** Cotas já classificadas neste instante da passada. */
  const cotasVisiveis: Cota[] = useMemo(() => {
    if (!medicao) return []
    if (fase !== 'correndo') return fase === 'concluida' ? medicao.cotas : []
    return medicao.cotas.filter((c) => (alturaDaCavidade.get(c.alvo) ?? 1) <= progresso)
  }, [medicao, fase, progresso, alturaDaCavidade])

  const achadosVisiveis: Achado[] = useMemo(
    () => achadosOrdenados.slice(0, fase === 'ociosa' ? 0 : achadosRevelados),
    [achadosOrdenados, achadosRevelados, fase],
  )

  /**
   * Quantos blocos do painel de leitura já podem aparecer. O painel preenche
   * de cima para baixo no mesmo ritmo da passada.
   */
  const blocosRevelados = useMemo(() => {
    if (fase === 'ociosa') return 0
    if (fase === 'concluida') return 99
    return Math.floor(progresso * 5)
  }, [fase, progresso])

  return {
    fase,
    progresso: fase === 'correndo' ? progresso : null,
    cotasVisiveis,
    achadosVisiveis,
    achadosOrdenados,
    blocosRevelados,
    avaliar,
    reiniciar,
  }
}
