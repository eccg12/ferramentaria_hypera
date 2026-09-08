import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { BotaoReiniciar } from '../componentes/BotaoReiniciar'
import { perfilPorId, roteiro } from '../dados/seletores'
import { useApp } from '../estado/contexto'

/**
 * Modo apresentação, para quem vai conduzir a reunião sem ter construído o
 * produto.
 *
 * Cada passo navega para a rota, troca o perfil ativo e, quando a rota traz
 * acao=varrer, a própria tela de visão dispara a varredura. São nove passos,
 * desenhados para 8 a 10 minutos. Não invente passos novos.
 *
 * R entra, setas e espaço andam, Esc sai.
 */
export function BarraRoteiro() {
  const { estado, despachar } = useApp()
  const navegar = useNavigate()
  const local = useLocation()
  const { ativo, passo } = estado.roteiro

  const atual = roteiro[passo - 1]
  const rotaAtual = `${local.pathname}${local.search}`

  // teclado global: R entra no roteiro mesmo fora dele
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      const alvo = e.target as HTMLElement | null
      const digitando =
        alvo?.tagName === 'INPUT' || alvo?.tagName === 'TEXTAREA' || alvo?.tagName === 'SELECT'
      if (digitando) return

      if (!ativo) {
        if (e.key === 'r' || e.key === 'R') {
          e.preventDefault()
          despachar({ tipo: 'roteiroEntrar' })
        }
        return
      }

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault()
        despachar({ tipo: 'roteiroAvancar' })
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        despachar({ tipo: 'roteiroVoltar' })
      } else if (e.key === 'Escape') {
        e.preventDefault()
        despachar({ tipo: 'roteiroSair' })
      }
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [ativo, despachar])

  // cada passo leva à sua rota e troca o perfil
  useEffect(() => {
    if (!ativo || !atual) return
    if (rotaAtual !== atual.rota) navegar(atual.rota)
    if (estado.perfilAtivo !== atual.perfil) {
      despachar({ tipo: 'trocarPerfil', perfilId: atual.perfil })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ativo, passo])

  if (!ativo || !atual) return null

  const perfil = perfilPorId(atual.perfil)

  return (
    <div className="z-40 flex shrink-0 items-stretch border-t-2 border-t-sinal bg-aco-800">
      {/* número do passo */}
      <div className="flex w-[92px] shrink-0 flex-col items-center justify-center border-r border-linha px-2">
        <span className="mono text-2xl font-medium leading-none text-sinal">
          {String(atual.passo).padStart(2, '0')}
        </span>
        <span className="mono mt-0.5 text-2xs text-texto-2">de {roteiro.length}</span>
      </div>

      {/* título e fala sugerida */}
      <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-2.5">
        <div className="flex items-baseline gap-2">
          <h2 className="truncate text-sm font-semibold text-texto">{atual.titulo}</h2>
          <span className="shrink-0 text-2xs text-texto-2">{perfil?.nome}</span>
        </div>
        <p className="mt-0.5 text-xs leading-snug text-texto-2">{atual.fala}</p>
      </div>

      {/* progresso em traços, um por passo */}
      <div className="hidden shrink-0 items-center gap-1 px-3 lg:flex">
        {roteiro.map((r) => (
          <button
            key={r.passo}
            type="button"
            title={`${r.passo}. ${r.titulo}`}
            aria-label={`Ir ao passo ${r.passo}`}
            onClick={() => despachar({ tipo: 'roteiroIr', passo: r.passo })}
            className={`h-6 w-1.5 transition-colors ${
              r.passo === atual.passo
                ? 'bg-sinal'
                : r.passo < atual.passo
                  ? 'bg-sinal/40'
                  : 'bg-linha hover:bg-texto-2'
            }`}
          />
        ))}
      </div>

      {/* controles */}
      <div className="flex shrink-0 items-center gap-1.5 border-l border-linha px-3">
        <BotaoReiniciar />
        <button
          type="button"
          onClick={() => despachar({ tipo: 'roteiroVoltar' })}
          disabled={passo === 1}
          aria-label="Passo anterior"
          className="flex h-9 w-9 items-center justify-center rounded-controle border border-linha text-texto-2 transition-colors hover:text-texto disabled:opacity-30"
        >
          <ChevronLeft size={16} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => despachar({ tipo: 'roteiroAvancar' })}
          disabled={passo === roteiro.length}
          aria-label="Próximo passo"
          className="flex h-9 w-9 items-center justify-center rounded-controle border border-sinal bg-sinal/15 text-sinal transition-colors hover:bg-sinal/25 disabled:opacity-30"
        >
          <ChevronRight size={16} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => despachar({ tipo: 'roteiroSair' })}
          aria-label="Sair do roteiro (Esc)"
          className="flex h-9 w-9 items-center justify-center rounded-controle border border-linha text-texto-2 transition-colors hover:text-texto"
        >
          <X size={15} aria-hidden />
        </button>
      </div>
    </div>
  )
}
