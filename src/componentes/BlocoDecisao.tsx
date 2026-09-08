import { useState } from 'react'
import { CheckCircle2, HelpCircle, Wrench, XOctagon } from 'lucide-react'
import { dataHora } from '../dados/formato'
import type { AcaoDecisao } from '../dados/tipos'
import { useApp } from '../estado/contexto'
import { Botao } from './Botao'

/**
 * Bloco de decisão: usuário, ação, hora e observação.
 *
 * Nunca existe aprovação automática neste produto. A recomendação do agente
 * termina aqui, e quem dispõe da peça é uma pessoa, com nome e hora — é o que
 * sustenta o desenho de apoio à decisão. Depois de registrada, o bloco vira
 * histórico e o botão some.
 */
const ACOES: { acao: AcaoDecisao; rotulo: string; Icone: typeof CheckCircle2 }[] = [
  { acao: 'aprovar', rotulo: 'Aprovar para uso', Icone: CheckCircle2 },
  { acao: 'reparo', rotulo: 'Enviar para reparo', Icone: Wrench },
  { acao: 'condenar', rotulo: 'Condenar', Icone: XOctagon },
  { acao: 'segunda_opiniao', rotulo: 'Pedir segunda opinião', Icone: HelpCircle },
]

export const ROTULO_ACAO: Record<AcaoDecisao, string> = {
  aprovar: 'Aprovada para uso',
  reparo: 'Enviada para reparo',
  condenar: 'Condenada',
  segunda_opiniao: 'Segunda opinião solicitada',
}

interface Props {
  itemSerial: string
  medicaoId: string
  /** Recomendação do agente, mostrada acima das ações. Nunca é a decisão. */
  recomendacao?: string
}

export function BlocoDecisao({ itemSerial, medicaoId, recomendacao }: Props) {
  const { estado, despachar, usuarioAtual } = useApp()
  const [escolhida, setEscolhida] = useState<AcaoDecisao | null>(null)
  const [observacao, setObservacao] = useState('')

  const registrada = estado.decisoes.filter((d) => d.itemSerial === itemSerial).at(-1)

  if (registrada) {
    return (
      <div className="border border-linha bg-aco-800/60 p-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold text-texto">{ROTULO_ACAO[registrada.acao]}</span>
          <span className="mono text-2xs text-texto-2">{dataHora(registrada.data)}</span>
        </div>
        <p className="mt-1 text-xs text-texto-2">
          Registrada por <span className="text-texto">{registrada.usuario}</span>
        </p>
        {registrada.observacao && (
          <p className="mt-2 border-l border-linha pl-2 text-xs italic text-texto-2">
            “{registrada.observacao}”
          </p>
        )}
        <p className="mt-2 text-2xs text-texto-2">
          Registro da sessão de demonstração. O botão sai depois da disposição: a trilha é o que
          fica.
        </p>
      </div>
    )
  }

  function registrar() {
    if (!escolhida) return
    despachar({
      tipo: 'registrarDecisao',
      decisao: {
        itemSerial,
        medicaoId,
        acao: escolhida,
        usuario: usuarioAtual,
        perfilId: estado.perfilAtivo,
        observacao: observacao.trim(),
      },
    })
    setEscolhida(null)
    setObservacao('')
  }

  return (
    <div>
      {recomendacao && (
        <p className="mb-2 text-xs text-texto-2">
          <span className="text-texto-2">Recomendação do agente: </span>
          <span className="text-texto">{recomendacao}</span>
        </p>
      )}

      <div className="grid grid-cols-2 gap-1.5">
        {ACOES.map(({ acao, rotulo, Icone }) => (
          <button
            key={acao}
            type="button"
            aria-pressed={escolhida === acao}
            onClick={() => setEscolhida(acao === escolhida ? null : acao)}
            className={[
              'flex items-center gap-1.5 rounded-controle border px-2 py-1.5 text-left text-2xs font-semibold transition-colors',
              escolhida === acao
                ? 'border-sinal bg-sinal/15 text-sinal'
                : 'border-linha bg-aco-800 text-texto-2 hover:text-texto',
            ].join(' ')}
          >
            <Icone size={13} className="shrink-0" aria-hidden />
            {rotulo}
          </button>
        ))}
      </div>

      {escolhida && (
        <div className="mt-2">
          <label htmlFor="obs-decisao" className="rotulo">
            Observação
          </label>
          <textarea
            id="obs-decisao"
            rows={2}
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="O que sustenta a decisão"
            className="mt-1 w-full resize-none rounded-controle border border-linha bg-aco-900 px-2 py-1.5 text-xs text-texto placeholder:text-texto-2/50"
          />
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <span className="text-2xs text-texto-2">
              Assinada por <span className="text-texto">{usuarioAtual}</span>
            </span>
            <Botao variante="primario" onClick={registrar}>
              Registrar decisão
            </Botao>
          </div>
        </div>
      )}
    </div>
  )
}
