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
import { BlocoLeitura, LinhaDado, PainelLeitura } from '../../componentes/PainelLeitura'
import { ChipFase } from '../../componentes/ChipFase'
import { SeloVeredito } from '../../componentes/SeloVeredito'
import { cota as fCota, data, golpes, num, pct } from '../../dados/formato'
import { medicoesDoItem, tendencia } from '../../dados/seletores'

/**
 * Histórico e tendência de desgaste.
 *
 * É o ponto mais delicado do produto. O gráfico é extrapolação linear sobre
 * quatro medições, degrau 2 da escada analítica — não é predição. A vida
 * remanescente só existe DENTRO deste bloco, colada ao aviso de degrau. Não
 * há nenhum outro lugar no produto onde esse número apareça solto.
 */
export function PainelHistorico({ serial }: { serial: string }) {
  const medicoes = medicoesDoItem(serial)

  /*
   * A reta vem pronta do seed: inclinação, intercepto e cruzamento são
   * derivados dos pontos no gerador. O gráfico e os números do painel leem a
   * mesma conta, então não existe como a curva desenhada discordar do valor
   * escrito ao lado dela.
   */
  const pts = tendencia.pontos
  const inclinacao = tendencia.inclinacaoPorCemMilGolpes / 1e5
  const intercepto = tendencia.interceptoPercentual
  const ciclosNoLimite = tendencia.cruzamentoGolpes
  const ultimoCiclo = pts[pts.length - 1].ciclos

  // série única: medido até o último ponto, projetado dali até o cruzamento
  const serie = [
    ...pts.map((p) => ({ ciclos: p.ciclos, medido: p.desgaste, projetado: null as number | null })),
    ...Array.from({ length: 6 }, (_, i) => {
      const c = ultimoCiclo + ((ciclosNoLimite - ultimoCiclo) * (i + 1)) / 6
      return { ciclos: Math.round(c), medido: null, projetado: intercepto + inclinacao * c }
    }),
  ]
  // o último ponto medido também ancora a projeção, para as linhas se tocarem
  serie[pts.length - 1].projetado = pts[pts.length - 1].desgaste

  return (
    <PainelLeitura className="min-h-full">
      {/* linha do tempo das medições */}
      <BlocoLeitura
        titulo={`Medições · ${medicoes.length}`}
        acessorio={<ChipFase fase="Fase 2" degrau={3} />}
        semFio
      >
        <ol className="relative ml-1 border-l border-linha pl-3">
          {medicoes
            .slice()
            .reverse()
            .map((m, i) => (
              <li key={m.id} className="relative pb-2.5 last:pb-0">
                <span
                  aria-hidden
                  className={`absolute -left-[17px] top-1 h-1.5 w-1.5 rounded-full ${
                    i === 0 ? 'bg-sinal' : 'bg-linha'
                  }`}
                />
                <div className="flex items-baseline justify-between gap-2">
                  <span className="mono text-2xs text-texto">{data(m.data)}</span>
                  <SeloVeredito estado={m.estado} />
                </div>
                <div className="mt-0.5 flex items-baseline justify-between gap-2">
                  <span className="mono text-2xs text-texto-2">{golpes(m.ciclosNaMedicao)}</span>
                  <span className="mono text-2xs text-texto-2">
                    serrilha {pct(m.serrilha.perdaAlturaPico)}
                  </span>
                </div>
                {m.decisaoHumana && (
                  <p className="mt-0.5 text-2xs italic text-texto-2">
                    {m.decisaoHumana.usuario}: “{m.decisaoHumana.observacao}”
                  </p>
                )}
              </li>
            ))}
        </ol>
      </BlocoLeitura>

      {/* tendência — o bloco que carrega a ressalva de degrau */}
      <BlocoLeitura
        titulo="Desgaste da serrilha contra ciclos"
        acessorio={<ChipFase fase="Fase 2" degrau={2} destaque />}
      >
        <div className="h-[188px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={serie} margin={{ top: 8, right: 10, bottom: 4, left: -18 }}>
              <CartesianGrid stroke="var(--linha)" strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="ciclos"
                type="number"
                domain={[0, Math.ceil(ciclosNoLimite / 100000) * 100000]}
                tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                tick={{ fill: 'var(--texto-2)', fontSize: 9, fontFamily: 'IBM Plex Mono' }}
                stroke="var(--linha)"
              />
              <YAxis
                domain={[0, 55]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fill: 'var(--texto-2)', fontSize: 9, fontFamily: 'IBM Plex Mono' }}
                stroke="var(--linha)"
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--aco-800)',
                  border: '1px solid var(--linha)',
                  borderRadius: 4,
                  fontSize: 11,
                }}
                labelFormatter={(v) => `${num(Number(v))} golpes`}
                formatter={(v: number, nome: string) => [
                  `${fCota(v)}%`,
                  nome === 'medido' ? 'medido' : 'projetado',
                ]}
              />
              {/* linha de condenação */}
              <ReferenceLine
                y={tendencia.limiteCondenacao}
                stroke="var(--condenar)"
                strokeDasharray="5 4"
                label={{
                  value: `condenação ${tendencia.limiteCondenacao}%`,
                  position: 'insideTopRight',
                  fill: 'var(--condenar)',
                  fontSize: 9,
                }}
              />
              <Line
                type="linear"
                dataKey="medido"
                stroke="var(--dimensional)"
                strokeWidth={2}
                dot={{ r: 3, fill: 'var(--dimensional)', stroke: 'none' }}
                connectNulls
                isAnimationActive={false}
              />
              <Line
                type="linear"
                dataKey="projetado"
                stroke="var(--atencao)"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
              <ReferenceDot
                x={Math.round(ciclosNoLimite)}
                y={tendencia.limiteCondenacao}
                r={4}
                fill="var(--condenar)"
                stroke="none"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <LinhaDado rotulo="Inclinação medida">
          <span className="mono text-dimensional">
            {fCota(tendencia.inclinacaoPorCemMilGolpes)}% / 100 mil golpes
          </span>
        </LinhaDado>
        <LinhaDado rotulo="Limite de condenação">
          <span className="mono text-condenar">{pct(tendencia.limiteCondenacao)}</span>
        </LinhaDado>
        <LinhaDado rotulo="Cruzamento projetado">
          <span className="mono text-atencao">{golpes(tendencia.cruzamentoGolpes)}</span>
        </LinhaDado>

        {/*
          A vida remanescente vive aqui dentro e em nenhum outro lugar do
          produto, sempre encostada no aviso de degrau 2.
        */}
        <div className="mt-2 border border-atencao/40 bg-atencao/[0.06] p-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-2xs uppercase tracking-[0.06em] text-atencao">
              Vida remanescente até a condenação
            </span>
          </div>
          <div className="mono mt-0.5 text-xl font-medium text-atencao">
            ~{num(tendencia.vidaRemanescenteGolpes)}
            <span className="ml-1 text-2xs font-normal">golpes</span>
          </div>
          <p className="mt-1.5 text-2xs leading-relaxed text-texto-2">{tendencia.avisoDegrau}</p>
          <p className="mt-1.5 text-2xs italic text-texto-2/80">Método: {tendencia.metodo}.</p>
          <p className="mt-1 text-2xs italic text-texto-2/70">{tendencia.notaDerivacao}</p>
        </div>
      </BlocoLeitura>
    </PainelLeitura>
  )
}
