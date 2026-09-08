/**
 * Divisor de 1px em --linha. É a separação padrão do produto: o painel de
 * leitura é uma coluna contínua dividida por fios, como a régua de um
 * instrumento — não uma pilha de cartões com sombra.
 */
export function Fio({ className = '' }: { className?: string }) {
  return <div role="separator" className={`h-px w-full bg-linha ${className}`} />
}

/** Fio vertical, para separar colunas dentro de uma mesma região de dado. */
export function FioVertical({ className = '' }: { className?: string }) {
  return <div role="separator" className={`w-px self-stretch bg-linha ${className}`} />
}
