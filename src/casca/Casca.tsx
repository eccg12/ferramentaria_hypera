import type { ReactNode } from 'react'
import { Cabecalho } from './Cabecalho'
import { Trilho } from './Trilho'
import { RodapeTecnico } from './RodapeTecnico'

/**
 * A casca da aplicação: cabeçalho, trilho, área de trabalho e rodapé técnico.
 * A área de trabalho é a única região que rola; a casca fica fixa para a tela
 * inteira virar captura legível a 1920×1080.
 */
export function Casca({ agenteId, children }: { agenteId?: string; children: ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-aco-900">
      <Cabecalho />
      <div className="flex min-h-0 flex-1">
        <Trilho />
        <main className="min-w-0 flex-1 overflow-auto">{children}</main>
      </div>
      <RodapeTecnico agenteId={agenteId} />
    </div>
  )
}
