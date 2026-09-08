import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Casca } from '../../casca/Casca'
import { Botao } from '../../componentes/Botao'
import { BotaoReiniciar } from '../../componentes/BotaoReiniciar'
import { ChipFase } from '../../componentes/ChipFase'
import { Fio } from '../../componentes/Fio'
import { TituloTela } from '../../componentes/TituloTela'
import { brl, golpes, num } from '../../dados/formato'
import { itemPorSerial, tradeoff } from '../../dados/seletores'
import { useApp } from '../../estado/contexto'

/**
 * Trade-Off CAPEX × OPEX — Fase 3, degrau 3.
 *
 * O cruzamento é o argumento inteiro: enquanto manter custa menos que repor,
 * a peça fica; quando cruza, repor passa a ser a decisão barata. Tudo lastreado
 * na condição medida e nos ciclos, não em política de calendário.
 */
export function TelaTradeOff() {
  const [busca] = useSearchParams()
  const navegar = useNavigate()
  const { estado, despachar } = useApp()

  const serial = busca.get('item') ?? tradeoff.itemSerial
  const item = itemPorSerial(serial)
  const [criada, setCriada] = useState(false)

  const jaTemFicha = estado.fichasSessao.some((f) => f.itemOrigem === serial)

  const posicaoAtual = item?.ciclos ?? 812400
  const curva = tradeoff.curva
  const manterAgora =
    curva.find((p) => p.ciclos === posicaoAtual)?.manter ??
    curva[Math.floor(curva.length / 2)].manter

  function criarFicha() {
    if (!item) return
    despachar({
      tipo: 'criarFicha',
      ficha: {
        familia: item.familia,
        itemOrigem: item.serial,
        quantidade: 1,
        valorUnitario: item.aquisicao.valor,
        exercicio: 2027,
        origem: 'condição medida',
        status: 'rascunho',
      },
    })
    setCriada(true)
  }

  return (
    <Casca agenteId="tradeoff">
      <div className="flex h-full flex-col">
        <TituloTela
          agenteId="tradeoff"
          acessorio={
            <>
              <ChipFase fase="Fase 3" degrau={3} />
              <BotaoReiniciar />
            </>
          }
        />

        <div className="min-h-0 flex-1 overflow-auto p-4">
          <div className="mx-auto flex h-full max-w-[1500px] flex-col">
            <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 border border-linha bg-aco-800 px-3 py-2">
              <span className="mono text-sm text-sinal">{serial}</span>
              <span className="text-xs text-texto">{item?.familiaLabel}</span>
              <span className="mono text-2xs text-texto-2">
                {item?.maquina} · {item?.formato}
              </span>
              <span className="ml-auto text-xs text-texto-2">
                Posição atual <span className="mono text-texto">{golpes(posicaoAtual)}</span> ·
                ponto ótimo{' '}
                <span className="mono text-atencao">{golpes(tradeoff.pontoOtimoGolpes)}</span>
              </span>
            </div>

            <div className="grid min-h-0 flex-1 gap-px bg-linha xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
              {/* 1. a curva */}
              <section className="flex min-h-0 flex-col bg-aco-800 p-3">
                <header className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="rotulo">Custo de manter contra custo de repor</h2>
                  <ChipFase fase="Fase 3" degrau={3} />
                </header>

                <div className="min-h-[280px] w-full flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={curva} margin={{ top: 10, right: 16, bottom: 4, left: 6 }}>
                      <CartesianGrid stroke="var(--linha)" strokeDasharray="2 4" vertical={false} />
                      <XAxis
                        dataKey="ciclos"
                        type="number"
                        domain={[400000, 1000000]}
                        tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                        tick={{ fill: 'var(--texto-2)', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                        stroke="var(--linha)"
                      />
                      <YAxis
                        tickFormatter={(v) => `${Math.round(v / 1000)}k`}
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
                        labelFormatter={(v) => `${num(Number(v))} golpes`}
                        formatter={(v: number, nome: string) => [
                          brl(v),
                          nome === 'manter' ? 'custo de manter' : 'custo de repor',
                        ]}
                      />
                      <ReferenceLine
                        x={posicaoAtual}
                        stroke="var(--sinal)"
                        strokeDasharray="4 4"
                        label={{
                          value: 'agora',
                          position: 'insideBottomLeft',
                          fill: 'var(--sinal)',
                          fontSize: 10,
                        }}
                      />
                      <ReferenceLine
                        x={tradeoff.pontoOtimoGolpes}
                        stroke="var(--atencao)"
                        strokeDasharray="4 4"
                        label={{
                          value: 'ponto ótimo',
                          position: 'top',
                          fill: 'var(--atencao)',
                          fontSize: 10,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="manter"
                        stroke="var(--condenar)"
                        strokeWidth={2.5}
                        dot={{ r: 2.5, fill: 'var(--condenar)', stroke: 'none' }}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="repor"
                        stroke="var(--dimensional)"
                        strokeWidth={2.5}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <ReferenceDot
                        x={posicaoAtual}
                        y={manterAgora}
                        r={5}
                        fill="var(--sinal)"
                        stroke="var(--aco-900)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1.5 text-2xs text-texto-2">
                    <span aria-hidden className="h-0.5 w-4 bg-condenar" /> custo de manter, cresce
                    com o desgaste
                  </span>
                  <span className="flex items-center gap-1.5 text-2xs text-texto-2">
                    <span aria-hidden className="h-0.5 w-4 bg-dimensional" /> custo de repor,
                    constante
                  </span>
                </div>
                <p className="mt-1.5 text-2xs text-texto-2">
                  O cruzamento é o argumento inteiro. Antes dele, manter é barato; depois, cada
                  golpe a mais custa mais do que a peça nova.
                </p>
              </section>

              {/* 2 e 3. os dois lados e a recomendação */}
              <div className="flex flex-col bg-aco-800">
                <section className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="rotulo">Manter mais 100 mil golpes</h2>
                    <ChipFase fase="Fase 3" degrau={3} />
                  </div>
                  <p className="mono mt-1 text-2xl font-medium text-condenar">
                    {brl(tradeoff.custoManterProximos100k.valor)}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {tradeoff.custoManterProximos100k.componentes.map((c) => {
                      const fatia = c.valor / tradeoff.custoManterProximos100k.valor
                      return (
                        <li key={c.rotulo}>
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-2xs text-texto-2">{c.rotulo}</span>
                            <span className="mono text-xs text-texto">{brl(c.valor)}</span>
                          </div>
                          <div className="mt-0.5 h-1 w-full bg-aco-900">
                            <div
                              className="h-full bg-condenar/70"
                              style={{ width: `${fatia * 100}%` }}
                            />
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </section>

                <Fio />

                <section className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="rotulo">Repor agora</h2>
                    <ChipFase fase="Fase 4" degrau={4} />
                  </div>
                  <p className="mono mt-1 text-2xl font-medium text-dimensional">
                    {brl(tradeoff.custoRepor.valor)}
                  </p>
                  <p className="mt-1 text-2xs text-texto-2">{tradeoff.custoRepor.detalhe}</p>
                  <div className="mt-2 flex items-baseline justify-between gap-2 border border-linha px-2 py-1.5">
                    <span className="text-2xs text-texto-2">Diferença a favor de repor</span>
                    <span className="mono text-sm text-tolerancia">
                      {brl(tradeoff.custoManterProximos100k.valor - tradeoff.custoRepor.valor)}
                    </span>
                  </div>
                </section>

                <Fio />

                <section className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="rotulo">Recomendação do agente</h2>
                    <ChipFase fase="Fase 3" degrau={3} />
                  </div>
                  <p className="mt-1 text-sm leading-snug text-texto">{tradeoff.recomendacao}</p>

                  {criada || jaTemFicha ? (
                    <div className="mt-3 border border-tolerancia/40 bg-tolerancia/[0.06] p-2.5">
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-tolerancia">
                        <Check size={13} aria-hidden />
                        Ficha de aquisição criada
                      </p>
                      <p className="mt-1 text-2xs text-texto-2">
                        Entrou no exercício 2027 com origem em condição medida.
                      </p>
                      <Botao
                        variante="primario"
                        className="mt-2"
                        onClick={() => navegar('/reposicao')}
                      >
                        Ver na reposição
                        <ArrowRight size={13} aria-hidden />
                      </Botao>
                    </div>
                  ) : (
                    <Botao variante="primario" className="mt-3 w-full" onClick={criarFicha}>
                      Incluir na ficha de aquisição
                    </Botao>
                  )}
                </section>

                {/* aviso obrigatório, no rodapé do painel */}
                <div className="mt-auto border-t border-atencao/30 bg-atencao/[0.05] px-3 py-2">
                  <p className="text-2xs leading-relaxed text-atencao">{tradeoff.aviso}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Casca>
  )
}
