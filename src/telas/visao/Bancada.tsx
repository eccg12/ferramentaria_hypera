import { useEffect, useMemo, useState } from 'react'
import { ImageOff, Maximize2, Minus, Plus } from 'lucide-react'
import { BotaoAlternar } from '../../componentes/Botao'
import { cota as fCota, pct } from '../../dados/formato'
import { caminhoAsset, geometria } from '../../dados/seletores'
import type { Achado, Cota, Medicao, StatusCota } from '../../dados/tipos'
import { gerarMapaDesgaste } from './mapaDesgaste'
import { usarZoom } from './usarZoom'

/*
 * A bancada. É onde a ousadia é gasta: ocupa o maior espaço da tela, sangra
 * até o fio do painel e recebe a única animação orquestrada do produto.
 *
 * As camadas são desenhadas em SVG sobre a foto, em coordenadas normalizadas
 * do seed. O viewBox é o próprio tamanho da imagem, então as marcações ficam
 * coladas na peça em qualquer nível de zoom. Nada é pintado sobre o metal:
 * anotação, contorno, régua e mapa computado são camadas de análise.
 */
export type Camada = 'cavidades' | 'achados' | 'serrilha' | 'mapa' | 'regua'

export const CAMADAS: { id: Camada; rotulo: string }[] = [
  { id: 'cavidades', rotulo: 'Cavidades' },
  { id: 'achados', rotulo: 'Achados' },
  { id: 'serrilha', rotulo: 'Serrilha' },
  { id: 'mapa', rotulo: 'Mapa de desgaste' },
  { id: 'regua', rotulo: 'Régua' },
]

const COR_STATUS: Record<StatusCota, string> = {
  ok: 'var(--tolerancia)',
  atencao: 'var(--atencao)',
  fora: 'var(--condenar)',
}

const COR_SEVERIDADE: Record<string, string> = {
  condenar: 'var(--condenar)',
  atencao: 'var(--atencao)',
  observar: 'var(--texto-2)',
}

const { larguraPx: W, alturaPx: H } = geometria

interface Props {
  medicao?: Medicao
  /** Cavidades já classificadas — durante a varredura, cresce de cima para baixo. */
  cotasVisiveis: Cota[]
  achadosVisiveis: Achado[]
  camadas: Set<Camada>
  aoAlternarCamada: (c: Camada) => void
  /** Cavidades selecionadas por clique; duas mostram a diferença entre elas. */
  selecao: string[]
  aoSelecionar: (id: string) => void
  achadoDestacado?: string | null
  /** Progresso da varredura, 0..1. Acima de 0 desenha a linha que atravessa. */
  varredura?: number | null
  planicidade?: number
  /**
   * Posição da cortina de comparação, 0..1. À esquerda dela fica o ponto zero,
   * à direita a captura atual. Nulo esconde a cortina.
   */
  cortina?: number | null
  /** Cotas do ponto zero, para colorir as cavidades do lado da peça nova. */
  cotasZero?: Cota[]
}

export function Bancada({
  medicao,
  cotasVisiveis,
  achadosVisiveis,
  camadas,
  aoAlternarCamada,
  selecao,
  aoSelecionar,
  achadoDestacado,
  varredura,
  planicidade,
  cortina,
  cotasZero,
}: Props) {
  const { container, vista, arrastando, reenquadrar, aplicarZoom, houveArrasto, manipuladores } =
    usarZoom()
  const [fotoFalhou, setFotoFalhou] = useState(false)

  const porAlvo = useMemo(() => {
    const m = new Map<string, Cota>()
    for (const c of cotasVisiveis) m.set(c.alvo, c)
    return m
  }, [cotasVisiveis])

  const porAlvoZero = useMemo(() => {
    const m = new Map<string, Cota>()
    for (const c of cotasZero ?? []) m.set(c.alvo, c)
    return m
  }, [cotasZero])

  const temCortina = cortina !== null && cortina !== undefined

  const mapa = useMemo(() => {
    if (!camadas.has('mapa') || !medicao) return null
    return gerarMapaDesgaste(geometria.cavidades, medicao.cotas)
  }, [camadas, medicao])

  const alvosDestacados = useMemo(() => {
    const a = achadosVisiveis.find((x) => x.id === achadoDestacado)
    return new Set(a ? a.alvo.split(',').map((s) => s.trim()) : [])
  }, [achadoDestacado, achadosVisiveis])

  useEffect(() => {
    setFotoFalhou(false)
  }, [])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-aco-900">
      {/* controles de camada */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-linha bg-aco-800/60 px-3 py-1.5">
        <span className="rotulo mr-1">Camadas</span>
        {CAMADAS.map((c) => (
          <BotaoAlternar
            key={c.id}
            ativo={camadas.has(c.id)}
            onClick={() => aoAlternarCamada(c.id)}
            title={
              c.id === 'mapa'
                ? 'Camada computada por interpolação das cotas — não é fotografia'
                : undefined
            }
          >
            {c.rotulo}
          </BotaoAlternar>
        ))}

        <div className="ml-auto flex items-center gap-1.5">
          {camadas.has('mapa') && (
            <span className="mr-1 text-2xs italic text-texto-2">
              mapa de desgaste: camada computada por interpolação das cotas, não é fotografia
            </span>
          )}
          <span className="mono w-10 text-right text-2xs text-texto-2">
            {Math.round(vista.escala * 100)}%
          </span>
          <BotaoAlternar ativo={false} onClick={() => aplicarZoom(1 / 1.25)} aria-label="Afastar">
            <Minus size={12} aria-hidden />
          </BotaoAlternar>
          <BotaoAlternar ativo={false} onClick={() => aplicarZoom(1.25)} aria-label="Aproximar">
            <Plus size={12} aria-hidden />
          </BotaoAlternar>
          <BotaoAlternar ativo={false} onClick={reenquadrar}>
            <Maximize2 size={12} aria-hidden />
            Reenquadrar
          </BotaoAlternar>
        </div>
      </div>

      {/* área da peça — sangra até o fio do painel, sem borda arredondada */}
      <div
        ref={container}
        role="application"
        aria-label="Bancada de inspeção da peça"
        tabIndex={0}
        {...manipuladores}
        className={`relative min-h-0 flex-1 select-none overflow-hidden ${
          arrastando ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div
          className="absolute inset-0 flex items-center justify-center p-3"
          style={{
            transform: `translate(${vista.x}px, ${vista.y}px) scale(${vista.escala})`,
            transformOrigin: 'center center',
          }}
        >
          <div className="relative" style={{ aspectRatio: `${W} / ${H}`, maxWidth: '100%', maxHeight: '100%', width: '100%' }}>
            {fotoFalhou ? (
              <ChapaAusente />
            ) : (
              <img
                src={caminhoAsset(geometria.imagem)}
                alt="Placa de selagem FS-0192 sobre o rig de captura"
                draggable={false}
                onError={() => setFotoFalhou(true)}
                className="h-full w-full object-contain"
              />
            )}

            {/* camada computada, sob as anotações */}
            {mapa && (
              <img
                src={mapa}
                alt=""
                aria-hidden
                className="pointer-events-none absolute inset-0 h-full w-full mix-blend-screen"
                style={{ opacity: 0.55 }}
              />
            )}

            <svg
              data-bancada="camadas"
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full overflow-visible"
            >
              {/* serrilhas */}
              {camadas.has('serrilha') &&
                geometria.serrilhas.map((s) => {
                  const critica = medicao?.serrilha.alvo === s.id
                  const foraDeCondicao = critica && medicao?.serrilha.status === 'fora'
                  return (
                    <g key={s.id}>
                      <rect
                        x={(s.cx - s.w / 2) * W}
                        y={(s.cy - s.h / 2) * H}
                        width={s.w * W}
                        height={s.h * H}
                        rx={s.h * H * 0.5}
                        fill="none"
                        stroke={foraDeCondicao ? 'var(--condenar)' : 'var(--dimensional)'}
                        strokeWidth={foraDeCondicao ? 6 : 3}
                        opacity={critica ? 1 : 0.55}
                      />
                      {critica && (
                        <text
                          x={(s.cx + s.w / 2) * W + 12}
                          y={s.cy * H + 6}
                          fontSize={22}
                          fontFamily="IBM Plex Mono, monospace"
                          fill={foraDeCondicao ? 'var(--condenar)' : 'var(--dimensional)'}
                        >
                          {s.id} · {medicao ? pct(medicao.serrilha.perdaAlturaPico) : ''} de perda
                        </text>
                      )}
                    </g>
                  )
                })}

              {/* cavidades */}
              {camadas.has('cavidades') &&
                geometria.cavidades.map((c) => {
                  // à esquerda da cortina vale a peça nova; à direita, a captura atual
                  const doLadoZero = temCortina && c.cx < (cortina as number)
                  const cota = doLadoZero ? porAlvoZero.get(c.id) : porAlvo.get(c.id)
                  if (!cota) return null
                  const selecionada = selecao.includes(c.id)
                  const destacada = alvosDestacados.has(c.id)
                  return (
                    <g
                      key={c.id}
                      data-cavidade={c.id}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        // clique depois de arrastar é navegação, não seleção
                        if (houveArrasto()) return
                        aoSelecionar(c.id)
                      }}
                    >
                      <circle
                        cx={c.cx * W}
                        cy={c.cy * H}
                        r={c.r * W}
                        fill="transparent"
                        stroke={COR_STATUS[cota.status]}
                        strokeWidth={selecionada || destacada ? 8 : 4}
                      />
                      {(selecionada || destacada) && (
                        <circle
                          cx={c.cx * W}
                          cy={c.cy * H}
                          r={c.r * W + 9}
                          fill="none"
                          stroke="var(--sinal)"
                          strokeWidth={2}
                          strokeDasharray="8 6"
                        />
                      )}
                      <text
                        x={(c.cx - c.r) * W}
                        y={(c.cy - c.r) * H - 8}
                        fontSize={26}
                        fontFamily="IBM Plex Mono, monospace"
                        fill="var(--texto)"
                        stroke="var(--aco-900)"
                        strokeWidth={4}
                        paintOrder="stroke"
                      >
                        {c.numero}
                      </text>
                    </g>
                  )
                })}

              {/* achados */}
              {camadas.has('achados') &&
                achadosVisiveis.map((a) => (
                  <AchadoDesenhado
                    key={a.id}
                    achado={a}
                    destacado={achadoDestacado === a.id}
                  />
                ))}

              {/* régua */}
              {camadas.has('regua') && <Regua planicidade={planicidade} />}

              {/* cortina de comparação */}
              {temCortina && (
                <g>
                  <line
                    x1={(cortina as number) * W}
                    x2={(cortina as number) * W}
                    y1={0}
                    y2={H}
                    stroke="var(--sinal)"
                    strokeWidth={4}
                  />
                  <text
                    x={(cortina as number) * W - 14}
                    y={30}
                    textAnchor="end"
                    fontSize={24}
                    fontFamily="IBM Plex Mono, monospace"
                    fill="var(--dimensional)"
                    stroke="var(--aco-900)"
                    strokeWidth={5}
                    paintOrder="stroke"
                  >
                    peça nova
                  </text>
                  <text
                    x={(cortina as number) * W + 14}
                    y={30}
                    fontSize={24}
                    fontFamily="IBM Plex Mono, monospace"
                    fill="var(--atencao)"
                    stroke="var(--aco-900)"
                    strokeWidth={5}
                    paintOrder="stroke"
                  >
                    agora
                  </text>
                </g>
              )}

              {/* a passada da varredura */}
              {varredura !== null && varredura !== undefined && varredura < 1 && (
                <g>
                  <defs>
                    <linearGradient id="rastro" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--sinal)" stopOpacity="0" />
                      <stop offset="100%" stopColor="var(--sinal)" stopOpacity="0.22" />
                    </linearGradient>
                  </defs>
                  <rect x={0} y={Math.max(0, varredura * H - 150)} width={W} height={150} fill="url(#rastro)" />
                  <line
                    x1={0}
                    x2={W}
                    y1={varredura * H}
                    y2={varredura * H}
                    stroke="var(--sinal)"
                    strokeWidth={3}
                  />
                </g>
              )}
            </svg>
          </div>
        </div>

        <p className="pointer-events-none absolute bottom-2 left-3 text-2xs text-texto-2/70">
          roda do mouse aproxima · arraste move · setas e 0 pelo teclado
        </p>
      </div>
    </div>
  )
}

/** Contorno e rótulo de um achado. Polígono quando o seed traz um; senão, o alvo. */
function AchadoDesenhado({ achado, destacado }: { achado: Achado; destacado: boolean }) {
  const cor = COR_SEVERIDADE[achado.severidade] ?? 'var(--texto-2)'
  const largura = destacado ? 7 : 4

  if (achado.poligono?.length) {
    const pontos = achado.poligono.map(([x, y]) => `${x * W},${y * H}`).join(' ')
    const px = Math.min(...achado.poligono.map(([x]) => x))
    const py = Math.min(...achado.poligono.map(([, y]) => y))
    return (
      <g>
        <polygon points={pontos} fill="none" stroke={cor} strokeWidth={largura} />
        <text
          x={px * W}
          y={py * H - 22}
          fontSize={24}
          fontFamily="IBM Plex Mono, monospace"
          fill={cor}
          stroke="var(--aco-900)"
          strokeWidth={5}
          paintOrder="stroke"
        >
          {achado.id} · {fCota(achado.score)}
        </text>
      </g>
    )
  }

  const alvos = achado.alvo.split(',').map((s) => s.trim())
  return (
    <g>
      {alvos.map((idAlvo) => {
        const cav = geometria.cavidades.find((c) => c.id === idAlvo)
        const ser = geometria.serrilhas.find((s) => s.id === idAlvo)
        if (cav) {
          return (
            <g key={idAlvo}>
              <circle
                cx={cav.cx * W}
                cy={cav.cy * H}
                r={cav.r * W + 16}
                fill="none"
                stroke={cor}
                strokeWidth={largura}
                strokeDasharray="14 10"
              />
              <text
                x={cav.cx * W + cav.r * W + 22}
                y={cav.cy * H + 8}
                fontSize={24}
                fontFamily="IBM Plex Mono, monospace"
                fill={cor}
                stroke="var(--aco-900)"
                strokeWidth={5}
                paintOrder="stroke"
              >
                {achado.id} · {fCota(achado.score)}
              </text>
            </g>
          )
        }
        if (ser) {
          return (
            <rect
              key={idAlvo}
              x={(ser.cx - ser.w / 2) * W - 10}
              y={(ser.cy - ser.h / 2) * H - 10}
              width={ser.w * W + 20}
              height={ser.h * H + 20}
              rx={12}
              fill="none"
              stroke={cor}
              strokeWidth={largura}
              strokeDasharray="14 10"
            />
          )
        }
        return null
      })}
    </g>
  )
}

/**
 * Escala de referência e o valor de planicidade.
 * A escala vem de geometria.larguraPecaMm — nenhum número de milímetro nasce
 * dentro deste componente.
 */
function Regua({ planicidade }: { planicidade?: number }) {
  const pxPorMm = W / geometria.larguraPecaMm
  const MM_TOTAL = 50
  const MM_TRACO = 10
  const y = H - 34
  const tracos = MM_TOTAL / MM_TRACO
  return (
    <g>
      <line
        x1={40}
        x2={40 + MM_TOTAL * pxPorMm}
        y1={y}
        y2={y}
        stroke="var(--dimensional)"
        strokeWidth={3}
      />
      {Array.from({ length: tracos + 1 }, (_, i) => (
        <line
          key={i}
          x1={40 + i * MM_TRACO * pxPorMm}
          x2={40 + i * MM_TRACO * pxPorMm}
          y1={y - (i % tracos === 0 ? 14 : 8)}
          y2={y}
          stroke="var(--dimensional)"
          strokeWidth={3}
        />
      ))}
      <text
        x={40}
        y={y - 20}
        fontSize={22}
        fontFamily="IBM Plex Mono, monospace"
        fill="var(--dimensional)"
        stroke="var(--aco-900)"
        strokeWidth={4}
        paintOrder="stroke"
      >
        {MM_TOTAL} mm
      </text>
      {planicidade !== undefined && (
        <text
          x={40 + MM_TOTAL * pxPorMm + 20}
          y={y + 2}
          fontSize={22}
          fontFamily="IBM Plex Mono, monospace"
          fill="var(--dimensional)"
          stroke="var(--aco-900)"
          strokeWidth={4}
          paintOrder="stroke"
        >
          planicidade {fCota(planicidade)} mm
        </text>
      )}
    </g>
  )
}

/**
 * Quando a fotografia não está no repositório. A grade continua desenhada em
 * cima, nas posições reais, para a geometria poder ser conferida — e a tela
 * diz exatamente o que fazer. Nenhuma imagem sintética entra no lugar da foto.
 */
function ChapaAusente() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center border border-dashed border-linha bg-aco-800">
      <ImageOff size={26} className="text-texto-2" aria-hidden />
      <p className="mt-2 text-xs font-semibold text-texto">Fotografia da placa ausente</p>
      <p className="mt-1 max-w-md px-6 text-center text-2xs leading-relaxed text-texto-2">
        Coloque o arquivo <span className="mono text-texto">placa-FS-0192.jpg</span> (2000×1132) em{' '}
        <span className="mono text-texto">public/assets/</span> e recarregue. A grade abaixo já está
        nas coordenadas do seed e não precisa de ajuste.
      </p>
    </div>
  )
}
