import { Construction } from 'lucide-react'

/**
 * Marcador de tela ainda não construída. Existe para que nenhuma rota fique
 * em branco sem instrução do que fazer, mesmo entre um passo e outro.
 */
export function Marcador({ nome, prompt }: { nome: string; prompt: string }) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-md border border-linha bg-aco-800 p-5">
        <div className="flex items-center gap-2 text-atencao">
          <Construction size={16} aria-hidden />
          <h2 className="text-sm font-semibold">{nome}</h2>
        </div>
        <p className="mt-2 text-xs text-texto-2">
          Tela ainda não construída. Ela entra no {prompt} de{' '}
          <span className="mono text-texto">docs/PROMPTS.md</span>.
        </p>
      </div>
    </div>
  )
}
