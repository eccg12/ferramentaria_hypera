/**
 * `Fase 2 · Degrau 3` — obrigatório em todo painel que mostra número derivado.
 * O chip diz qual fase do programa entrega aquilo e em que degrau da escada
 * analítica ele está. É o que impede um número de demonstração virar
 * expectativa contratual no Gate 1.
 *
 * Degrau 1 identidade · 2 rastreabilidade · 3 critério objetivo · 4 predição.
 */
const DESCRICAO_DEGRAU: Record<number, string> = {
  1: 'Identidade — peça com código unívoco',
  2: 'Rastreabilidade — onde esteve, quantos ciclos',
  3: 'Critério objetivo — condição medida contra tolerância',
  4: 'Predição — vida remanescente por modelo',
}

interface Props {
  fase: string
  degrau: number
  /** Realce para o chip que carrega a ressalva mais importante da tela. */
  destaque?: boolean
  className?: string
}

export function ChipFase({ fase, degrau, destaque = false, className = '' }: Props) {
  return (
    <span
      title={DESCRICAO_DEGRAU[degrau] ?? ''}
      className={[
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-controle border px-2 py-0.5',
        'text-2xs font-semibold uppercase tracking-[0.06em]',
        destaque
          ? 'border-atencao/50 bg-atencao/10 text-atencao'
          : 'border-linha bg-aco-800 text-texto-2',
        className,
      ].join(' ')}
    >
      {fase}
      <span aria-hidden className="opacity-40">
        ·
      </span>
      Degrau {degrau}
    </span>
  )
}
