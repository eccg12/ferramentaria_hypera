import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Casca } from '../../casca/Casca'
import { BotaoReiniciar } from '../../componentes/BotaoReiniciar'
import { ChipFase } from '../../componentes/ChipFase'
import { Legenda } from '../../componentes/Legenda'
import { TituloTela } from '../../componentes/TituloTela'
import { itemPorSerial, SERIAL_HEROI, ultimaMedicao } from '../../dados/seletores'
import { Bancada, type Camada } from './Bancada'
import { BarraIdentificacao } from './BarraIdentificacao'
import { CartaoCavidade } from './CartaoCavidade'

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

  const cotas = useMemo(() => medicao?.cotas ?? [], [medicao])
  const achados = useMemo(() => medicao?.achados ?? [], [medicao])

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
              cotasVisiveis={cotas}
              achadosVisiveis={achados}
              camadas={camadas}
              aoAlternarCamada={alternarCamada}
              selecao={selecao}
              aoSelecionar={selecionar}
              planicidade={medicao?.planicidade.valor}
            />
            <CartaoCavidade
              serial={serial}
              selecao={selecao}
              cotas={cotas}
              aoFechar={() => setSelecao([])}
              aoRemover={(id) => setSelecao((a) => a.filter((x) => x !== id))}
            />
          </div>

          {/* painel de leitura: 380px fixos */}
          <aside className="flex w-[380px] shrink-0 flex-col overflow-auto border-l border-linha bg-aco-800/40">
            <div className="px-4 py-3">
              <h2 className="rotulo">Painel de leitura</h2>
              <p className="mt-2 text-xs text-texto-2">
                A varredura, o veredito, os achados e o bloco de decisão entram no Prompt 5.
                As camadas da bancada já leem as cotas desta medição.
              </p>
            </div>
            <div className="mt-auto border-t border-linha px-4 py-3">
              <Legenda />
            </div>
          </aside>
        </div>
      </div>
    </Casca>
  )
}
