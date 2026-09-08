import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Casca } from '../../casca/Casca'
import { BotaoReiniciar } from '../../componentes/BotaoReiniciar'
import { ChipFase } from '../../componentes/ChipFase'
import { TituloTela } from '../../componentes/TituloTela'
import { itemPorSerial, itens, pontoZero, SERIAL_HEROI, ultimaMedicao } from '../../dados/seletores'
import type { Cota } from '../../dados/tipos'
import { Bancada, type Camada } from './Bancada'
import { BarraIdentificacao } from './BarraIdentificacao'
import { CartaoCavidade } from './CartaoCavidade'
import { Abas } from '../../componentes/Abas'
import { PainelComparar } from './PainelComparar'
import { PainelFila } from './PainelFila'
import { PainelHistorico } from './PainelHistorico'
import { PainelRecebimento } from './PainelRecebimento'
import { PainelVisao } from './PainelVisao'
import { usarVarredura } from './usarVarredura'

type Painel = 'leitura' | 'comparar' | 'historico' | 'fila' | 'recebimento'

/**
 * Agente de Visão — o centro da demonstração.
 * Bancada à esquerda (fluida, mínimo 60%), painel de leitura à direita (380px).
 */
export function TelaVisao() {
  const [busca] = useSearchParams()
  const serial = busca.get('item') ?? SERIAL_HEROI
  const item = itemPorSerial(serial)
  const medicao = ultimaMedicao(serial)

  const [camadas, setCamadas] = useState<Set<Camada>>(new Set(['cavidades', 'achados']))
  const [selecao, setSelecao] = useState<string[]>([])
  const [achadoDestacado, setAchadoDestacado] = useState<string | null>(null)
  const [painel, setPainel] = useState<Painel>('leitura')
  const [cortina, setCortina] = useState(0.5)
  const [cotasRecebimento, setCotasRecebimento] = useState<Cota[] | null>(null)

  const varredura = usarVarredura(medicao)
  const zero = pontoZero(serial)

  // a rota pode pedir a varredura sozinha: /visao?item=FS-0192&acao=varrer
  const acao = busca.get('acao')
  useEffect(() => {
    if (acao === 'varrer') varredura.avaliar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acao, serial])

  // comparação e histórico leem a medição existente: a bancada não pode ficar
  // vazia só porque a varredura ainda não foi acionada nesta sessão
  useEffect(() => {
    if ((painel === 'comparar' || painel === 'historico') && varredura.fase === 'ociosa') {
      varredura.revelarSemAnimacao()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [painel, varredura.fase])

  // a rota também escolhe o painel: /visao?item=FS-0192&painel=historico
  const painelDaRota = busca.get('painel')
  useEffect(() => {
    if (
      painelDaRota &&
      ['leitura', 'comparar', 'historico', 'fila', 'recebimento'].includes(painelDaRota)
    ) {
      setPainel(painelDaRota as Painel)
    }
    // o passo 6 do roteiro pede a decisão, que vive no fim do painel de leitura
    if (painelDaRota === 'decisao') {
      setPainel('leitura')
      varredura.revelarSemAnimacao()
      // deixa o bloco montar antes de rolar até ele
      window.setTimeout(
        () => document.getElementById('bloco-decisao')?.scrollIntoView({ block: 'center' }),
        80,
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [painelDaRota])

  useEffect(() => {
    if (painel !== 'recebimento') setCotasRecebimento(null)
  }, [painel])

  function alternarCamada(c: Camada) {
    setCamadas((atual) => {
      const nova = new Set(atual)
      if (nova.has(c)) nova.delete(c)
      else nova.add(c)
      return nova
    })
  }

  function selecionar(id: string) {
    setSelecao((atual) => {
      if (atual.includes(id)) return atual.filter((x) => x !== id)
      // no máximo duas: a leitura útil é a comparação entre um par
      return [...atual, id].slice(-2)
    })
  }

  if (!item) {
    return (
      <Casca agenteId="visao">
        <TituloTela agenteId="visao" acessorio={<BotaoReiniciar />} />
        <div className="p-6 text-xs text-texto-2">
          Item <span className="mono text-texto">{serial}</span> não está na base serializada.
          Escolha uma peça na fila do Guardião.
        </div>
      </Casca>
    )
  }

  return (
    <Casca agenteId="visao">
      <div className="flex h-full flex-col">
        <TituloTela
          agenteId="visao"
          acessorio={
            <>
              <ChipFase fase="Fase 2" degrau={3} />
              <BotaoReiniciar />
            </>
          }
        />
        <BarraIdentificacao item={item} medicao={medicao} />

        <div className="flex min-h-0 flex-1">
          {/* bancada: fluida, mínimo 60% */}
          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
            <Bancada
              medicao={medicao}
              cotasVisiveis={
                painel === 'recebimento' && cotasRecebimento
                  ? cotasRecebimento
                  : varredura.cotasVisiveis
              }
              achadosVisiveis={painel === 'recebimento' ? [] : varredura.achadosVisiveis}
              camadas={camadas}
              aoAlternarCamada={alternarCamada}
              selecao={selecao}
              aoSelecionar={selecionar}
              achadoDestacado={achadoDestacado}
              varredura={varredura.progresso}
              planicidade={medicao?.planicidade.valor}
              cortina={painel === 'comparar' ? cortina : null}
              cotasZero={zero?.cotas}
            />
            <CartaoCavidade
              serial={serial}
              selecao={selecao}
              cotas={varredura.cotasVisiveis}
              aoFechar={() => setSelecao([])}
              aoRemover={(id) => setSelecao((a) => a.filter((x) => x !== id))}
            />
          </div>

          {/* painel de leitura: 380px fixos */}
          <aside className="flex w-[380px] shrink-0 flex-col border-l border-linha bg-aco-800/40">
            <div className="shrink-0 border-b border-linha px-2">
              <Abas<Painel>
                abas={[
                  { id: 'leitura', rotulo: 'Leitura' },
                  { id: 'comparar', rotulo: 'Comparar' },
                  { id: 'historico', rotulo: 'Histórico' },
                  { id: 'fila', rotulo: 'Fila', contagem: itens.filter((i) => i.local === 'avaliacao').length },
                  { id: 'recebimento', rotulo: 'Recebimento' },
                ]}
                ativa={painel}
                aoTrocar={setPainel}
                compacta
              />
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-auto">
              {painel === 'fila' ? (
                <PainelFila serialAtivo={serial} />
              ) : painel === 'recebimento' ? (
                <PainelRecebimento serial={serial} aoUsarCotas={setCotasRecebimento} />
              ) : !medicao ? (
                <div className="px-4 py-3 text-xs text-texto-2">
                  Este item ainda não tem medição no rig. Ele entra na fila de avaliação do
                  Guardião, e a bancada fica pronta para a captura.
                </div>
              ) : painel === 'comparar' ? (
                <PainelComparar serial={serial} posicao={cortina} aoMover={setCortina} />
              ) : painel === 'historico' ? (
                <PainelHistorico serial={serial} />
              ) : (
                <PainelVisao
                  item={item}
                  medicao={medicao}
                  fase={varredura.fase}
                  achadosVisiveis={varredura.achadosVisiveis}
                  blocosRevelados={varredura.blocosRevelados}
                  aoAvaliar={varredura.avaliar}
                  achadoDestacado={achadoDestacado}
                  aoDestacarAchado={setAchadoDestacado}
                />
              )}
            </div>
          </aside>
        </div>
      </div>
    </Casca>
  )
}
