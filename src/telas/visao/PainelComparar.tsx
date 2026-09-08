import { useState } from 'react'
import { BlocoLeitura, LinhaDado, PainelLeitura } from '../../componentes/PainelLeitura'
import { ChipFase } from '../../componentes/ChipFase'
import { COR_STATUS } from '../../componentes/Cota'
import { cota as fCota, data, golpes, pct } from '../../dados/formato'
import { pontoZero, resumoDasCotas, ultimaMedicao } from '../../dados/seletores'

/**
 * Comparação com a peça nova. O controle da cortina fica aqui; a cortina em si
 * é desenhada na bancada, sobre o mesmo enquadramento, com as cotas de cada
 * lado.
 */
export function PainelComparar({
  serial,
  posicao,
  aoMover,
}: {
  serial: string
  posicao: number
  aoMover: (v: number) => void
}) {
  const zero = pontoZero(serial)
  const atual = ultimaMedicao(serial)
  const [alvo, setAlvo] = useState('C06')

  if (!zero || !atual) {
    return (
      <PainelLeitura>
        <BlocoLeitura semFio>
          <p className="text-xs text-texto-2">Esta peça não tem escaneamento de ponto zero.</p>
        </BlocoLeitura>
      </PainelLeitura>
    )
  }

  const cotaZero = zero.cotas.find((c) => c.alvo === alvo)
  const cotaAtual = atual.cotas.find((c) => c.alvo === alvo)
  const resumoZero = resumoDasCotas(zero)
  const resumoAtual = resumoDasCotas(atual)

  return (
    <PainelLeitura className="min-h-full">
      <BlocoLeitura titulo="Cortina de comparação" acessorio={<ChipFase fase="Fase 2" degrau={3} />} semFio>
        <label htmlFor="cortina" className="sr-only">
          Posição da cortina
        </label>
        <input
          id="cortina"
          type="range"
          min={0}
          max={100}
          value={Math.round(posicao * 100)}
          onChange={(e) => aoMover(Number(e.target.value) / 100)}
          className="w-full accent-[color:var(--sinal)]"
        />
        <div className="mt-1 flex items-center justify-between text-2xs">
          <span className="text-dimensional">
            peça nova · <span className="mono">{data(zero.data)}</span>
          </span>
          <span className="text-atencao">
            atual · <span className="mono">{data(atual.data)}</span>
          </span>
        </div>
        <p className="mt-1.5 text-2xs text-texto-2">
          Mesmo enquadramento, mesmo rig, mesma calibração. Arraste a cortina sobre a bancada.
        </p>
      </BlocoLeitura>

      <BlocoLeitura titulo="Os dois lados" acessorio={<ChipFase fase="Fase 2" degrau={3} />}>
        <div className="grid grid-cols-2 gap-px bg-linha">
          {(
            [
              ['Peça nova', zero, resumoZero, 'text-dimensional'],
              ['Agora', atual, resumoAtual, 'text-atencao'],
            ] as const
          ).map(([rot, m, r, cor]) => (
            <div key={rot} className="bg-aco-800 p-2">
              <p className={`text-2xs uppercase tracking-[0.06em] ${cor}`}>{rot}</p>
              <p className="mono mt-1 text-xs text-texto">{golpes(m.ciclosNaMedicao)}</p>
              <p className="mono mt-1.5 text-xs">
                <span className={COR_STATUS[m.serrilha.status]}>
                  {pct(m.serrilha.perdaAlturaPico)}
                </span>
                <span className="ml-1 text-2xs text-texto-2">serrilha</span>
              </p>
              <p className="mono text-xs">
                <span className={COR_STATUS[m.planicidade.status]}>
                  {fCota(m.planicidade.valor)} mm
                </span>
                <span className="ml-1 text-2xs text-texto-2">planicidade</span>
              </p>
              <p className="mt-1.5 text-2xs text-texto-2">
                <span className="text-condenar">{r.fora}</span> ·{' '}
                <span className="text-atencao">{r.atencao}</span> ·{' '}
                <span className="text-tolerancia">{r.ok}</span> cavidades
              </p>
            </div>
          ))}
        </div>
      </BlocoLeitura>

      <BlocoLeitura titulo="Uma cota, dos dois lados" acessorio={<ChipFase fase="Fase 2" degrau={3} />}>
        <select
          value={alvo}
          onChange={(e) => setAlvo(e.target.value)}
          aria-label="Cavidade a comparar"
          className="mono w-full rounded-controle border border-linha bg-aco-900 px-2 py-1 text-xs text-texto"
        >
          {atual.cotas.map((c) => (
            <option key={c.alvo} value={c.alvo}>
              {c.alvo}
            </option>
          ))}
        </select>

        {cotaZero && cotaAtual && (
          <div className="mt-2">
            <LinhaDado rotulo="Peça nova">
              <span className={`mono ${COR_STATUS[cotaZero.status]}`}>
                {fCota(cotaZero.valor)} mm
              </span>
            </LinhaDado>
            <LinhaDado rotulo="Agora">
              <span className={`mono ${COR_STATUS[cotaAtual.status]}`}>
                {fCota(cotaAtual.valor)} mm
              </span>
            </LinhaDado>
            <LinhaDado rotulo="Diferença">
              <span className="mono text-dimensional">
                {cotaAtual.valor - cotaZero.valor > 0 ? '+' : ''}
                {fCota(cotaAtual.valor - cotaZero.valor)} mm
              </span>
            </LinhaDado>
            <LinhaDado rotulo="Tolerância">
              <span className="mono text-texto-2">
                {fCota(cotaAtual.nominal)} ± {fCota(cotaAtual.tolerancia)} mm
              </span>
            </LinhaDado>
          </div>
        )}
      </BlocoLeitura>
    </PainelLeitura>
  )
}
