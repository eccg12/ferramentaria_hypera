import { milhoes } from '../../dados/formato'
import type { Alavanca, Cenario, Escopo } from '../../dados/tipos'

/**
 * Cascata do business case, do zero ao ganho anual — uma barra por alavanca.
 *
 * Substitui a tabela densa do slide 15 da proposta, então precisa ser legível
 * de longe: poucas barras, rótulos grandes, valores em R$ MM. Desenhada à mão
 * em divs, porque uma cascata em Recharts vira um empilhado com uma série
 * invisível, e isso quebra o tooltip e a leitura.
 */
export function Cascata({
  alavancas,
  escopo,
  cenario,
  total,
}: {
  alavancas: Alavanca[]
  escopo: Escopo
  cenario: Cenario
  total: number
}) {
  const valores = alavancas.map((a) => a[escopo][cenario])
  const maximo = total

  // base acumulada de cada degrau
  let acumulado = 0
  const degraus = alavancas.map((a, i) => {
    const base = acumulado
    acumulado += valores[i]
    return { alavanca: a, valor: valores[i], base, topo: acumulado }
  })

  return (
    <div className="flex h-full min-h-[300px] flex-col">
      {/*
        As barras são posicionadas em absoluto dentro de uma pista relativa.
        Altura percentual dentro de um item flex sem altura declarada resolve
        para auto, e as barras somem.
      */}
      <div className="relative flex min-h-0 flex-1 gap-2 pt-6">
        {degraus.map(({ alavanca, valor, base, topo }) => (
          <div key={alavanca.id} className="relative min-w-0 flex-1">
            <div
              className="absolute inset-x-0 bottom-0"
              style={{ height: `${(topo / maximo) * 100}%` }}
            >
              <span className="mono absolute inset-x-0 -top-6 text-center text-sm font-medium text-texto">
                +{valor.toFixed(2).replace('.', ',')}
              </span>
              {/* o degrau desta alavanca */}
              <div
                className="absolute inset-x-0 top-0 bg-sinal/70"
                style={{ height: `${((topo - base) / topo) * 100}%` }}
              />
              {/* o que já vinha acumulado, apagado */}
              <div
                className="absolute inset-x-0 bottom-0 bg-sinal/[0.13]"
                style={{ height: `${(base / topo) * 100}%` }}
              />
            </div>
          </div>
        ))}

        {/* barra do total */}
        <div className="relative w-[16%] min-w-[92px] border-l border-linha pl-2">
          <div className="absolute inset-y-0 left-2 right-0">
            <span className="mono absolute inset-x-0 -top-6 text-center text-base font-medium text-tolerancia">
              {total.toFixed(2).replace('.', ',')}
            </span>
            <div className="h-full w-full bg-tolerancia/70" />
          </div>
        </div>
      </div>

      {/* rótulos */}
      <div className="mt-2 flex gap-2 border-t border-linha pt-2">
        {degraus.map(({ alavanca }) => (
          <div key={alavanca.id} className="min-w-0 flex-1">
            <p className="text-2xs leading-tight text-texto-2">{alavanca.rotulo}</p>
            <p className="mono mt-0.5 text-2xs text-texto-2/70">{alavanca.fase}</p>
          </div>
        ))}
        <div className="w-[16%] min-w-[92px] border-l border-linha pl-2">
          <p className="text-2xs font-semibold leading-tight text-tolerancia">Ganho anual</p>
          <p className="mono mt-0.5 text-2xs text-texto-2/70">{milhoes(total)}</p>
        </div>
      </div>
    </div>
  )
}
