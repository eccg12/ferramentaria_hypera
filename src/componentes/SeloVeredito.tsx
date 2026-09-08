import type { EstadoCondicao } from '../dados/tipos'

/**
 * Carimbo de estado: NOVO / OK / DESGASTADO / DANIFICADO.
 * Caixa alta é reservada a este selo e à legenda de cores — em todo o resto
 * o texto é em caixa de frase.
 */
const CORES: Record<EstadoCondicao, string> = {
  novo: 'border-dimensional text-dimensional',
  ok: 'border-tolerancia text-tolerancia',
  desgastado: 'border-atencao text-atencao',
  danificado: 'border-condenar text-condenar',
}

interface Props {
  estado: EstadoCondicao
  tamanho?: 'p' | 'g'
  className?: string
}

export function SeloVeredito({ estado, tamanho = 'p', className = '' }: Props) {
  const grande = tamanho === 'g'
  return (
    <span
      className={[
        'inline-flex items-center justify-center border-2 font-bold uppercase',
        grande
          ? 'px-3 py-1 text-base tracking-[0.16em]'
          : 'px-1.5 py-px text-2xs tracking-[0.1em]',
        CORES[estado],
        className,
      ].join(' ')}
    >
      {estado}
    </span>
  )
}
