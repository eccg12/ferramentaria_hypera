import type { ReactNode } from 'react'
import { Fio } from './Fio'

/**
 * Coluna contínua de blocos separados por fio, sem gaps de cartão.
 * Cada bloco tem um rótulo e, quando o número é derivado, um chip de fase.
 */
export function PainelLeitura({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`flex flex-col ${className}`}>{children}</div>
}

interface PropsBloco {
  titulo?: string
  /** Vai à direita do título: normalmente um ChipFase. */
  acessorio?: ReactNode
  children: ReactNode
  /** Bloco ainda não revelado pela varredura. */
  oculto?: boolean
  semFio?: boolean
  className?: string
  /** Âncora, para o roteiro guiado poder rolar até um bloco específico. */
  id?: string
}

export function BlocoLeitura({
  titulo,
  acessorio,
  children,
  oculto = false,
  semFio = false,
  className = '',
  id,
}: PropsBloco) {
  if (oculto) return null
  return (
    <>
      {!semFio && <Fio />}
      <section id={id} className={`px-4 py-3 ${className}`}>
        {(titulo || acessorio) && (
          <header className="mb-2 flex items-center justify-between gap-2">
            {titulo && <h3 className="rotulo">{titulo}</h3>}
            {acessorio}
          </header>
        )}
        {children}
      </section>
    </>
  )
}

/** Par rótulo/valor alinhado, o formato de linha de laudo. */
export function LinhaDado({
  rotulo,
  children,
  className = '',
}: {
  rotulo: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`flex items-baseline justify-between gap-3 py-0.5 ${className}`}>
      <span className="text-xs text-texto-2">{rotulo}</span>
      <span className="text-right text-xs">{children}</span>
    </div>
  )
}
