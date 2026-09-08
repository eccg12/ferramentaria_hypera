/**
 * Abas de tela. Sublinhado em --sinal, sem cápsula e sem sombra:
 * a marcação de estado é a linha, como no resto do produto.
 */
export function Abas<T extends string>({
  abas,
  ativa,
  aoTrocar,
  className = '',
}: {
  abas: { id: T; rotulo: string; contagem?: number }[]
  ativa: T
  aoTrocar: (id: T) => void
  className?: string
}) {
  return (
    <div role="tablist" className={`flex items-center gap-1 ${className}`}>
      {abas.map((aba) => (
        <button
          key={aba.id}
          role="tab"
          type="button"
          aria-selected={ativa === aba.id}
          onClick={() => aoTrocar(aba.id)}
          className={[
            'border-b-2 px-2.5 py-1.5 text-xs font-semibold transition-colors',
            ativa === aba.id
              ? 'border-b-sinal text-sinal'
              : 'border-b-transparent text-texto-2 hover:text-texto',
          ].join(' ')}
        >
          {aba.rotulo}
          {aba.contagem !== undefined && (
            <span className="mono ml-1.5 text-2xs opacity-70">{aba.contagem}</span>
          )}
        </button>
      ))}
    </div>
  )
}
