import type { ReactNode } from 'react'
import { agentePorId, perfilPorId } from '../dados/seletores'
import { useApp } from '../estado/contexto'

/**
 * Cabeçalho da área de trabalho: nome do agente, a linha de contexto do perfil
 * ativo, e espaço para os controles da tela à direita.
 */
export function TituloTela({
  agenteId,
  titulo,
  acessorio,
}: {
  agenteId?: string
  titulo?: string
  acessorio?: ReactNode
}) {
  const { estado } = useApp()
  const agente = agenteId ? agentePorId(agenteId) : undefined
  const perfil = perfilPorId(estado.perfilAtivo)

  return (
    <div className="flex items-start justify-between gap-4 border-b border-linha bg-aco-800/40 px-4 py-2.5">
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          {agente && (
            <span className="mono text-2xs text-texto-2">
              {String(agente.numero).padStart(2, '0')}
            </span>
          )}
          <h1 className="truncate text-sm font-semibold text-texto">
            {titulo ?? agente?.nome ?? 'FerraMon'}
          </h1>
          {agente && <span className="shrink-0 text-2xs text-texto-2">{agente.fase}</span>}
        </div>
        {/* a linha de contexto troca com o perfil ativo */}
        <p className="mt-0.5 truncate text-2xs text-texto-2">{perfil?.descricao}</p>
      </div>
      {acessorio && <div className="flex shrink-0 items-center gap-2">{acessorio}</div>}
    </div>
  )
}
