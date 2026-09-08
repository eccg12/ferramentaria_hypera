import { cota as formatarCota } from '../dados/formato'
import type { StatusCota } from '../dados/tipos'

/**
 * Valor medido em Plex Mono, com o nominal ± tolerância ao lado e o status
 * colorido. A cor vem da tolerância, não da opinião: é a regra que separa
 * metrologia de achismo.
 */
export const COR_STATUS: Record<StatusCota, string> = {
  ok: 'text-tolerancia',
  atencao: 'text-atencao',
  fora: 'text-condenar',
}

export const ROTULO_STATUS: Record<StatusCota, string> = {
  ok: 'dentro da tolerância',
  atencao: 'em atenção',
  fora: 'fora da tolerância',
}

interface Props {
  valor: number
  nominal?: number
  tolerancia?: number
  unidade?: string
  status: StatusCota
  /** Esconde a faixa nominal quando ela já está declarada logo acima. */
  semFaixa?: boolean
  tamanho?: 'p' | 'm' | 'g'
  className?: string
}

export function Cota({
  valor,
  nominal,
  tolerancia,
  unidade = 'mm',
  status,
  semFaixa = false,
  tamanho = 'm',
  className = '',
}: Props) {
  const escala = { p: 'text-xs', m: 'text-sm', g: 'text-xl' }[tamanho]
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className={`mono font-medium ${escala} ${COR_STATUS[status]}`}>
        {formatarCota(valor)}
        <span className="ml-1 text-2xs font-normal opacity-70">{unidade}</span>
      </span>
      {!semFaixa && nominal !== undefined && tolerancia !== undefined && (
        <span className="mono text-2xs text-texto-2">
          {formatarCota(nominal)} ± {formatarCota(tolerancia)}
        </span>
      )}
    </span>
  )
}
