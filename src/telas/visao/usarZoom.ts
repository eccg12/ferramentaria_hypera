/*
 * Zoom e arrasto da bancada. Fica fora do componente para a bancada continuar
 * legível: o que importa lá é o desenho das camadas.
 */
import { useCallback, useEffect, useRef, useState } from 'react'

export const ESCALA_MIN = 0.8
export const ESCALA_MAX = 4

interface Vista {
  escala: number
  x: number
  y: number
}

const VISTA_INICIAL: Vista = { escala: 1, x: 0, y: 0 }

export function usarZoom() {
  const container = useRef<HTMLDivElement>(null)
  const [vista, setVista] = useState<Vista>(VISTA_INICIAL)
  const arrasto = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const [arrastando, setArrastando] = useState(false)

  const reenquadrar = useCallback(() => setVista(VISTA_INICIAL), [])

  /** Zoom ancorado no ponteiro: o ponto sob o cursor não escorrega. */
  const aplicarZoom = useCallback((fator: number, clienteX?: number, clienteY?: number) => {
    setVista((v) => {
      const nova = Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, v.escala * fator))
      if (nova === v.escala) return v
      const caixa = container.current?.getBoundingClientRect()
      if (!caixa || clienteX === undefined || clienteY === undefined) {
        return { ...v, escala: nova }
      }
      const cx = clienteX - caixa.left - caixa.width / 2
      const cy = clienteY - caixa.top - caixa.height / 2
      return {
        escala: nova,
        x: cx - ((cx - v.x) / v.escala) * nova,
        y: cy - ((cy - v.y) / v.escala) * nova,
      }
    })
  }, [])

  // roda do mouse: listener não passivo, para poder impedir a rolagem da página
  useEffect(() => {
    const el = container.current
    if (!el) return
    const aoRolar = (e: WheelEvent) => {
      e.preventDefault()
      aplicarZoom(Math.exp(-e.deltaY * 0.0016), e.clientX, e.clientY)
    }
    el.addEventListener('wheel', aoRolar, { passive: false })
    return () => el.removeEventListener('wheel', aoRolar)
  }, [aplicarZoom])

  /*
   * O arrasto usa ouvintes de janela em vez de setPointerCapture. Com captura,
   * o clique deixa de chegar na cavidade — e clicar na cavidade é a interação
   * principal desta tela.
   */
  const moveu = useRef(false)

  const aoPressionar = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      arrasto.current = { x: e.clientX, y: e.clientY, ox: vista.x, oy: vista.y }
      moveu.current = false
      setArrastando(true)
    },
    [vista.x, vista.y],
  )

  useEffect(() => {
    if (!arrastando) return
    const aoMover = (e: PointerEvent) => {
      const a = arrasto.current
      if (!a) return
      const dx = e.clientX - a.x
      const dy = e.clientY - a.y
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moveu.current = true
      setVista((v) => ({ ...v, x: a.ox + dx, y: a.oy + dy }))
    }
    const aoSoltar = () => {
      arrasto.current = null
      setArrastando(false)
    }
    window.addEventListener('pointermove', aoMover)
    window.addEventListener('pointerup', aoSoltar)
    window.addEventListener('pointercancel', aoSoltar)
    return () => {
      window.removeEventListener('pointermove', aoMover)
      window.removeEventListener('pointerup', aoSoltar)
      window.removeEventListener('pointercancel', aoSoltar)
    }
  }, [arrastando])

  /** Verdadeiro quando o ponteiro andou de verdade: o clique não deve contar. */
  const houveArrasto = useCallback(() => moveu.current, [])

  /** Teclado: setas movem, + e − aproximam, 0 reenquadra. */
  const aoTeclar = useCallback(
    (e: React.KeyboardEvent) => {
      const passo = e.shiftKey ? 60 : 20
      const mapa: Record<string, () => void> = {
        ArrowLeft: () => setVista((v) => ({ ...v, x: v.x + passo })),
        ArrowRight: () => setVista((v) => ({ ...v, x: v.x - passo })),
        ArrowUp: () => setVista((v) => ({ ...v, y: v.y + passo })),
        ArrowDown: () => setVista((v) => ({ ...v, y: v.y - passo })),
        '+': () => aplicarZoom(1.2),
        '=': () => aplicarZoom(1.2),
        '-': () => aplicarZoom(1 / 1.2),
        '0': reenquadrar,
      }
      const acao = mapa[e.key]
      if (acao) {
        e.preventDefault()
        acao()
      }
    },
    [aplicarZoom, reenquadrar],
  )

  return {
    container,
    vista,
    arrastando,
    reenquadrar,
    aplicarZoom,
    houveArrasto,
    manipuladores: {
      onPointerDown: aoPressionar,
      onKeyDown: aoTeclar,
    },
  }
}
