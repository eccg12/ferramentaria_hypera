import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertTriangle, Sparkles } from 'lucide-react'
import { Casca } from '../../casca/Casca'
import { BotaoReiniciar } from '../../componentes/BotaoReiniciar'
import { ChipFase } from '../../componentes/ChipFase'
import { TituloTela } from '../../componentes/TituloTela'
import { brl, num, pct } from '../../dados/formato'
import { fichasAquisicao, fornecedores, plano3YP, rotuloFamilia } from '../../dados/seletores'
import { useApp } from '../../estado/contexto'

/**
 * Reposição & Fornecedores — Fase 4, degrau 4.
 *
 * Três blocos numa tela: as fichas de aquisição de 2027 com a origem de cada
 * uma, o 3YP por exercício e família, e a comparação entre os dois
 * fornecedores.
 *
 * A comparação não pode sugerir que a diferença está provada: 15 a 18 peças
 * não fecham a conclusão, e o número de amostras precisa estar visível.
 */
/*
 * Família é dimensão nominal, não condição. As cinco cores semânticas não
 * entram aqui: elas só aparecem carregando significado de condição. A série
 * usa uma rampa da própria cor de marca, e a leitura exata vem da legenda e
 * do tooltip.
 */
const RAMPA_SERIE = [
  'rgb(var(--sinal-rgb) / 0.92)',
  'rgb(var(--sinal-rgb) / 0.66)',
  'rgb(var(--sinal-rgb) / 0.42)',
  'rgb(var(--sinal-rgb) / 0.22)',
]

const corDaSerie = (i: number) => RAMPA_SERIE[i % RAMPA_SERIE.length]

export function TelaReposicao() {
  const { estado } = useApp()

  // a ficha criada no trade-off entra no topo, marcada como nova
  const fichas = [...estado.fichasSessao, ...fichasAquisicao]

  const familias = useMemo(
    () => Array.from(new Set(plano3YP.map((l) => l.familia))),
    [],
  )

  const serie3YP = useMemo(() => {
    const exercicios = Array.from(new Set(plano3YP.map((l) => l.exercicio))).sort()
    return exercicios.map((ex) => {
      const linha: Record<string, number | string> = { exercicio: String(ex) }
      for (const f of familias) {
        linha[f] = plano3YP.find((l) => l.exercicio === ex && l.familia === f)?.valor ?? 0
      }
      return linha
    })
  }, [familias])

  const totalPorExercicio = serie3YP.map((l) =>
    familias.reduce((s, f) => s + (Number(l[f]) || 0), 0),
  )

  const [a, b] = fornecedores
  const amostrasTotais = fornecedores.reduce((s, f) => s + f.amostras, 0)
  const difDurabilidade =
    ((b.durabilidadeMediaGolpes - a.durabilidadeMediaGolpes) / a.durabilidadeMediaGolpes) * 100

  return (
    <Casca agenteId="reposicao">
      <div className="flex h-full flex-col">
        <TituloTela
          agenteId="reposicao"
          acessorio={
            <>
              <ChipFase fase="Fase 4" degrau={4} />
              <BotaoReiniciar />
            </>
          }
        />

        <div className="min-h-0 flex-1 overflow-auto p-4">
          <div className="mx-auto grid min-h-full max-w-[1600px] auto-rows-min gap-px bg-linha xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:[grid-template-rows:auto_1fr]">
            {/* 1. fichas de aquisição */}
            <section className="bg-aco-800 p-3 xl:col-span-2">
              <header className="mb-2 flex items-center justify-between gap-2">
                <h2 className="rotulo">Fichas de aquisição · exercício 2027</h2>
                <ChipFase fase="Fase 4" degrau={4} />
              </header>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-aco-700">
                    {['Ficha', 'Família', 'Origem', 'Item de origem', 'Qtd.', 'Valor unitário', 'Total', 'Situação'].map(
                      (c, i) => (
                        <th
                          key={c}
                          scope="col"
                          className={`border-b border-linha px-2 py-1.5 text-2xs uppercase tracking-[0.06em] text-texto-2 ${
                            i >= 4 && i <= 6 ? 'text-right' : 'text-left'
                          }`}
                        >
                          {c}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {fichas.map((f) => (
                    <tr
                      key={f.id}
                      className={`border-b border-linha/60 ${f.nova ? 'bg-sinal/[0.07]' : ''}`}
                    >
                      <td className="px-2 py-1.5">
                        <span className="mono text-sinal">{f.id}</span>
                        {f.nova && (
                          <span className="ml-1.5 inline-flex items-center gap-1 text-2xs uppercase tracking-[0.06em] text-sinal">
                            <Sparkles size={10} aria-hidden />
                            nova
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-1.5 text-texto-2">{rotuloFamilia(f.familia)}</td>
                      <td className="px-2 py-1.5">
                        <span
                          className={
                            f.origem === 'condição medida'
                              ? 'text-tolerancia'
                              : f.origem === 'ciclos acima do limite'
                                ? 'text-condenar'
                                : 'text-atencao'
                          }
                        >
                          {f.origem}
                        </span>
                      </td>
                      <td className="mono px-2 py-1.5 text-texto-2">{f.itemOrigem ?? '—'}</td>
                      <td className="mono px-2 py-1.5 text-right">{f.quantidade}</td>
                      <td className="mono px-2 py-1.5 text-right text-texto-2">
                        {brl(f.valorUnitario)}
                      </td>
                      <td className="mono px-2 py-1.5 text-right">
                        {brl(f.quantidade * f.valorUnitario)}
                      </td>
                      <td className="px-2 py-1.5 text-texto-2">{f.status}</td>
                    </tr>
                  ))}
                  <tr className="bg-aco-700">
                    <td colSpan={6} className="px-2 py-1.5 text-2xs uppercase tracking-[0.06em] text-texto-2">
                      Total do exercício
                    </td>
                    <td className="mono px-2 py-1.5 text-right text-sm text-texto">
                      {brl(fichas.reduce((s, f) => s + f.quantidade * f.valorUnitario, 0))}
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
              <p className="mt-2 text-2xs text-texto-2">
                Cada ficha carrega a origem. Uma ficha com lastro em condição medida é uma
                conversa diferente de uma ficha com lastro em calendário.
              </p>
            </section>

            {/* 2. 3YP */}
            <section className="flex min-h-0 flex-col bg-aco-800 p-3">
              <header className="mb-2 flex items-center justify-between gap-2">
                <h2 className="rotulo">3YP · plano de reposição de três exercícios</h2>
                <ChipFase fase="Fase 4" degrau={4} />
              </header>
              <div className="min-h-[240px] w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serie3YP} margin={{ top: 4, right: 8, bottom: 0, left: 6 }}>
                    <CartesianGrid stroke="var(--linha)" strokeDasharray="2 4" vertical={false} />
                    <XAxis
                      dataKey="exercicio"
                      tick={{ fill: 'var(--texto-2)', fontSize: 11, fontFamily: 'IBM Plex Mono' }}
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
                      formatter={(v: number, nome: string) => [brl(v), rotuloFamilia(nome)]}
                      cursor={{ fill: 'var(--linha)', opacity: 0.25 }}
                    />
                    <Legend
                      formatter={(v) => (
                        <span style={{ color: 'var(--texto-2)', fontSize: 10 }}>
                          {rotuloFamilia(v)}
                        </span>
                      )}
                    />
                    {familias.map((f, i) => (
                      <Bar
                        key={f}
                        dataKey={f}
                        stackId="a"
                        fill={corDaSerie(i)}
                        stroke="var(--aco-800)"
                        strokeWidth={1}
                        isAnimationActive={false}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-1.5 grid grid-cols-3 gap-px bg-linha">
                {serie3YP.map((l, i) => (
                  <div key={String(l.exercicio)} className="bg-aco-800 px-2 py-1.5">
                    <p className="mono text-2xs text-texto-2">{l.exercicio}</p>
                    <p className="mono text-sm text-texto">{brl(totalPorExercicio[i])}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. fornecedores */}
            <section className="bg-aco-800 p-3">
              <header className="mb-2 flex items-center justify-between gap-2">
                <h2 className="rotulo">Fornecedores · durabilidade observada no recebimento</h2>
                <ChipFase fase="Fase 4" degrau={4} />
              </header>

              <div className="grid grid-cols-2 gap-px bg-linha">
                {fornecedores.map((f) => (
                  <div key={f.codigo} className="bg-aco-900 p-2.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-semibold text-texto">{f.codigo}</span>
                      <span className="mono text-2xs text-texto-2">
                        {f.amostras} amostras
                      </span>
                    </div>
                    <dl className="mt-2 space-y-1">
                      {(
                        [
                          ['Preço médio', brl(f.precoMedio), 'text-texto'],
                          ['Prazo', `${f.prazoSemanas} semanas`, 'text-texto'],
                          [
                            'Durabilidade média',
                            `${num(f.durabilidadeMediaGolpes)} golpes`,
                            'text-dimensional',
                          ],
                          [
                            'Fora de spec no recebimento',
                            pct(f.foraDeSpecNoRecebimento),
                            f.foraDeSpecNoRecebimento > 8 ? 'text-condenar' : 'text-tolerancia',
                          ],
                        ] as [string, string, string][]
                      ).map(([rot, valor, cor]) => (
                        <div key={rot} className="flex items-baseline justify-between gap-2">
                          <dt className="text-2xs text-texto-2">{rot}</dt>
                          <dd className={`mono text-xs ${cor}`}>{valor}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-2 border-t border-linha pt-1.5 text-2xs text-texto-2">
                      {f.nota}
                    </p>
                  </div>
                ))}
              </div>

              {/* a ressalva que impede a tela de sugerir conclusão fechada */}
              <div className="mt-2 border border-atencao/40 bg-atencao/[0.06] p-2.5">
                <p className="flex items-start gap-1.5 text-2xs leading-relaxed text-atencao">
                  <AlertTriangle size={13} className="mt-px shrink-0" aria-hidden />
                  <span>
                    A durabilidade observada difere em{' '}
                    <span className="mono">{pct(Math.abs(difDurabilidade))}</span> entre os dois
                    fornecedores, sobre <span className="mono">{amostrasTotais}</span> peças ao
                    todo — <span className="mono">{a.amostras}</span> de {a.codigo} e{' '}
                    <span className="mono">{b.amostras}</span> de {b.codigo}. Isso é hipótese, não
                    conclusão. Uma amostra desse tamanho não separa fornecedor de formato, de
                    máquina nem de campanha; a comparação fecha com o recebimento em rotina, na
                    Fase 2.
                  </span>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Casca>
  )
}
