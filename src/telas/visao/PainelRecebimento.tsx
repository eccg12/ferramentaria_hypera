import { useMemo, useState } from 'react'
import { PackageCheck } from 'lucide-react'
import { BlocoLeitura, LinhaDado, PainelLeitura } from '../../componentes/PainelLeitura'
import { Botao } from '../../componentes/Botao'
import { ChipFase } from '../../componentes/ChipFase'
import { COR_STATUS, ROTULO_STATUS } from '../../componentes/Cota'
import { SeloVeredito } from '../../componentes/SeloVeredito'
import { cota as fCota, data, num, pct } from '../../dados/formato'
import { fornecedores, pontoZero, specs } from '../../dados/seletores'
import type { Cota, StatusCota } from '../../dados/tipos'

/**
 * Inspeção de recebimento — SPEC 1.6.
 *
 * O caso de uso que paga rápido e que o cliente levantou na reunião: "entrou
 * boa, veio ruim". Mesma bancada, peça nova, comparação dimensional contra o
 * desenho em vez de contra o histórico. O resultado alimenta a comparação de
 * fornecedores.
 *
 * As cotas vêm do escaneamento de ponto zero de FS-0192, que é a peça nova
 * medida no mesmo rig. Nada é gerado aqui.
 */
export function PainelRecebimento({
  serial,
  aoUsarCotas,
}: {
  serial: string
  /** Publica as cotas do recebimento para a bancada desenhar. */
  aoUsarCotas: (cotas: Cota[] | null) => void
}) {
  const zero = pontoZero(serial)
  const [aceito, setAceito] = useState<'aceito' | 'recusado' | null>(null)
  const spec = specs.profundidadeCavidade

  const resumo = useMemo(() => {
    const base = { fora: 0, atencao: 0, ok: 0, total: 0 }
    for (const c of zero?.cotas ?? []) {
      base.total += 1
      base[c.status as StatusCota] += 1
    }
    return base
  }, [zero])

  if (!zero) {
    return (
      <PainelLeitura>
        <BlocoLeitura semFio>
          <p className="text-xs text-texto-2">
            Esta peça não tem escaneamento de recebimento. O recebimento é a primeira captura no
            rig, antes de a peça entrar no armário.
          </p>
        </BlocoLeitura>
      </PainelLeitura>
    )
  }

  const desvioMedio =
    zero.cotas.reduce((s, c) => s + Math.abs(c.valor - c.nominal), 0) / zero.cotas.length
  const fornecedor = fornecedores[0]

  return (
    <PainelLeitura className="min-h-full">
      <BlocoLeitura
        titulo="Inspeção de recebimento"
        acessorio={<ChipFase fase="Fase 2" degrau={3} />}
        semFio
      >
        <p className="text-xs leading-relaxed text-texto-2">
          A peça é medida antes de entrar no armário, contra o desenho — não contra o histórico,
          que ainda não existe. É o que responde a “entrou boa e veio ruim” com número em vez de
          memória.
        </p>
        <Botao
          className="mt-2 w-full"
          onClick={() => aoUsarCotas(zero.cotas)}
          title="Desenha as cotas do recebimento sobre a bancada"
        >
          <PackageCheck size={13} aria-hidden />
          Ver as cotas na bancada
        </Botao>
      </BlocoLeitura>

      <BlocoLeitura
        titulo="Comparação dimensional contra o desenho"
        acessorio={<ChipFase fase="Fase 2" degrau={3} />}
      >
        <LinhaDado rotulo="Cota controlada">
          <span className="mono text-texto">profundidade de cavidade</span>
        </LinhaDado>
        <LinhaDado rotulo="Nominal e tolerância">
          <span className="mono text-texto">
            {fCota(spec.nominal)} ± {fCota(spec.tol)} {spec.unidade}
          </span>
        </LinhaDado>
        <LinhaDado rotulo="Desvio médio absoluto">
          <span className="mono text-dimensional">{fCota(desvioMedio)} mm</span>
        </LinhaDado>
        <LinhaDado rotulo="Captura">
          <span className="mono text-texto-2">{data(zero.data)}</span>
        </LinhaDado>
        <LinhaDado rotulo="Rig e calibração">
          <span className="mono text-texto-2">
            {zero.rig} · {zero.calibracao.certificado}
          </span>
        </LinhaDado>

        <div className="mt-2 flex items-stretch gap-px border border-linha">
          {(
            [
              ['fora', resumo.fora, 'text-condenar'],
              ['em atenção', resumo.atencao, 'text-atencao'],
              ['dentro', resumo.ok, 'text-tolerancia'],
            ] as [string, number, string][]
          ).map(([rot, valor, cor]) => (
            <div key={rot} className="flex-1 bg-aco-800 px-2 py-1.5">
              <div className={`mono text-base font-medium ${cor}`}>{valor}</div>
              <div className="text-2xs text-texto-2">{rot}</div>
            </div>
          ))}
        </div>
        <p className="mt-1 text-2xs text-texto-2">
          {resumo.total} cavidades medidas no recebimento.
        </p>
      </BlocoLeitura>

      <BlocoLeitura titulo="Cotas com maior desvio" acessorio={<ChipFase fase="Fase 2" degrau={3} />}>
        <ul className="space-y-0.5">
          {zero.cotas
            .slice()
            .sort((a, b) => Math.abs(b.valor - b.nominal) - Math.abs(a.valor - a.nominal))
            .slice(0, 5)
            .map((c) => (
              <li key={c.alvo} className="flex items-baseline justify-between gap-2">
                <span className="mono text-2xs text-texto-2">{c.alvo}</span>
                <span className={`mono text-xs ${COR_STATUS[c.status]}`}>
                  {fCota(c.valor)} mm
                </span>
                <span className="mono w-14 text-right text-2xs text-texto-2">
                  {c.valor - c.nominal > 0 ? '+' : ''}
                  {fCota(c.valor - c.nominal)}
                </span>
                <span className={`w-24 text-right text-2xs ${COR_STATUS[c.status]}`}>
                  {ROTULO_STATUS[c.status]}
                </span>
              </li>
            ))}
        </ul>
      </BlocoLeitura>

      <BlocoLeitura titulo="O que isso alimenta" acessorio={<ChipFase fase="Fase 4" degrau={4} />}>
        <p className="text-2xs leading-relaxed text-texto-2">
          Cada recebimento medido vira uma amostra na comparação de fornecedores. Hoje{' '}
          <span className="mono text-texto">{fornecedor.codigo}</span> tem{' '}
          <span className="mono text-texto">{fornecedor.amostras}</span> amostras e{' '}
          <span className="mono text-texto">{pct(fornecedor.foraDeSpecNoRecebimento)}</span> fora de
          spec no recebimento. É assim que a comparação sai de hipótese para conclusão: uma peça de
          cada vez.
        </p>
      </BlocoLeitura>

      <BlocoLeitura
        titulo="Disposição do recebimento"
        acessorio={<ChipFase fase="Fase 2" degrau={3} />}
      >
        {aceito ? (
          <div className="border border-linha bg-aco-800/60 p-2.5">
            <p className="text-xs font-semibold text-texto">
              {aceito === 'aceito' ? 'Aceito e liberado para o armário' : 'Recusado ao fornecedor'}
            </p>
            <p className="mt-1 text-2xs text-texto-2">
              O registro entra na série do fornecedor e no histórico da peça.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-2 flex items-center gap-2">
              <SeloVeredito estado={zero.estado} />
              <span className="text-2xs text-texto-2">
                {resumo.fora === 0
                  ? 'todas as cotas dentro do desenho'
                  : `${resumo.fora} cota(s) fora do desenho`}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <Botao variante="primario" onClick={() => setAceito('aceito')}>
                Aceitar
              </Botao>
              <Botao onClick={() => setAceito('recusado')}>Recusar ao fornecedor</Botao>
            </div>
          </>
        )}
      </BlocoLeitura>

      <BlocoLeitura titulo="Fila de recebimento">
        <p className="text-2xs text-texto-2">
          <span className="mono text-texto">{num(0)}</span> peças aguardando inspeção de
          recebimento nesta demonstração. A fila real vem da entrada do almoxarifado.
        </p>
      </BlocoLeitura>
    </PainelLeitura>
  )
}
