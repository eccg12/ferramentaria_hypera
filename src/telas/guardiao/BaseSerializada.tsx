import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BarraVida } from '../../componentes/BarraVida'
import { ChipFase } from '../../componentes/ChipFase'
import { SeloVeredito } from '../../componentes/SeloVeredito'
import { data, num, rotulo } from '../../dados/formato'
import { consumoDeVida, itens, ultimaMedicao, valoresDistintos } from '../../dados/seletores'
import type { Item } from '../../dados/tipos'

/**
 * Base serializada: a tabela densa dos 57 itens. É uma tabela de dados, não
 * um mural de cartões — a leitura aqui é de inventário.
 */
type Campo = 'serial' | 'familiaLabel' | 'area' | 'maquina' | 'formato' | 'ciclos' | 'consumo' | 'estado' | 'local' | 'medicao'

const COLUNAS: { campo: Campo; rotulo: string; classe: string; numerico?: boolean }[] = [
  { campo: 'serial', rotulo: 'Item serial', classe: 'w-[92px]' },
  { campo: 'familiaLabel', rotulo: 'Família', classe: 'w-[150px]' },
  { campo: 'area', rotulo: 'Área / sub-área', classe: 'w-[150px]' },
  { campo: 'maquina', rotulo: 'Máquina', classe: 'w-[74px]' },
  { campo: 'formato', rotulo: 'Formato', classe: 'w-[84px]' },
  { campo: 'ciclos', rotulo: 'Ciclos', classe: 'w-[86px] text-right', numerico: true },
  { campo: 'consumo', rotulo: 'Consumo de vida', classe: 'w-[168px]', numerico: true },
  { campo: 'estado', rotulo: 'Estado', classe: 'w-[104px]' },
  { campo: 'local', rotulo: 'Local', classe: 'w-[86px]' },
  { campo: 'medicao', rotulo: 'Última medição', classe: 'w-[104px]' },
]

function valorDe(item: Item, campo: Campo): string | number {
  switch (campo) {
    case 'consumo':
      return consumoDeVida(item)
    case 'area':
      return `${item.area} ${item.subarea ?? ''}`
    case 'medicao':
      return ultimaMedicao(item.serial)?.data ?? (item.temMedicao ? '0' : '')
    default:
      return (item[campo] as string | number | null) ?? ''
  }
}

interface Filtro {
  area: string
  subarea: string
  familia: string
  maquina: string
  estado: string
  local: string
}

const FILTRO_VAZIO: Filtro = { area: '', subarea: '', familia: '', maquina: '', estado: '', local: '' }

export function BaseSerializada() {
  const navegar = useNavigate()
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<Filtro>(FILTRO_VAZIO)
  const [ordem, setOrdem] = useState<{ campo: Campo; asc: boolean }>({ campo: 'serial', asc: true })

  const opcoes = useMemo(
    () => ({
      area: valoresDistintos('area'),
      subarea: valoresDistintos('subarea'),
      familia: valoresDistintos('familiaLabel'),
      maquina: valoresDistintos('maquina'),
      estado: valoresDistintos('estado'),
      local: valoresDistintos('local'),
    }),
    [],
  )

  const linhas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const filtrados = itens.filter((i) => {
      if (filtro.area && i.area !== filtro.area) return false
      if (filtro.subarea && i.subarea !== filtro.subarea) return false
      if (filtro.familia && i.familiaLabel !== filtro.familia) return false
      if (filtro.maquina && i.maquina !== filtro.maquina) return false
      if (filtro.estado && i.estado !== filtro.estado) return false
      if (filtro.local && i.local !== filtro.local) return false
      if (!termo) return true
      return [i.serial, i.familiaLabel, i.maquina, i.formato, i.kit, i.reservaSap, i.fornecedor]
        .filter(Boolean)
        .some((c) => String(c).toLowerCase().includes(termo))
    })

    return filtrados.sort((a, b) => {
      const va = valorDe(a, ordem.campo)
      const vb = valorDe(b, ordem.campo)
      const cmp =
        typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va).localeCompare(String(vb), 'pt-BR')
      return ordem.asc ? cmp : -cmp
    })
  }, [busca, filtro, ordem])

  const temFiltro = busca.trim() !== '' || Object.values(filtro).some(Boolean)

  function alternarOrdem(campo: Campo) {
    setOrdem((o) => (o.campo === campo ? { campo, asc: !o.asc } : { campo, asc: true }))
  }

  return (
    <div className="flex min-h-0 flex-col p-4">
      {/* controles */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search
            size={13}
            aria-hidden
            className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-texto-2"
          />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Item serial, kit, reserva…"
            aria-label="Buscar na base serializada"
            className="w-56 rounded-controle border border-linha bg-aco-800 py-1 pl-7 pr-2 text-xs text-texto placeholder:text-texto-2/60"
          />
        </div>

        {(
          [
            ['area', 'Área'],
            ['subarea', 'Sub-área'],
            ['familia', 'Família'],
            ['maquina', 'Máquina'],
            ['estado', 'Estado'],
            ['local', 'Local'],
          ] as [keyof Filtro, string][]
        ).map(([chave, titulo]) => (
          <select
            key={chave}
            aria-label={titulo}
            value={filtro[chave]}
            onChange={(e) => setFiltro((f) => ({ ...f, [chave]: e.target.value }))}
            className={`rounded-controle border bg-aco-800 px-1.5 py-1 text-xs ${
              filtro[chave] ? 'border-sinal text-sinal' : 'border-linha text-texto-2'
            }`}
          >
            <option value="">{titulo}</option>
            {opcoes[chave].map((v) => (
              <option key={String(v)} value={String(v)}>
                {rotulo(String(v))}
              </option>
            ))}
          </select>
        ))}

        {temFiltro && (
          <button
            type="button"
            onClick={() => {
              setBusca('')
              setFiltro(FILTRO_VAZIO)
            }}
            className="inline-flex items-center gap-1 text-2xs text-texto-2 hover:text-texto"
          >
            <X size={11} aria-hidden />
            limpar
          </button>
        )}

        <span className="mono ml-auto text-2xs text-texto-2">
          {linhas.length} de {itens.length} itens
        </span>
        <ChipFase fase="Fase 1" degrau={2} />
      </div>

      {/* tabela */}
      <div className="min-h-0 flex-1 overflow-auto border border-linha">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10">
            <tr className="bg-aco-700">
              {COLUNAS.map((c) => (
                <th
                  key={c.campo}
                  scope="col"
                  className={`border-b border-linha px-2 py-1.5 text-left font-semibold ${c.classe}`}
                >
                  <button
                    type="button"
                    onClick={() => alternarOrdem(c.campo)}
                    className={`inline-flex items-center gap-1 text-2xs uppercase tracking-[0.06em] ${
                      ordem.campo === c.campo ? 'text-sinal' : 'text-texto-2 hover:text-texto'
                    }`}
                  >
                    {c.rotulo}
                    {ordem.campo === c.campo &&
                      (ordem.asc ? (
                        <ArrowUp size={10} aria-hidden />
                      ) : (
                        <ArrowDown size={10} aria-hidden />
                      ))}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map((item) => {
              const medicao = ultimaMedicao(item.serial)
              return (
                <tr
                  key={item.serial}
                  tabIndex={0}
                  onClick={() => navegar(`/guardiao/item/${item.serial}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navegar(`/guardiao/item/${item.serial}`)
                  }}
                  className="cursor-pointer border-b border-linha/60 bg-aco-800 hover:bg-aco-700/60"
                >
                  <td className="px-2 py-1">
                    <span className="mono text-sinal">{item.serial}</span>
                    {item.poc && (
                      <span className="ml-1 text-2xs uppercase text-texto-2" title="peça da prova de conceito">
                        poc
                      </span>
                    )}
                  </td>
                  <td className="truncate px-2 py-1 text-texto-2">{item.familiaLabel}</td>
                  <td className="truncate px-2 py-1 text-texto-2">
                    {rotulo(item.area)}
                    {item.subarea && ` · ${rotulo(item.subarea)}`}
                  </td>
                  <td className="mono px-2 py-1 text-texto-2">{item.maquina}</td>
                  <td className="mono px-2 py-1 text-texto-2">{item.formato ?? '—'}</td>
                  <td className="mono px-2 py-1 text-right">{num(item.ciclos)}</td>
                  <td className="px-2 py-1">
                    <BarraVida item={item} />
                  </td>
                  <td className="px-2 py-1">
                    <SeloVeredito estado={item.estado} />
                  </td>
                  <td className="px-2 py-1 text-texto-2">{rotulo(item.local)}</td>
                  <td className="mono px-2 py-1">
                    {medicao ? (
                      <span className="text-texto-2">{data(medicao.data)}</span>
                    ) : item.temMedicao ? (
                      <span
                        className="text-texto-2/60"
                        title="Medição registrada; a data está fora do recorte desta demonstração"
                      >
                        registrada
                      </span>
                    ) : (
                      <span className="text-atencao" title="Entra na fila de avaliação do rig EMB-01">
                        sem medição
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
            {linhas.length === 0 && (
              <tr>
                <td colSpan={COLUNAS.length} className="bg-aco-800 px-3 py-6 text-center text-texto-2">
                  Nenhum item com esses filtros. Limpe a busca ou solte um filtro acima.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
