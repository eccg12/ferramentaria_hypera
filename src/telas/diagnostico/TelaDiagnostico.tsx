import { Lock } from 'lucide-react'
import { Casca } from '../../casca/Casca'
import { BotaoReiniciar } from '../../componentes/BotaoReiniciar'
import { TituloTela } from '../../componentes/TituloTela'
import { agentePorId, geometria } from '../../dados/seletores'

/**
 * Diagnóstico de Máquina — próxima onda.
 *
 * Tela acessível, conteúdo esmaecido, selo de próxima onda. Explica o conceito
 * e mostra um esquema.
 *
 * Sem dado sintético: aqui não inventamos nada, porque é a próxima venda. O
 * esquema é um desenho de conceito, declarado como tal, e a peça está vazia —
 * nenhuma medição, nenhum score, nenhum valor.
 */
export function TelaDiagnostico() {
  const agente = agentePorId('diagnostico')
  const { larguraPx: W, alturaPx: H } = geometria

  return (
    <Casca agenteId="diagnostico">
      <div className="flex h-full flex-col">
        <TituloTela
          agenteId="diagnostico"
          acessorio={
            <>
              <span className="inline-flex items-center gap-1.5 rounded-controle border border-atencao/50 bg-atencao/10 px-2 py-1 text-2xs font-semibold uppercase tracking-[0.08em] text-atencao">
                <Lock size={11} aria-hidden />
                Próxima onda
              </span>
              <BotaoReiniciar />
            </>
          }
        />

        <div className="min-h-0 flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-[1100px] opacity-60">
            <h2 className="text-lg font-semibold text-texto">
              A ferramenta mede a máquina que a usa
            </h2>

            <div className="mt-4 space-y-3 text-sm leading-relaxed text-texto-2">
              <p>
                Uma ferramenta que se desgasta por igual está dizendo que a máquina está alinhada.
                Uma que se desgasta de um lado só está dizendo outra coisa.
              </p>
              <p>
                O desgaste assimétrico medido na ferramenta é sinal de empeno do porta-ferramenta,
                de desalinhamento do prato ou de folga no fechamento — problemas do equipamento,
                que hoje só aparecem quando a peça produzida sai errada.
              </p>
              <p>
                É o que liga a ferramentaria à manutenção de ativos: a mesma medição que dispõe a
                peça passa a abrir ordem de manutenção na máquina certa, antes da parada.
              </p>
            </div>

            {/* esquema do conceito — desenho, não medição */}
            <figure className="mt-6 border border-linha bg-aco-800 p-5">
              <svg
                viewBox={`0 0 ${W} ${H * 0.62}`}
                className="h-auto w-full"
                role="img"
                aria-label="Esquema: desgaste assimétrico na ferramenta apontando desalinhamento da máquina"
              >
                {/* contorno da peça, sem foto e sem cotas */}
                <rect
                  x={40}
                  y={40}
                  width={W - 80}
                  height={H * 0.62 - 80}
                  fill="none"
                  stroke="var(--linha)"
                  strokeWidth={3}
                />

                {/* gradiente de desgaste crescendo para um lado — conceito */}
                <defs>
                  <linearGradient id="assimetria" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--tolerancia)" stopOpacity="0.10" />
                    <stop offset="55%" stopColor="var(--atencao)" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="var(--condenar)" stopOpacity="0.30" />
                  </linearGradient>
                </defs>
                <rect
                  x={40}
                  y={40}
                  width={W - 80}
                  height={H * 0.62 - 80}
                  fill="url(#assimetria)"
                />

                {/* eixo de referência */}
                <line
                  x1={W / 2}
                  x2={W / 2}
                  y1={20}
                  y2={H * 0.62 - 20}
                  stroke="var(--dimensional)"
                  strokeDasharray="10 8"
                  strokeWidth={2}
                />
                <text
                  x={W / 2 + 14}
                  y={36}
                  fontSize={26}
                  fontFamily="IBM Plex Mono, monospace"
                  fill="var(--dimensional)"
                >
                  eixo da máquina
                </text>

                {/* seta do gradiente de desgaste */}
                <line
                  x1={120}
                  x2={W - 140}
                  y1={H * 0.62 - 110}
                  y2={H * 0.62 - 110}
                  stroke="var(--texto-2)"
                  strokeWidth={3}
                />
                <polygon
                  points={`${W - 140},${H * 0.62 - 110} ${W - 175},${H * 0.62 - 128} ${W - 175},${H * 0.62 - 92}`}
                  fill="var(--texto-2)"
                />
                <text
                  x={120}
                  y={H * 0.62 - 128}
                  fontSize={26}
                  fontFamily="IBM Plex Mono, monospace"
                  fill="var(--texto-2)"
                >
                  desgaste crescente no sentido do desalinhamento
                </text>

                <text
                  x={40}
                  y={H * 0.62 - 26}
                  fontSize={24}
                  fontFamily="IBM Plex Mono, monospace"
                  fill="var(--texto-2)"
                  opacity={0.8}
                >
                  esquema de conceito — sem medição, sem dado
                </text>
              </svg>
              <figcaption className="mt-3 text-2xs text-texto-2">
                Desenho conceitual. Esta tela não traz medição, score nem valor: a mecânica só
                existe depois de uma base de desgaste por posição, e isso é entregável da próxima
                onda.
              </figcaption>
            </figure>

            <div className="mt-5 grid gap-px bg-linha md:grid-cols-3">
              {[
                {
                  t: 'O que já existe hoje',
                  d: 'A medição por cavidade e por posição no kit, entregue na Fase 2. É a matéria-prima.',
                },
                {
                  t: 'O que falta',
                  d: 'Base de desgaste por posição ao longo de campanhas, para separar assimetria de máquina de variação de peça.',
                },
                {
                  t: 'Onde conecta',
                  d: 'Manutenção de ativos: a ordem nasce da ferramenta, não da parada da linha.',
                },
              ].map((c) => (
                <div key={c.t} className="bg-aco-800 p-3">
                  <h3 className="rotulo">{c.t}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-texto-2">{c.d}</p>
                </div>
              ))}
            </div>

            {agente && (
              <p className="mt-4 text-2xs text-texto-2">
                Agente {String(agente.numero).padStart(2, '0')} · {agente.fase} ·{' '}
                {agente.stack.join(' · ')} — nomes a confirmar com o time Google Cloud.
              </p>
            )}
          </div>
        </div>
      </div>
    </Casca>
  )
}
