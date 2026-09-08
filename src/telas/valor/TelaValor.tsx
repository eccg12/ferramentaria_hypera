import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Info } from 'lucide-react'
import { Casca } from '../../casca/Casca'
import { BotaoAlternar } from '../../componentes/Botao'
import { BotaoReiniciar } from '../../componentes/BotaoReiniciar'
import { ChipFase } from '../../componentes/ChipFase'
import { SeloVeredito } from '../../componentes/SeloVeredito'
import { TituloTela } from '../../componentes/TituloTela'
import { brl, milhoes, rotulo } from '../../dados/formato'
import { businessCase, resumoDoParque, saudePorArea } from '../../dados/seletores'
import type { Cenario, EstadoCondicao, Escopo } from '../../dados/tipos'
import { Cascata } from './Cascata'

/**
 * Painel de Valor — para Controladoria e Diretoria.
 * Termina em dinheiro, com lastro em medição.
 */
const CENARIOS: { id: Cenario; rotulo: string }[] = [
  { id: 'conservador', rotulo: 'Conservador' },
  { id: 'base', rotulo: 'Base' },
  { id: 'otimista', rotulo: 'Otimista' },
]

const ESCOPOS: { id: Escopo; rotulo: string }[] = [
  { id: 'piloto', rotulo: 'Piloto' },
  { id: 'parque', rotulo: 'Parque declarado' },
]

const COR_ESTADO: Record<EstadoCondicao, string> = {
  novo: 'bg-dimensional',
  ok: 'bg-tolerancia',
  desgastado: 'bg-atencao',
  danificado: 'bg-condenar',
}

export function TelaValor() {
  const [escopo, setEscopo] = useState<Escopo>('piloto')
  const [cenario, setCenario] = useState<Cenario>('base')

  const total = businessCase.totais[escopo][cenario]
  const parque = resumoDoParque()
  const porArea = saudePorArea()

  // a curva de captura é declarada para o piloto no cenário base; nos demais
  // recortes ela é reescalada pela razão dos totais, e a tela diz isso
  const fator = total / businessCase.totais.piloto.base
  const captura = businessCase.capturaPorFase.map((c) => ({
    ...c,
    acumulado: Number((c.acumulado * fator).toFixed(2)),
  }))
  const reescalada = Math.abs(fator - 1) > 0.001

  return (
    <Casca>
      <div className="flex h-full flex-col">
        <TituloTela
          titulo="Valor"
          acessorio={
            <>
              <ChipFase fase="Fase 1 → 4" degrau={2} />
              <BotaoReiniciar />
            </>
          }
        />

        <div className="min-h-0 flex-1 overflow-auto p-4">
          <div className="mx-auto max-w-[1600px]">
            {/* alternadores e o número grande */}
            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 border border-linha bg-aco-800 px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="rotulo">Escopo</span>
                {ESCOPOS.map((e) => (
                  <BotaoAlternar key={e.id} ativo={escopo === e.id} onClick={() => setEscopo(e.id)}>
                    {e.rotulo}
                  </BotaoAlternar>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rotulo">Cenário</span>
                {CENARIOS.map((c) => (
                  <BotaoAlternar key={c.id} ativo={cenario === c.id} onClick={() => setCenario(c.id)}>
                    {c.rotulo}
                  </BotaoAlternar>
                ))}
              </div>
              <div className="ml-auto flex items-baseline gap-2">
                <span className="rotulo">Ganho anual</span>
                <span className="mono text-3xl font-medium leading-none text-tolerancia">
                  {milhoes(total)}
                </span>
              </div>
            </div>

            <div className="grid gap-px bg-linha xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              {/* 1. cascata */}
              <section className="bg-aco-800 p-3">
                <header className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="rotulo">
                    Do zero ao ganho anual · {escopo === 'piloto' ? 'piloto' : 'parque declarado'} ·
                    cenário {cenario}
                  </h2>
                  <ChipFase fase="Fase 1 → 4" degrau={2} />
                </header>
                <div className="h-[340px]">
                  <Cascata
                    alavancas={businessCase.alavancas}
                    escopo={escopo}
                    cenario={cenario}
                    total={total}
                  />
                </div>
                <p className="mt-2 text-2xs text-texto-2">
                  Valores em R$ milhões por ano, fonte {businessCase.fonte}.
                </p>
              </section>

              {/* 2. captura por fase */}
              <section className="bg-aco-800 p-3">
                <header className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="rotulo">Captura acumulada por fase</h2>
                  <ChipFase fase="Fase 1 → 4" degrau={2} />
                </header>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={captura} margin={{ top: 6, right: 8, bottom: 0, left: -6 }}>
                      <defs>
                        <linearGradient id="areaCaptura" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--sinal)" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="var(--sinal)" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="var(--linha)" strokeDasharray="2 4" vertical={false} />
                      <XAxis
                        dataKey="fase"
                        tick={{ fill: 'var(--texto-2)', fontSize: 10 }}
                        stroke="var(--linha)"
                      />
                      <YAxis
                        tickFormatter={(v) => String(v).replace('.', ',')}
                        tick={{ fill: 'var(--texto-2)', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                        stroke="var(--linha)"
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--aco-900)',
                          border: '1px solid var(--linha)',
                          borderRadius: 4,
                          fontSize: 11,
                        }}
                        formatter={(v: number) => [milhoes(v), 'acumulado']}
                      />
                      <Area
                        type="monotone"
                        dataKey="acumulado"
                        stroke="var(--sinal)"
                        strokeWidth={2}
                        fill="url(#areaCaptura)"
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-1.5 space-y-1">
                  {captura.map((c) => (
                    <li key={c.fase} className="flex items-baseline justify-between gap-2">
                      <span className="text-2xs text-texto-2">
                        <span className="mr-1.5 text-texto">{c.fase}</span>
                        {c.rotulo}
                      </span>
                      <span className="mono shrink-0 text-2xs text-sinal">{milhoes(c.acumulado)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 border-t border-linha pt-1.5 text-2xs text-texto-2">
                  A Fase 1 já captura antes de qualquer IA entrar em rotina: é baseline auditado e
                  pacote CAPEX.
                  {reescalada && (
                    <>
                      {' '}
                      A curva é declarada para o piloto no cenário base; neste recorte ela aparece
                      reescalada pela razão dos totais.
                    </>
                  )}
                </p>
              </section>

              {/* 3. saúde do parque */}
              <section className="bg-aco-800 p-3">
                <header className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="rotulo">Saúde do parque · {parque.total} itens seriais</h2>
                  <ChipFase fase="Fase 1" degrau={2} />
                </header>

                <div className="grid grid-cols-4 gap-px bg-linha">
                  {(Object.keys(parque.porEstado) as EstadoCondicao[]).map((e) => (
                    <div key={e} className="bg-aco-900 px-2 py-1.5">
                      <p className="mono text-xl font-medium text-texto">{parque.porEstado[e]}</p>
                      <SeloVeredito estado={e} />
                    </div>
                  ))}
                </div>

                <div className="mt-3 space-y-2">
                  {porArea.map((a) => (
                    <div key={a.area}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-2xs text-texto-2">{rotulo(a.area)}</span>
                        <span className="mono text-2xs text-texto-2">{a.total} itens</span>
                      </div>
                      <div className="mt-0.5 flex h-2.5 w-full overflow-hidden">
                        {(['novo', 'ok', 'desgastado', 'danificado'] as EstadoCondicao[]).map(
                          (e) =>
                            a[e] > 0 && (
                              <div
                                key={e}
                                className={COR_ESTADO[e]}
                                style={{ width: `${(a[e] / a.total) * 100}%` }}
                                title={`${a[e]} ${e}`}
                              />
                            ),
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-px bg-linha">
                  <div className="bg-aco-900 px-2 py-1.5">
                    <p className="mono text-xl font-medium text-condenar">{parque.acimaDoLimite}</p>
                    <p className="text-2xs text-texto-2">acima do limite de ciclos</p>
                  </div>
                  <div className="bg-aco-900 px-2 py-1.5">
                    <p className="mono text-xl font-medium text-atencao">{parque.semMedicao}</p>
                    <p className="text-2xs text-texto-2">sem medição de condição</p>
                  </div>
                </div>
              </section>

              {/* 4. efeito contábil */}
              <section className="bg-aco-800 p-3">
                <header className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="rotulo">Efeito contábil</h2>
                  <span className="text-2xs uppercase tracking-[0.06em] text-texto-2">
                    informativo
                  </span>
                </header>

                <div className="flex items-end gap-6">
                  <div>
                    <p className="mono text-2xl font-medium text-texto-2">
                      {businessCase.efeitoContabil.vidaContabilAnos} anos
                    </p>
                    <p className="text-2xs text-texto-2">vida útil contábil</p>
                  </div>
                  <span aria-hidden className="mb-2 text-lg text-texto-2">
                    contra
                  </span>
                  <div>
                    <p className="mono text-2xl font-medium text-atencao">
                      ~{businessCase.efeitoContabil.vidaRealAnos} anos
                    </p>
                    <p className="text-2xs text-texto-2">vida real observada</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="mono text-2xl font-medium text-dimensional">
                      {milhoes(businessCase.efeitoContabil[escopo])}
                    </p>
                    <p className="text-2xs text-texto-2">efeito no {escopo}</p>
                  </div>
                </div>

                <p className="mt-3 border-t border-linha pt-2 text-2xs leading-relaxed text-texto-2">
                  {businessCase.efeitoContabil.nota}
                </p>
                <p className="mt-1.5 text-2xs text-texto-2">
                  Valor do parque serializado a preço de aquisição:{' '}
                  <span className="mono text-texto">{brl(parque.valorTotal)}</span> em{' '}
                  {parque.total} itens.
                </p>
              </section>
            </div>

            {/* aviso do business case, sempre visível */}
            <div className="mt-3 flex items-start gap-2 border border-atencao/40 bg-atencao/[0.06] px-3 py-2">
              <Info size={14} className="mt-px shrink-0 text-atencao" aria-hidden />
              <p className="text-2xs leading-relaxed text-atencao">{businessCase.aviso}</p>
            </div>
          </div>
        </div>
      </div>
    </Casca>
  )
}
