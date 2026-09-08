import { meta } from './dados/seletores'

/**
 * Fundação. A casca, as rotas e as telas entram nos próximos passos;
 * por enquanto a página mostra só a marca sobre o fundo da bancada.
 */
export function Aplicacao() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-aco-900">
      <h1 className="text-2xl font-bold tracking-tight text-texto">{meta.produto}</h1>
      <p className="mt-1 text-sm text-texto-2">{meta.subtitulo}</p>
      <p className="mt-6 text-2xs uppercase tracking-[0.14em] text-atencao">
        Ambiente demonstrativo · dados fictícios
      </p>
    </div>
  )
}
