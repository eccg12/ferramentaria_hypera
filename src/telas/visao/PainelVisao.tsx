import { ScanLine } from 'lucide-react'
import { BlocoDecisao } from '../../componentes/BlocoDecisao'
import { BlocoLeitura, LinhaDado, PainelLeitura } from '../../componentes/PainelLeitura'
import { Botao } from '../../componentes/Botao'
import { ChipFase } from '../../componentes/ChipFase'
import { COR_STATUS } from '../../componentes/Cota'
import { Legenda } from '../../componentes/Legenda'
import { SeloVeredito } from '../../componentes/SeloVeredito'
import { cota as fCota, golpes, num, pct } from '../../dados/formato'
import { abaixoDoLimiar, LIMIAR_DECISAO, resumoDasCotas, tradeoff } from '../../dados/seletores'
import type { Achado, Item, Medicao } from '../../dados/tipos'
import type { FaseVarredura } from './usarVarredura'

/**
 * Painel de leitura do agente de visão: sete blocos empilhados, separados por
 * fio, sem gaps de cartão. Preenche de cima para baixo no ritmo da varredura.
 */
const COR_SEVERIDADE: Record<string, string> = {
  condenar: 'text-condenar',
  atencao: 'text-atencao',
  observar: 'text-texto-2',
}

interface Props {
  item: Item
  medicao: Medicao
  fase: FaseVarredura
  achadosVisiveis: Achado[]
  blocosRevelados: number
  aoAvaliar: () => void
  achadoDestacado: string | null
  aoDestacarAchado: (id: string | null) => void
}

export function PainelVisao({
  item,
  medicao,
  fase,
  achadosVisiveis,
  blocosRevelados,
  aoAvaliar,
  achadoDestacado,
  aoDestacarAchado,
}: Props) {
  const resumo = resumoDasCotas(medicao)
  const ociosa = fase === 'ociosa'

  return (
    <PainelLeitura className="min-h-full">
      {/* acionamento da varredura */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Botao
            variante="primario"
            onClick={aoAvaliar}
            disabled={fase === 'correndo'}
            className="flex-1"
          >
            <ScanLine size={13} aria-hidden />
            {ociosa ? 'Avaliar peça' : fase === 'correndo' ? 'Avaliando…' : 'Avaliar de novo'}
          </Botao>
        </div>
        {/* rótulo obrigatório: a inferência é simulada */}
        <p className="mt-1.5 text-2xs italic text-texto-2">
          inferência simulada — na PoC roda em Vertex AI
        </p>
      </div>

      {ociosa ? (
        <BlocoLeitura>
          <p className="text-xs text-texto-2">
            A peça está na fila de avaliação com{' '}
            <span className="mono text-texto">{golpes(item.ciclos)}</span> desde a última medição.
            Acione <span className="text-texto">Avaliar peça</span> para o agente classificar os
            defeitos e medir as cotas críticas.
          </p>
        </BlocoLeitura>
      ) : (
        <>
          {/* 1. veredito */}
          <BlocoLeitura
            titulo="Veredito"
            acessorio={<ChipFase fase="Fase 2" degrau={3} />}
            oculto={blocosRevelados < 1}
          >
            <div className="flex items-center gap-3">
              <SeloVeredito estado={medicao.estado} tamanho="g" />
            </div>
            <p className="mt-2 text-xs text-texto">{tradeoff.recomendacao}</p>
          </BlocoLeitura>

          {/* 2. concordância com o painel de especialistas */}
          <BlocoLeitura
            titulo="Concordância com o painel de especialistas"
            acessorio={<ChipFase fase="Fase 2" degrau={3} />}
            oculto={blocosRevelados < 2}
          >
            {medicao.concordanciaPainel !== null ? (
              <div className="flex items-baseline gap-2">
                <span className="mono text-xl font-medium text-tolerancia">
                  {medicao.concordanciaPainel}%
                </span>
                <span className="text-2xs text-texto-2">
                  {medicao.avaliadoresPainel} de {medicao.avaliadoresPainel} avaliadores
                </span>
              </div>
            ) : (
              <p className="text-xs text-texto-2">Sem painel para esta medição.</p>
            )}
          </BlocoLeitura>

          {/* 3. achados */}
          <BlocoLeitura
            titulo={`Achados · ${achadosVisiveis.length} de ${medicao.achados.length}`}
            acessorio={<ChipFase fase="Fase 2" degrau={3} />}
            oculto={blocosRevelados < 2}
          >
            <ul className="space-y-1.5">
              {achadosVisiveis.map((a) => {
                const fraco = abaixoDoLimiar(a)
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      onMouseEnter={() => aoDestacarAchado(a.id)}
                      onMouseLeave={() => aoDestacarAchado(null)}
                      onClick={() => aoDestacarAchado(achadoDestacado === a.id ? null : a.id)}
                      className={`w-full border-l-2 px-2 py-1 text-left transition-colors ${
                        achadoDestacado === a.id
                          ? 'border-l-sinal bg-aco-700/60'
                          : 'border-l-linha hover:bg-aco-700/30'
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className={`text-xs ${COR_SEVERIDADE[a.severidade]}`}>
                          <span className="mono mr-1.5 opacity-70">{a.id}</span>
                          {a.rotulo}
                        </span>
                        <span className={`mono shrink-0 text-xs ${COR_SEVERIDADE[a.severidade]}`}>
                          {fCota(a.score)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-2xs text-texto-2">
                        {a.detalhe} · alvo <span className="mono">{a.alvo}</span>
                      </p>
                      {/* abaixo do limiar nunca vira veredito */}
                      {fraco && (
                        <p className="mt-1 inline-block border border-linha px-1.5 py-0.5 text-2xs uppercase tracking-[0.06em] text-texto-2">
                          abaixo do limiar — avaliar manualmente
                        </p>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
            <p className="mt-2 text-2xs text-texto-2">
              Limiar de decisão <span className="mono">{fCota(LIMIAR_DECISAO)}</span>. Abaixo dele o
              achado é registrado para acompanhamento, não entra no veredito.
            </p>
          </BlocoLeitura>

          {/* 4. cotas críticas */}
          <BlocoLeitura
            titulo="Cotas críticas"
            acessorio={<ChipFase fase="Fase 2" degrau={3} />}
            oculto={blocosRevelados < 3}
          >
            <LinhaDado rotulo={`Serrilha ${medicao.serrilha.alvo} · perda de altura de pico`}>
              <span className={`mono ${COR_STATUS[medicao.serrilha.status]}`}>
                {pct(medicao.serrilha.perdaAlturaPico)}
              </span>
              <span className="mono ml-1.5 text-2xs text-texto-2">
                limite {pct(medicao.serrilha.limite)}
              </span>
            </LinhaDado>

            <LinhaDado rotulo="Planicidade">
              <span className={`mono ${COR_STATUS[medicao.planicidade.status]}`}>
                {fCota(medicao.planicidade.valor)} {medicao.planicidade.unidade}
              </span>
              <span className="mono ml-1.5 text-2xs text-texto-2">
                limite {fCota(medicao.planicidade.limite)}
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
              {resumo.total} cavidades medidas contra{' '}
              <span className="mono">
                {fCota(medicao.cotas[0]?.nominal ?? 0)} ± {fCota(medicao.cotas[0]?.tolerancia ?? 0)}
              </span>{' '}
              mm de profundidade.
            </p>
          </BlocoLeitura>

          {/* 5. ciclos */}
          <BlocoLeitura
            titulo="Ciclos"
            acessorio={<ChipFase fase="Fase 1" degrau={2} />}
            oculto={blocosRevelados < 4}
          >
            <div className="mono text-xl font-medium text-texto">{num(medicao.ciclosNaMedicao)}</div>
            <p className="text-2xs text-texto-2">golpes desde a última medição</p>
            <p className="mt-1.5 text-2xs italic text-texto-2">
              derivado de OP × bolhas por golpe (SAP PP)
            </p>
          </BlocoLeitura>

          {/* 6. decisão */}
          <BlocoLeitura
            titulo="Decisão"
            acessorio={<ChipFase fase="Fase 2" degrau={3} />}
            oculto={blocosRevelados < 5}
            className="scroll-mt-4"
            id="bloco-decisao"
          >
            <BlocoDecisao
              itemSerial={item.serial}
              medicaoId={medicao.id}
              recomendacao={tradeoff.recomendacao}
            />
          </BlocoLeitura>
        </>
      )}

      {/* 7. legenda */}
      <div className="mt-auto border-t border-linha px-4 py-3">
        <Legenda />
      </div>
    </PainelLeitura>
  )
}
