import { num } from '../dados/formato'
import type { Item } from '../dados/tipos'
import { consumoDeVida, statusDoConsumo } from '../dados/seletores'

/**
 * Consumo de vida: ciclos ÷ limite da família, colorido pela mesma semântica
 * das cotas. É rastreabilidade (degrau 2), não predição: mede o que já rodou.
 */
const COR_BARRA = {
  ok: 'bg-tolerancia',
  atencao: 'bg-atencao',
  fora: 'bg-condenar',
} as const

export function BarraVida({ item, comRotulo = false }: { item: Item; comRotulo?: boolean }) {
  const razao = consumoDeVida(item)
  const status = statusDoConsumo(item)
  const pct = Math.round(razao * 100)

  return (
    <div className="flex items-center gap-2">
      <div
        className="relative h-1.5 w-full min-w-[52px] max-w-[120px] bg-aco-900"
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Consumo de vida de ${item.serial}`}
        title={`${num(item.ciclos)} de ${num(item.limiteCiclos)} golpes`}
      >
        <div
          className={`h-full ${COR_BARRA[status]}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
        {razao > 1 && (
          <span
            aria-hidden
            className="absolute inset-y-0 right-0 w-px bg-texto"
            title="acima do limite da família"
          />
        )}
      </div>
      <span className={`mono w-9 shrink-0 text-right text-2xs ${razao >= 1 ? 'text-condenar' : 'text-texto-2'}`}>
        {pct}%
      </span>
      {comRotulo && (
        <span className="mono text-2xs text-texto-2">
          {num(item.ciclos)} / {num(item.limiteCiclos)}
        </span>
      )}
    </div>
  )
}
