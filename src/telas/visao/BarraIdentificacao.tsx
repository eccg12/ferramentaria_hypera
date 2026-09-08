import { dataHora, data as fData } from '../../dados/formato'
import type { Item, Medicao } from '../../dados/tipos'

/**
 * Barra fina de identificação acima da bancada.
 *
 * A calibração rastreável precisa estar visível: é o que faz a medição valer
 * para a Qualidade. Sem certificado e validade, o número é opinião com casa
 * decimal.
 */
export function BarraIdentificacao({ item, medicao }: { item: Item; medicao?: Medicao }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-linha bg-aco-800 px-3 py-1.5 text-2xs">
      <span className="mono font-medium text-sinal">{item.serial}</span>
      <span className="text-texto">{item.familiaLabel}</span>
      <span aria-hidden className="h-3 w-px bg-linha" />
      <span className="mono text-texto-2">
        {item.site} / {item.galpao} / {item.maquina}
      </span>
      <span className="text-texto-2">
        formato <span className="mono text-texto">{item.formato ?? '—'}</span>
      </span>
      <span className="text-texto-2">
        posição <span className="mono text-texto">{item.posicao}</span>
      </span>

      {medicao && (
        <span className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-texto-2">
          <span>
            Captura <span className="mono text-texto">{dataHora(medicao.data)}</span>
          </span>
          <span aria-hidden className="h-3 w-px bg-linha" />
          <span>
            Rig <span className="mono text-texto">{medicao.rig}</span> ({medicao.rigDescricao})
          </span>
          <span aria-hidden className="h-3 w-px bg-linha" />
          <span
            className={medicao.calibracao.rastreavel ? 'text-texto-2' : 'text-condenar'}
            title="Calibração rastreável: é o que faz a medição valer para a Qualidade"
          >
            calibração <span className="mono text-texto">{medicao.calibracao.certificado}</span>{' '}
            válida até <span className="mono text-texto">{fData(medicao.calibracao.validade)}</span>
          </span>
        </span>
      )}
    </div>
  )
}
