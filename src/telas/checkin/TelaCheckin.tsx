import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, QrCode, ScanLine } from 'lucide-react'
import { Casca } from '../../casca/Casca'
import { Botao } from '../../componentes/Botao'
import { BotaoReiniciar } from '../../componentes/BotaoReiniciar'
import { ChipFase } from '../../componentes/ChipFase'
import { Fio } from '../../componentes/Fio'
import { TituloTela } from '../../componentes/TituloTela'
import { dataHora, hora } from '../../dados/formato'
import { formatos, itemPorSerial, ops, SERIAL_HEROI } from '../../dados/seletores'
import { useApp } from '../../estado/contexto'

/**
 * Check-in / check-out — a rastreabilidade nasce aqui.
 *
 * Não é um aplicativo responsivo: é uma moldura de celular dentro da tela de
 * desktop, para contar a história do operador. O evento concluído entra em
 * movimentações no contexto e aparece na hora na ficha do item e na fila do
 * Guardião — é esse encadeamento que faz a demonstração parecer um sistema.
 */
type Passo = 1 | 2 | 3 | 4
type Sentido = 'saida' | 'retorno'

const MOTIVOS = ['fim de campanha', 'troca de formato', 'troca em produção'] as const
const OPERADORES = ['Operador · turno A', 'Operador · turno B', 'Operador · turno C']

export function TelaCheckin() {
  const { despachar, estado } = useApp()
  const [passo, setPasso] = useState<Passo>(1)
  const [serial, setSerial] = useState<string | null>(null)
  const [sentido, setSentido] = useState<Sentido>('saida')
  const [motivo, setMotivo] = useState<string>('')
  const [operador, setOperador] = useState(OPERADORES[0])
  const [registrado, setRegistrado] = useState<{ hora: string; tipo: string } | null>(null)

  const item = serial ? itemPorSerial(serial) : undefined
  const op = useMemo(() => ops.find((o) => o.formato === item?.formato) ?? ops[0], [item])
  const produto = formatos.find((f) => f.codigo === item?.formato)?.produto ?? '—'

  // troca em produção exige motivo: é o poka-yoke que alimenta a curva de desgaste
  const motivoObrigatorio = sentido === 'retorno'
  const podeConcluir = !motivoObrigatorio || motivo !== ''

  function concluir() {
    if (!item || !podeConcluir) return
    const agora = new Date().toISOString()
    despachar({
      tipo: 'registrarMovimentacao',
      movimentacao: {
        itemSerial: item.serial,
        tipo: sentido === 'saida' ? 'check-out' : 'check-in',
        data: agora,
        op: op.op,
        maquina: item.maquina,
        produto,
        operador,
        motivo: motivo || null,
      },
    })
    setRegistrado({ hora: agora, tipo: sentido === 'saida' ? 'Check-out' : 'Check-in' })
    setPasso(4)
  }

  function recomecar() {
    setPasso(1)
    setSerial(null)
    setSentido('saida')
    setMotivo('')
    setRegistrado(null)
  }

  return (
    <Casca>
      <div className="flex h-full flex-col">
        <TituloTela titulo="Check-in / check-out" acessorio={<BotaoReiniciar />} />

        <div className="flex min-h-0 flex-1 items-center justify-center gap-10 overflow-auto bg-aco-900 p-8">
          {/* moldura de celular */}
          <div className="shrink-0">
            <div className="flex h-[844px] w-[390px] flex-col overflow-hidden rounded-[28px] border-[6px] border-aco-700 bg-aco-800">
              {/* barra de status do aparelho */}
              <div className="flex shrink-0 items-center justify-between bg-aco-900 px-5 py-2 text-2xs text-texto-2">
                <span className="mono">{hora(new Date().toISOString())}</span>
                <span className="mono">FerraMon · separação</span>
              </div>
              <Fio />

              <div className="flex min-h-0 flex-1 flex-col">
                {/* cabeçalho do passo */}
                <div className="flex shrink-0 items-center gap-2 px-4 py-3">
                  {passo > 1 && passo < 4 && (
                    <button
                      type="button"
                      onClick={() => setPasso((p) => (p - 1) as Passo)}
                      aria-label="Voltar um passo"
                      className="text-texto-2 hover:text-texto"
                    >
                      <ArrowLeft size={16} aria-hidden />
                    </button>
                  )}
                  <span className="mono text-2xs text-texto-2">Passo {passo} de 4</span>
                  <div className="ml-auto flex gap-1">
                    {[1, 2, 3, 4].map((n) => (
                      <span
                        key={n}
                        aria-hidden
                        className={`h-1 w-6 ${n <= passo ? 'bg-sinal' : 'bg-linha'}`}
                      />
                    ))}
                  </div>
                </div>
                <Fio />

                <div className="min-h-0 flex-1 overflow-auto p-4">
                  {/* 1. ler a etiqueta */}
                  {passo === 1 && (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="flex h-40 w-40 items-center justify-center border border-dashed border-linha">
                        <QrCode size={64} className="text-texto-2" aria-hidden />
                      </div>
                      <h2 className="mt-4 text-sm font-semibold text-texto">
                        Ler o DataMatrix da peça
                      </h2>
                      <p className="mt-1 text-2xs text-texto-2">
                        Aponte a câmera para a etiqueta gravada no corpo da ferramenta.
                      </p>
                      <Botao
                        variante="primario"
                        className="mt-5"
                        onClick={() => {
                          setSerial(SERIAL_HEROI)
                          setPasso(2)
                        }}
                      >
                        <ScanLine size={13} aria-hidden />
                        Ler etiqueta
                      </Botao>
                      <p className="mt-2 text-2xs italic text-texto-2/70">
                        leitura simulada — preenche {SERIAL_HEROI}
                      </p>
                    </div>
                  )}

                  {/* 2. confirmar item, kit, OP e máquina */}
                  {passo === 2 && item && (
                    <div>
                      <h2 className="rotulo">Confirme o que vai sair</h2>
                      <div className="mt-2 border border-linha">
                        {(
                          [
                            ['Item serial', item.serial],
                            ['Família', item.familiaLabel],
                            ['Kit', item.kit ?? '—'],
                            ['Formato', `${item.formato ?? '—'} · ${produto}`],
                            ['Máquina', item.maquina],
                            ['Posição', item.posicao],
                            ['OP', op.op],
                            ['Reserva SAP', item.reservaSap ?? 'sem reserva'],
                          ] as [string, string][]
                        ).map(([rot, valor], i) => (
                          <div key={rot}>
                            {i > 0 && <Fio />}
                            <div className="flex items-baseline justify-between gap-2 px-3 py-1.5">
                              <span className="text-2xs text-texto-2">{rot}</span>
                              <span className="mono text-xs text-texto">{valor}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <label htmlFor="operador" className="rotulo mt-4 block">
                        Operador
                      </label>
                      <select
                        id="operador"
                        value={operador}
                        onChange={(e) => setOperador(e.target.value)}
                        className="mt-1 w-full rounded-controle border border-linha bg-aco-900 px-2 py-2 text-xs text-texto"
                      >
                        {OPERADORES.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>

                      <Botao variante="primario" className="mt-5 w-full" onClick={() => setPasso(3)}>
                        Confirmar
                      </Botao>
                    </div>
                  )}

                  {/* 3. saída ou retorno */}
                  {passo === 3 && item && (
                    <div>
                      <h2 className="rotulo">O que está acontecendo</h2>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {(
                          [
                            ['saida', 'Saída', 'a peça vai para a máquina'],
                            ['retorno', 'Retorno', 'a peça volta da máquina'],
                          ] as [Sentido, string, string][]
                        ).map(([id, rot, sub]) => (
                          <button
                            key={id}
                            type="button"
                            aria-pressed={sentido === id}
                            onClick={() => {
                              setSentido(id)
                              if (id === 'saida') setMotivo('')
                            }}
                            className={`rounded-controle border px-2 py-3 text-left transition-colors ${
                              sentido === id
                                ? 'border-sinal bg-sinal/15 text-sinal'
                                : 'border-linha bg-aco-900 text-texto-2'
                            }`}
                          >
                            <span className="block text-xs font-semibold">{rot}</span>
                            <span className="mt-0.5 block text-2xs opacity-80">{sub}</span>
                          </button>
                        ))}
                      </div>

                      {motivoObrigatorio && (
                        <div className="mt-4">
                          <label htmlFor="motivo" className="rotulo block">
                            Motivo do retorno <span className="text-condenar">obrigatório</span>
                          </label>
                          <div className="mt-1.5 space-y-1.5">
                            {MOTIVOS.map((m) => (
                              <button
                                key={m}
                                type="button"
                                aria-pressed={motivo === m}
                                onClick={() => setMotivo(m)}
                                className={`w-full rounded-controle border px-2 py-2 text-left text-xs transition-colors ${
                                  motivo === m
                                    ? 'border-sinal bg-sinal/15 text-sinal'
                                    : 'border-linha bg-aco-900 text-texto-2'
                                }`}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                          {motivo === 'troca em produção' && (
                            <p className="mt-2 border-l-2 border-l-atencao pl-2 text-2xs text-atencao">
                              Troca em produção sem motivo registrado abre desvio no Guardião. Com
                              o motivo, a causa entra na curva de desgaste da família.
                            </p>
                          )}
                          {motivo === '' && (
                            <p className="mt-2 text-2xs text-texto-2">
                              Sem o motivo, o retorno não é aceito. É o poka-yoke.
                            </p>
                          )}
                        </div>
                      )}

                      <Botao
                        variante="primario"
                        className="mt-5 w-full"
                        disabled={!podeConcluir}
                        onClick={concluir}
                      >
                        Registrar {sentido === 'saida' ? 'saída' : 'retorno'}
                      </Botao>
                    </div>
                  )}

                  {/* 4. confirmação */}
                  {passo === 4 && item && registrado && (
                    <div className="flex h-full flex-col">
                      <div className="flex flex-col items-center pt-6 text-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-tolerancia text-tolerancia">
                          <Check size={26} aria-hidden />
                        </span>
                        <h2 className="mt-3 text-sm font-semibold text-texto">
                          {registrado.tipo} registrado
                        </h2>
                        <p className="mono mt-1 text-2xs text-texto-2">
                          {dataHora(registrado.hora)}
                        </p>
                      </div>

                      <div className="mt-5 border border-linha">
                        {(
                          [
                            ['Item', item.serial],
                            ['OP', op.op],
                            ['Máquina', item.maquina],
                            ['Operador', operador],
                            ['Motivo', motivo || '—'],
                          ] as [string, string][]
                        ).map(([rot, valor], i) => (
                          <div key={rot}>
                            {i > 0 && <Fio />}
                            <div className="flex items-baseline justify-between gap-2 px-3 py-1.5">
                              <span className="text-2xs text-texto-2">{rot}</span>
                              <span className="mono text-xs text-texto">{valor}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <p className="mt-4 text-2xs text-texto-2">
                        O evento já está na ficha do item e na base do Guardião.
                      </p>
                      <div className="mt-2 flex flex-col gap-2">
                        <Link
                          to={`/guardiao/item/${item.serial}`}
                          className="rounded-controle border border-linha bg-aco-700 px-2 py-2 text-center text-xs font-semibold text-texto hover:border-sinal/60"
                        >
                          Ver a ficha de {item.serial}
                        </Link>
                        <Botao onClick={recomecar}>Nova leitura</Botao>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* legenda do poka-yoke */}
          <div className="max-w-sm">
            <ChipFase fase="Fase 1" degrau={1} />
            <h2 className="mt-3 text-base font-semibold text-texto">
              A rastreabilidade nasce no celular do operador
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-texto-2">
              Sem check-in do kit, o pré-setup não é liberado pelo procedimento. É o que faz a
              adesão acontecer — e é o que faz o contador de ciclos existir.
            </p>
            <div className="mt-4 h-px w-full bg-linha" />
            <ul className="mt-4 space-y-2.5 text-xs text-texto-2">
              <li>
                <span className="mono mr-2 text-sinal">01</span>
                O DataMatrix dá <span className="text-texto">identidade</span> à peça. É o degrau 1
                da escada: sem código unívoco, não há nada a medir.
              </li>
              <li>
                <span className="mono mr-2 text-sinal">02</span>
                Item, kit, OP e máquina juntos dão{' '}
                <span className="text-texto">rastreabilidade</span>. É daqui que sai o contador de
                ciclos, por OP × bolhas por golpe.
              </li>
              <li>
                <span className="mono mr-2 text-sinal">03</span>
                O motivo obrigatório no retorno é o que separa desgaste normal de{' '}
                <span className="text-texto">troca em produção</span>. Sem ele, a causa não entra
                na curva.
              </li>
              <li>
                <span className="mono mr-2 text-sinal">04</span>
                Sem ciclos não existe trade-off nem predição. Toda a Fase 3 depende deste passo.
              </li>
            </ul>

            {estado.movimentacoesSessao.length > 0 && (
              <div className="mt-5 border border-linha bg-aco-800 p-3">
                <h3 className="rotulo">Registrado nesta sessão</h3>
                <ul className="mt-1.5 space-y-1">
                  {estado.movimentacoesSessao
                    .slice()
                    .reverse()
                    .map((m) => (
                      <li key={m.id} className="flex items-baseline justify-between gap-2">
                        <span className="mono text-2xs text-sinal">{m.itemSerial}</span>
                        <span className="text-2xs text-texto-2">{m.tipo}</span>
                        <span className="mono text-2xs text-texto-2">{dataHora(m.data)}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </Casca>
  )
}
