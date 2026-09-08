import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRightLeft,
  Coins,
  Fingerprint,
  Gauge,
  Ruler,
  ScanEye,
  Siren,
} from 'lucide-react'
import { Casca } from '../../casca/Casca'
import { BarraVida } from '../../componentes/BarraVida'
import { Botao } from '../../componentes/Botao'
import { BotaoReiniciar } from '../../componentes/BotaoReiniciar'
import { ChipFase } from '../../componentes/ChipFase'
import { COR_STATUS } from '../../componentes/Cota'
import { Fio } from '../../componentes/Fio'
import { SeloVeredito } from '../../componentes/SeloVeredito'
import { TituloTela } from '../../componentes/TituloTela'
import { brl, cota as fCota, data, dataHora, num, pct, rotulo } from '../../dados/formato'
import {
  desviosDoItem,
  formatos,
  itemPorSerial,
  medicoesDoItem,
  ultimaMedicao,
} from '../../dados/seletores'
import { useApp } from '../../estado/contexto'

/**
 * Ficha do item serial — o modelo de dados mínimo, em seis blocos:
 * Identidade · Movimentação · Uso · Condição · Eventos · Economia.
 *
 * Abaixo, a linha do tempo unificada: movimentações, medições e desvios em
 * ordem cronológica, incluindo o que foi registrado nesta sessão.
 */
export function FichaItem() {
  const { serial = '' } = useParams()
  const navegar = useNavigate()
  const { movimentacoesDe, decisaoDoItem } = useApp()

  const item = itemPorSerial(serial)

  if (!item) {
    return (
      <Casca agenteId="guardiao">
        <TituloTela agenteId="guardiao" titulo="Ficha do item" acessorio={<BotaoReiniciar />} />
        <div className="p-6">
          <p className="text-xs text-texto-2">
            O item <span className="mono text-texto">{serial}</span> não está na base serializada.
          </p>
          <Botao className="mt-3" onClick={() => navegar('/guardiao')}>
            <ArrowLeft size={13} aria-hidden />
            Voltar à base
          </Botao>
        </div>
      </Casca>
    )
  }

  const movimentacoes = movimentacoesDe(serial)
  const medicoes = medicoesDoItem(serial)
  const desvios = desviosDoItem(serial)
  const medicao = ultimaMedicao(serial)
  const decisao = decisaoDoItem(serial)
  const formato = formatos.find((f) => f.codigo === item.formato)

  const anosDeUso =
    (Date.now() - new Date(item.aquisicao.data).getTime()) / (365.25 * 24 * 3600 * 1000)
  const depreciacaoAnual = item.aquisicao.valor / item.aquisicao.vidaContabilAnos
  const custoPorMilGolpes = item.ciclos ? (item.aquisicao.valor / item.ciclos) * 1000 : 0

  /** Movimentações, medições e desvios numa linha só, do mais recente ao mais antigo. */
  const linhaDoTempo = [
    ...movimentacoes.map((m) => ({
      chave: m.id,
      data: m.data,
      tipo: m.tipo === 'check-out' ? ('saida' as const) : ('retorno' as const),
      titulo: m.tipo === 'check-out' ? 'Check-out para a máquina' : 'Check-in de retorno',
      detalhe: `${m.maquina} · ${m.produto} · ${m.op}`,
      rodape: m.motivo ? `${m.operador} · motivo: ${m.motivo}` : m.operador,
      sessao: m.id.startsWith('MOV-S'),
    })),
    ...medicoes.map((m) => ({
      chave: m.id,
      data: m.data,
      tipo: 'medicao' as const,
      titulo: `Medição no rig ${m.rig}`,
      detalhe: `serrilha ${pct(m.serrilha.perdaAlturaPico)} · planicidade ${fCota(
        m.planicidade.valor,
      )} mm · ${num(m.ciclosNaMedicao)} golpes`,
      rodape: m.decisaoHumana
        ? `${m.decisaoHumana.usuario}: “${m.decisaoHumana.observacao}”`
        : 'sem disposição registrada',
      sessao: false,
    })),
    ...desvios.map((d) => ({
      chave: d.id,
      data: d.abertoEm,
      tipo: 'desvio' as const,
      titulo: d.rotulo,
      detalhe: d.detalhe,
      rodape: `${d.responsavel} · severidade ${d.severidade}`,
      sessao: false,
    })),
  ].sort((a, b) => b.data.localeCompare(a.data))

  const ICONE = {
    saida: ArrowRightLeft,
    retorno: ArrowRightLeft,
    medicao: Ruler,
    desvio: Siren,
  }
  const COR = {
    saida: 'text-texto-2',
    retorno: 'text-texto-2',
    medicao: 'text-dimensional',
    desvio: 'text-atencao',
  }

  return (
    <Casca agenteId="guardiao">
      <div className="flex h-full flex-col">
        <TituloTela
          agenteId="guardiao"
          titulo={`Ficha · ${item.serial}`}
          acessorio={
            <>
              <ChipFase fase="Fase 1" degrau={1} />
              {item.destaque && (
                <Link
                  to={`/visao?item=${item.serial}`}
                  className="inline-flex items-center gap-1.5 rounded-controle border border-sinal bg-sinal/15 px-2.5 py-1.5 text-xs font-semibold text-sinal hover:bg-sinal/25"
                >
                  <ScanEye size={13} aria-hidden />
                  Abrir na bancada de visão
                </Link>
              )}
              <Botao onClick={() => navegar('/guardiao')}>
                <ArrowLeft size={13} aria-hidden />
                Base
              </Botao>
              <BotaoReiniciar />
            </>
          }
        />

        <div className="min-h-0 flex-1 overflow-auto p-4">
          <div className="mx-auto max-w-[1400px]">
            {/* os seis blocos do modelo de dados mínimo */}
            <div className="grid gap-px bg-linha md:grid-cols-2 xl:grid-cols-3">
              <Bloco titulo="Identidade" Icone={Fingerprint}>
                <Linha rotulo="Item serial">
                  <span className="mono text-sinal">{item.serial}</span>
                </Linha>
                <Linha rotulo="Família">{item.familiaLabel}</Linha>
                <Linha rotulo="Área / sub-área">
                  {rotulo(item.area)}
                  {item.subarea ? ` · ${rotulo(item.subarea)}` : ''}
                </Linha>
                <Linha rotulo="Planta / galpão">
                  <span className="mono">
                    {item.site} / {item.galpao}
                  </span>
                </Linha>
                <Linha rotulo="Fornecedor">{item.fornecedor}</Linha>
                <Linha rotulo="Formato">
                  <span className="mono">{item.formato ?? '—'}</span>
                  {formato && <span className="ml-1 text-texto-2">{formato.produto}</span>}
                </Linha>
              </Bloco>

              <Bloco titulo="Movimentação" Icone={ArrowRightLeft}>
                <Linha rotulo="Local atual">{rotulo(item.local)}</Linha>
                <Linha rotulo="Máquina">
                  <span className="mono">{item.maquina}</span>
                </Linha>
                <Linha rotulo="Posição no kit">
                  <span className="mono">{item.posicao}</span>
                </Linha>
                <Linha rotulo="Kit">
                  <span className="mono">{item.kit ?? '—'}</span>
                </Linha>
                <Linha rotulo="Reserva SAP">
                  <span className="mono">{item.reservaSap ?? 'sem reserva'}</span>
                </Linha>
                <Linha rotulo="Movimentações">
                  <span className="mono">{movimentacoes.length}</span>
                </Linha>
              </Bloco>

              <Bloco titulo="Uso" Icone={Gauge} chip={<ChipFase fase="Fase 1" degrau={2} />}>
                <Linha rotulo="Ciclos acumulados">
                  <span className="mono">{num(item.ciclos)}</span>
                </Linha>
                <Linha rotulo="Limite da família">
                  <span className="mono">{num(item.limiteCiclos)}</span>
                </Linha>
                <div className="py-1.5">
                  <BarraVida item={item} comRotulo />
                </div>
                <Linha rotulo="Bolhas por golpe">
                  <span className="mono">{formato?.bolhasPorGolpe ?? '—'}</span>
                </Linha>
                <p className="mt-1 text-2xs italic text-texto-2">
                  ciclos derivados de OP × bolhas por golpe (SAP PP)
                </p>
              </Bloco>

              <Bloco
                titulo="Condição"
                Icone={Ruler}
                chip={medicao ? <ChipFase fase="Fase 2" degrau={3} /> : undefined}
              >
                <div className="flex items-center gap-2 py-1">
                  <SeloVeredito estado={item.estado} tamanho="g" />
                </div>
                {medicao ? (
                  <>
                    <Linha rotulo="Última medição">
                      <span className="mono">{data(medicao.data)}</span>
                    </Linha>
                    <Linha rotulo="Serrilha">
                      <span className={`mono ${COR_STATUS[medicao.serrilha.status]}`}>
                        {pct(medicao.serrilha.perdaAlturaPico)}
                      </span>
                      <span className="mono ml-1 text-2xs text-texto-2">
                        limite {pct(medicao.serrilha.limite)}
                      </span>
                    </Linha>
                    <Linha rotulo="Planicidade">
                      <span className={`mono ${COR_STATUS[medicao.planicidade.status]}`}>
                        {fCota(medicao.planicidade.valor)} mm
                      </span>
                    </Linha>
                    <Linha rotulo="Calibração">
                      <span className="mono">{medicao.calibracao.certificado}</span>
                    </Linha>
                  </>
                ) : (
                  <p className="py-1 text-2xs text-texto-2">
                    {item.temMedicao
                      ? 'Medição registrada; as cotas não estão no recorte desta demonstração.'
                      : 'Sem medição de condição. Entra na fila de avaliação do rig EMB-01.'}
                  </p>
                )}
                {decisao && (
                  <p className="mt-1.5 border-l-2 border-l-sinal pl-2 text-2xs text-texto-2">
                    Disposição desta sessão por{' '}
                    <span className="text-texto">{decisao.usuario}</span> em{' '}
                    <span className="mono">{dataHora(decisao.data)}</span>
                  </p>
                )}
              </Bloco>

              <Bloco titulo="Eventos" Icone={Siren}>
                {desvios.length === 0 ? (
                  <p className="py-1 text-2xs text-texto-2">Nenhum desvio aberto para este item.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {desvios.map((d) => (
                      <li key={d.id} className="border-l-2 border-l-atencao pl-2">
                        <p className="text-xs text-texto">{d.rotulo}</p>
                        <p className="text-2xs text-texto-2">
                          {d.aberto ? 'aberto' : 'encerrado'} · {data(d.abertoEm)} ·{' '}
                          {d.responsavel}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </Bloco>

              <Bloco titulo="Economia" Icone={Coins} chip={<ChipFase fase="Fase 3" degrau={2} />}>
                <Linha rotulo="Aquisição">
                  <span className="mono">{brl(item.aquisicao.valor)}</span>
                </Linha>
                <Linha rotulo="Data de compra">
                  <span className="mono">{data(item.aquisicao.data)}</span>
                </Linha>
                <Linha rotulo="Vida contábil">
                  <span className="mono">{item.aquisicao.vidaContabilAnos} anos</span>
                </Linha>
                <Linha rotulo="Depreciação anual">
                  <span className="mono">{brl(depreciacaoAnual)}</span>
                </Linha>
                <Linha rotulo="Em uso há">
                  <span className="mono">{fCota(anosDeUso)} anos</span>
                </Linha>
                <Linha rotulo="Custo por mil golpes">
                  <span className="mono text-dimensional">{brl(custoPorMilGolpes)}</span>
                </Linha>
              </Bloco>
            </div>

            {/* linha do tempo unificada */}
            <div className="mt-4">
              <h2 className="rotulo mb-1.5">
                Linha do tempo · {linhaDoTempo.length} registros
              </h2>
              <div className="border border-linha bg-aco-800">
                {linhaDoTempo.length === 0 && (
                  <p className="px-3 py-4 text-xs text-texto-2">
                    Sem eventos registrados para este item.
                  </p>
                )}
                {linhaDoTempo.map((e, i) => {
                  const Icone = ICONE[e.tipo]
                  return (
                    <div key={e.chave}>
                      {i > 0 && <Fio />}
                      <div className="flex items-start gap-3 px-3 py-2">
                        <Icone size={14} aria-hidden className={`mt-0.5 shrink-0 ${COR[e.tipo]}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-2">
                            <span className="text-xs text-texto">{e.titulo}</span>
                            {e.sessao && (
                              <span className="text-2xs uppercase tracking-[0.06em] text-sinal">
                                nesta sessão
                              </span>
                            )}
                          </div>
                          <p className="mono text-2xs text-texto-2">{e.detalhe}</p>
                          <p className="text-2xs italic text-texto-2/80">{e.rodape}</p>
                        </div>
                        <span className="mono shrink-0 text-2xs text-texto-2">
                          {dataHora(e.data)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Casca>
  )
}

function Bloco({
  titulo,
  Icone,
  chip,
  children,
}: {
  titulo: string
  Icone: typeof Fingerprint
  chip?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="bg-aco-800 p-3">
      <header className="mb-1.5 flex items-center gap-1.5">
        <Icone size={13} className="text-texto-2" aria-hidden />
        <h2 className="rotulo">{titulo}</h2>
        {chip && <span className="ml-auto">{chip}</span>}
      </header>
      {children}
    </section>
  )
}

function Linha({ rotulo: rot, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-0.5">
      <span className="text-2xs text-texto-2">{rot}</span>
      <span className="text-right text-xs">{children}</span>
    </div>
  )
}
