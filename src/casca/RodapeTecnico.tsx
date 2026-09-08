import { agentePorId } from '../dados/seletores'

/**
 * Rodapé técnico de 28px: os produtos Google usados naquela tela, lidos de
 * `agentes[].stack`, seguidos da ressalva. Os nomes aparecem como rodapé
 * técnico, nunca como conexão real — não existe integração neste mockup.
 */
export function RodapeTecnico({ agenteId }: { agenteId?: string }) {
  const agente = agenteId ? agentePorId(agenteId) : undefined

  return (
    <footer className="flex h-[var(--altura-rodape)] shrink-0 items-center gap-2 overflow-hidden border-t border-linha bg-aco-800 px-4">
      {agente ? (
        <>
          <span className="rotulo shrink-0">Nesta tela</span>
          <span className="truncate text-2xs text-texto-2">{agente.stack.join(' · ')}</span>
        </>
      ) : (
        <span className="text-2xs text-texto-2">Sem produto de nuvem nesta tela</span>
      )}
      <span aria-hidden className="ml-auto hidden h-3 w-px shrink-0 bg-linha sm:block" />
      <span className="hidden shrink-0 text-2xs italic text-texto-2/70 sm:inline">
        nomes a confirmar com o time Google Cloud
      </span>
    </footer>
  )
}
