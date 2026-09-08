import { useState } from 'react'
import { AlertOctagon, AlertTriangle, ChevronRight, Info, CheckCircle2, Smartphone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ChipFase } from '../../componentes/ChipFase'
import { Botao } from '../../componentes/Botao'
import { Fio } from '../../componentes/Fio'
import { contadoresDeDesvio, desvios, itemPorSerial } from '../../dados/seletores'
import { dataHora, decorrido, rotulo } from '../../dados/formato'
import type { Desvio, SeveridadeDesvio } from '../../dados/tipos'
import { useApp } from '../../estado/contexto'

/**
 * Fila de desvios — a tela padrão do Guardião.
 *
 * O argumento comercial da Fase 1 está aqui: tudo o que esta tela mostra sai
 * de dados que a Hypera já tem hoje, sem nenhum modelo de IA envolvido.
 */
const ICONE_SEVERIDADE: Record<SeveridadeDesvio, typeof AlertOctagon> = {
  alta: AlertOctagon,
  media: AlertTriangle,
  baixa: Info,
}

const COR_SEVERIDADE: Record<SeveridadeDesvio, string> = {
  alta: 'text-condenar',
  media: 'text-atencao',
  baixa: 'text-texto-2',
}

const ROTULO_SEVERIDADE: Record<SeveridadeDesvio, string> = {
  alta: 'alta',
  media: 'média',
  baixa: 'baixa',
}

const ORDEM: Record<SeveridadeDesvio, number> = { alta: 0, media: 1, baixa: 2 }

export function FilaDesvios() {
  const { estado, despachar, usuarioAtual, tratativaDoDesvio } = useApp()
  const [aberto, setAberto] = useState<string | null>(null)
  const [observacao, setObservacao] = useState('')

  const contadores = contadoresDeDesvio()
  const lista = desvios
    .slice()
    .sort(
      (a, b) =>
        Number(b.aberto) - Number(a.aberto) ||
        ORDEM[a.severidade] - ORDEM[b.severidade] ||
        b.abertoEm.localeCompare(a.abertoEm),
    )

  function tratar(desvio: Desvio) {
    despachar({
      tipo: 'registrarTratativa',
      tratativa: {
        desvioId: desvio.id,
        usuario: usuarioAtual,
        perfilId: estado.perfilAtivo,
        observacao: observacao.trim(),
      },
    })
    setObservacao('')
    setAberto(null)
  }

  return (
    // largura contida: a lista tem 6 linhas e precisa ser lida de longe,
    // não espalhada de ponta a ponta num projetor de 1920.
    <div className="mx-auto max-w-[1280px] p-4">
      {/* Frase de contexto: é o argumento comercial da Fase 1. */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border border-linha bg-aco-800 px-3 py-2">
        <p className="text-xs text-texto">
          Tudo nesta tela usa dados que a Hypera já tem hoje.{' '}
          <span className="text-texto-2">Nenhum modelo de IA envolvido.</span>
        </p>
        <ChipFase fase="Fase 1" degrau={2} />
      </div>

      {/*
        Movimentações que o operador registrou no celular durante esta sessão.
        Aparecem aqui na hora: é o encadeamento entre o check-in e o Guardião.
      */}
      {estado.movimentacoesSessao.length > 0 && (
        <div className="mb-3 border border-sinal/40 bg-sinal/[0.06] px-3 py-2">
          <div className="flex items-center gap-1.5">
            <Smartphone size={13} className="text-sinal" aria-hidden />
            <h2 className="text-2xs uppercase tracking-[0.06em] text-sinal">
              Registrado no check-in agora · {estado.movimentacoesSessao.length}
            </h2>
          </div>
          <ul className="mt-1.5 space-y-0.5">
            {estado.movimentacoesSessao
              .slice()
              .reverse()
              .map((m) => (
                <li key={m.id} className="flex flex-wrap items-baseline gap-x-3 text-2xs">
                  <Link
                    to={`/guardiao/item/${m.itemSerial}`}
                    className="mono text-sinal underline-offset-2 hover:underline"
                  >
                    {m.itemSerial}
                  </Link>
                  <span className="text-texto">{m.tipo}</span>
                  <span className="mono text-texto-2">{m.op}</span>
                  <span className="mono text-texto-2">{m.maquina}</span>
                  <span className="text-texto-2">{m.operador}</span>
                  {m.motivo && <span className="text-atencao">{m.motivo}</span>}
                  <span className="mono ml-auto text-texto-2">{dataHora(m.data)}</span>
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Um contador por tipo de desvio. */}
      <ul className="mb-4 grid grid-cols-2 gap-px bg-linha sm:grid-cols-3 lg:grid-cols-5">
        {contadores.map((c) => (
          <li key={c.tipo} className="bg-aco-800 px-3 py-2.5">
            <div className="flex items-baseline gap-1.5">
              <span
                className={`mono text-2xl font-medium ${c.abertos ? 'text-texto' : 'text-texto-2'}`}
              >
                {c.abertos}
              </span>
              <span className="mono text-2xs text-texto-2">/ {c.total}</span>
            </div>
            <p className="mt-0.5 text-2xs leading-tight text-texto-2">{c.rotulo}</p>
          </li>
        ))}
      </ul>

      <h2 className="rotulo mb-1.5">
        Desvios · {lista.filter((d) => d.aberto).length} abertos de {lista.length}
      </h2>

      <div className="border border-linha bg-aco-800">
        {lista.map((desvio, i) => {
          const Icone = ICONE_SEVERIDADE[desvio.severidade]
          const item = itemPorSerial(desvio.itemSerial)
          const tratativa = tratativaDoDesvio(desvio.id)
          const expandido = aberto === desvio.id
          const resolvido = !desvio.aberto || Boolean(tratativa)

          return (
            <div key={desvio.id}>
              {i > 0 && <Fio />}
              <button
                type="button"
                onClick={() => setAberto(expandido ? null : desvio.id)}
                aria-expanded={expandido}
                className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-aco-700/50"
              >
                <ChevronRight
                  size={14}
                  aria-hidden
                  className={`shrink-0 text-texto-2 transition-transform ${expandido ? 'rotate-90' : ''}`}
                />
                <Icone
                  size={15}
                  aria-hidden
                  className={`shrink-0 ${resolvido ? 'text-texto-2/50' : COR_SEVERIDADE[desvio.severidade]}`}
                />
                <span className={`min-w-0 flex-1 truncate text-xs ${resolvido ? 'text-texto-2' : 'text-texto'}`}>
                  {desvio.rotulo}
                </span>
                <span className="mono hidden w-[76px] shrink-0 text-2xs text-sinal sm:block">
                  {desvio.itemSerial}
                </span>
                <span className="hidden w-[172px] shrink-0 truncate text-2xs text-texto-2 md:block">
                  {item ? `${item.maquina} · ${item.familiaLabel}` : '—'}
                </span>
                <span className="w-16 shrink-0 text-right text-2xs text-texto-2">
                  {decorrido(desvio.abertoEm)}
                </span>
                <span
                  className={`w-14 shrink-0 text-right text-2xs uppercase tracking-[0.06em] ${
                    resolvido ? 'text-texto-2/50' : COR_SEVERIDADE[desvio.severidade]
                  }`}
                >
                  {ROTULO_SEVERIDADE[desvio.severidade]}
                </span>
                {resolvido && (
                  <CheckCircle2 size={13} aria-hidden className="shrink-0 text-tolerancia" />
                )}
              </button>

              {expandido && (
                <div className="border-t border-linha bg-aco-900/60 px-3 py-3 pl-10">
                  <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                    <div>
                      <h3 className="rotulo">Detalhe</h3>
                      <p className="mt-1 text-xs text-texto">{desvio.detalhe}</p>
                      <p className="mt-1.5 text-2xs text-texto-2">
                        Aberto em <span className="mono">{dataHora(desvio.abertoEm)}</span>
                        {desvio.fechadoEm && (
                          <>
                            {' '}
                            · fechado em <span className="mono">{dataHora(desvio.fechadoEm)}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <div>
                      <h3 className="rotulo">Ação recomendada</h3>
                      <p className="mt-1 text-xs text-texto">{desvio.acao}</p>
                      <p className="mt-1.5 text-2xs text-texto-2">
                        Responsável: <span className="text-texto">{desvio.responsavel}</span>
                      </p>
                    </div>
                    <div className="min-w-[220px]">
                      <h3 className="rotulo">Item</h3>
                      <Link
                        to={`/guardiao/item/${desvio.itemSerial}`}
                        className="mono mt-1 inline-block text-xs text-sinal underline-offset-2 hover:underline"
                      >
                        {desvio.itemSerial}
                      </Link>
                      {item && (
                        <p className="mt-0.5 text-2xs text-texto-2">
                          {item.familiaLabel} · {item.maquina} · {rotulo(item.area)}
                          {item.formato ? ` · ${item.formato}` : ''}
                        </p>
                      )}

                      {tratativa ? (
                        <div className="mt-2 border border-linha bg-aco-800 p-2">
                          <p className="text-2xs font-semibold text-tolerancia">Tratado</p>
                          <p className="mt-0.5 text-2xs text-texto-2">
                            {tratativa.usuario} · <span className="mono">{dataHora(tratativa.data)}</span>
                          </p>
                          {tratativa.observacao && (
                            <p className="mt-1 text-2xs italic text-texto-2">“{tratativa.observacao}”</p>
                          )}
                        </div>
                      ) : desvio.aberto ? (
                        <div className="mt-2">
                          <label htmlFor={`obs-${desvio.id}`} className="rotulo">
                            Observação da tratativa
                          </label>
                          <textarea
                            id={`obs-${desvio.id}`}
                            rows={2}
                            value={observacao}
                            onChange={(e) => setObservacao(e.target.value)}
                            placeholder="O que foi feito"
                            className="mt-1 w-full resize-none rounded-controle border border-linha bg-aco-900 px-2 py-1 text-2xs text-texto placeholder:text-texto-2/50"
                          />
                          <div className="mt-1.5 flex items-center justify-between gap-2">
                            <span className="text-2xs text-texto-2">{usuarioAtual}</span>
                            <Botao variante="primario" onClick={() => tratar(desvio)}>
                              Tratar
                            </Botao>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-2 text-2xs text-texto-2">Encerrado antes desta sessão.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
