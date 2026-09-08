import type { ButtonHTMLAttributes, ReactNode } from 'react'

/**
 * Controle padrão: raio 4px, sem sombra, sem gradiente.
 * As cinco cores semânticas nunca aparecem em botão — só --sinal e neutros.
 */
type Variante = 'primario' | 'secundario' | 'fantasma'

const VARIANTES: Record<Variante, string> = {
  primario: 'border-sinal bg-sinal/15 text-sinal hover:bg-sinal/25',
  secundario: 'border-linha bg-aco-700 text-texto hover:border-sinal/60',
  fantasma: 'border-transparent bg-transparent text-texto-2 hover:text-texto hover:border-linha',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  children: ReactNode
}

export function Botao({ variante = 'secundario', className = '', children, ...resto }: Props) {
  return (
    <button
      type="button"
      className={[
        'inline-flex items-center justify-center gap-1.5 rounded-controle border px-2.5 py-1.5',
        'text-xs font-semibold transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-40',
        VARIANTES[variante],
        className,
      ].join(' ')}
      {...resto}
    >
      {children}
    </button>
  )
}

/** Botão de alternância, para as camadas da bancada e as abas do painel. */
export function BotaoAlternar({
  ativo,
  className = '',
  children,
  ...resto
}: ButtonHTMLAttributes<HTMLButtonElement> & { ativo: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      className={[
        'inline-flex items-center gap-1.5 rounded-controle border px-2 py-1',
        'text-2xs font-semibold uppercase tracking-[0.06em] transition-colors',
        ativo
          ? 'border-sinal bg-sinal/15 text-sinal'
          : 'border-linha bg-aco-800 text-texto-2 hover:text-texto',
        className,
      ].join(' ')}
      {...resto}
    >
      {children}
    </button>
  )
}
