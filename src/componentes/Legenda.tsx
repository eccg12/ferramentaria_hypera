/**
 * As cinco cores semânticas, igual à legenda da imagem conceito do deck.
 * Cor é dado: estas cinco só aparecem carregando significado de condição.
 */
const CORES = [
  { token: 'bg-condenar', rotulo: 'Fora de condição' },
  { token: 'bg-atencao', rotulo: 'Acompanhar' },
  { token: 'bg-tolerancia', rotulo: 'Dentro da tolerância' },
  { token: 'bg-dimensional', rotulo: 'Medição dimensional' },
  { token: 'bg-identidade', rotulo: 'Identificação do item' },
]

export function Legenda({ className = '' }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-x-4 gap-y-1.5 ${className}`}>
      {CORES.map((c) => (
        <li key={c.rotulo} className="flex items-center gap-1.5">
          <span aria-hidden className={`h-2 w-2 shrink-0 ${c.token}`} />
          <span className="text-2xs uppercase tracking-[0.06em] text-texto-2">{c.rotulo}</span>
        </li>
      ))}
    </ul>
  )
}
