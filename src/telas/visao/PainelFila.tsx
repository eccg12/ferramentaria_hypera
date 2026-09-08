import { Link } from 'react-router-dom'
import { BlocoLeitura, PainelLeitura } from '../../componentes/PainelLeitura'
import { BarraVida } from '../../componentes/BarraVida'
import { ChipFase } from '../../componentes/ChipFase'
import { SeloVeredito } from '../../componentes/SeloVeredito'
import { rotulo } from '../../dados/formato'
import { itens, itensPoc, ultimaMedicao } from '../../dados/seletores'

/**
 * Fila de avaliação: as demais peças aguardando o rig.
 *
 * Inclui as duas peças de PoC das outras áreas — punção de compressão e tela
 * de granulador — para mostrar que o conceito atravessa as três áreas, e não
 * só a embalagem.
 */
export function PainelFila({ serialAtivo }: { serialAtivo: string }) {
  const naFila = itens.filter((i) => i.local === 'avaliacao')
  const poc = itensPoc().filter((i) => i.area !== 'embalagem')

  return (
    <PainelLeitura className="min-h-full">
      <BlocoLeitura
        titulo={`Aguardando avaliação · ${naFila.length}`}
        acessorio={<ChipFase fase="Fase 1" degrau={2} />}
        semFio
      >
        <ul className="space-y-px">
          {naFila.map((i) => (
            <li key={i.serial}>
              <Link
                to={`/visao?item=${i.serial}`}
                className={`block border-l-2 px-2 py-1.5 transition-colors ${
                  i.serial === serialAtivo
                    ? 'border-l-sinal bg-aco-700/60'
                    : 'border-l-linha hover:bg-aco-700/30'
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="mono text-xs text-sinal">{i.serial}</span>
                  <SeloVeredito estado={i.estado} />
                </div>
                <div className="mt-0.5 flex items-baseline justify-between gap-2">
                  <span className="text-2xs text-texto-2">
                    {i.familiaLabel} · {i.maquina}
                  </span>
                  {!ultimaMedicao(i.serial) && (
                    <span className="text-2xs text-texto-2/70">sem medição no rig</span>
                  )}
                </div>
                <div className="mt-1">
                  <BarraVida item={i} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </BlocoLeitura>

      <BlocoLeitura
        titulo="Prova de conceito nas outras áreas"
        acessorio={<ChipFase fase="Fase 2" degrau={3} />}
      >
        <p className="mb-2 text-2xs text-texto-2">
          O mesmo rig e o mesmo critério em compressão e manipulação. É o que mostra que a
          mecânica não é específica de embalagem.
        </p>
        <ul className="space-y-px">
          {poc.map((i) => (
            <li key={i.serial}>
              <Link
                to={`/visao?item=${i.serial}`}
                className="block border-l-2 border-l-linha px-2 py-1.5 transition-colors hover:bg-aco-700/30"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="mono text-xs text-sinal">{i.serial}</span>
                  <SeloVeredito estado={i.estado} />
                </div>
                <p className="mt-0.5 text-2xs text-texto-2">
                  {i.familiaLabel} · {rotulo(i.area)} · {i.maquina}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </BlocoLeitura>
    </PainelLeitura>
  )
}
