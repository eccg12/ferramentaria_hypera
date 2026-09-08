import { X } from 'lucide-react'
import { Cota as CotaVisual, ROTULO_STATUS, COR_STATUS } from '../../componentes/Cota'
import { Fio } from '../../componentes/Fio'
import { cota as fCota, data, num } from '../../dados/formato'
import { cavidadePorId, historicoDaCota } from '../../dados/seletores'
import type { Cota } from '../../dados/tipos'

/**
 * Cartão da cavidade. Mostra a cota atual contra a tolerância e a mesma cota
 * nas medições anteriores. Duas cavidades selecionadas mostram a diferença
 * entre elas — é a leitura que separa desgaste uniforme de desgaste assimétrico.
 */
export function CartaoCavidade({
  serial,
  selecao,
  cotas,
  aoFechar,
  aoRemover,
}: {
  serial: string
  selecao: string[]
  cotas: Cota[]
  aoFechar: () => void
  aoRemover: (id: string) => void
}) {
  if (selecao.length === 0) return null

  const escolhidas = selecao
    .map((id) => ({ id, cav: cavidadePorId(id), cota: cotas.find((c) => c.alvo === id) }))
    .filter((e) => e.cav && e.cota)

  const diferenca =
    escolhidas.length === 2 && escolhidas[0].cota && escolhidas[1].cota
      ? escolhidas[1].cota.valor - escolhidas[0].cota.valor
      : null

  return (
    <div className="absolute bottom-3 right-3 z-20 w-[286px] border border-linha bg-aco-800 shadow-none">
      <header className="flex items-center justify-between gap-2 px-3 py-1.5">
        <h3 className="rotulo">
          {escolhidas.length > 1 ? `${escolhidas.length} cavidades` : 'Cavidade'}
        </h3>
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar cartão da cavidade"
          className="text-texto-2 hover:text-texto"
        >
          <X size={13} aria-hidden />
        </button>
      </header>

      {escolhidas.map(({ id, cav, cota }) => {
        if (!cav || !cota) return null
        const historico = historicoDaCota(serial, id)
        return (
          <div key={id}>
            <Fio />
            <div className="px-3 py-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-semibold text-texto">
                  Cavidade <span className="mono">{String(cav.numero).padStart(2, '0')}</span>
                </span>
                <button
                  type="button"
                  onClick={() => aoRemover(id)}
                  className="text-2xs text-texto-2 hover:text-texto"
                >
                  remover
                </button>
              </div>

              <div className="mt-1">
                <CotaVisual
                  valor={cota.valor}
                  nominal={cota.nominal}
                  tolerancia={cota.tolerancia}
                  unidade={cota.unidade}
                  status={cota.status}
                  tamanho="g"
                />
              </div>
              <p className={`mt-0.5 text-2xs ${COR_STATUS[cota.status]}`}>
                {ROTULO_STATUS[cota.status]}
              </p>

              {/* a mesma cota nas medições anteriores */}
              <ul className="mt-2 space-y-0.5">
                {historico.map((h) => (
                  <li key={h.medicaoId} className="flex items-baseline justify-between gap-2">
                    <span className="mono text-2xs text-texto-2">
                      {data(h.data)} · {num(h.ciclos)}
                    </span>
                    <span
                      className={`mono text-2xs ${h.status ? COR_STATUS[h.status] : 'text-texto-2'}`}
                    >
                      {h.valor === null ? '—' : `${fCota(h.valor)} mm`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      })}

      {diferenca !== null && (
        <>
          <Fio />
          <div className="flex items-baseline justify-between gap-2 px-3 py-2">
            <span className="text-2xs text-texto-2">Diferença entre elas</span>
            <span className="mono text-sm text-dimensional">
              {diferenca > 0 ? '+' : ''}
              {fCota(diferenca)} mm
            </span>
          </div>
        </>
      )}

      {selecao.length === 1 && (
        <>
          <Fio />
          <p className="px-3 py-1.5 text-2xs text-texto-2">
            Clique numa segunda cavidade para comparar as duas.
          </p>
        </>
      )}
    </div>
  )
}
