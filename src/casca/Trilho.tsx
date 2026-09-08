import { NavLink } from 'react-router-dom'
import { BarChart3, Database, Lock, PlayCircle, RotateCcw, ScanEye, Scale, Truck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { agentes, perfilPorId } from '../dados/seletores'
import { useApp } from '../estado/contexto'

/**
 * Trilho esquerdo de 72px que expande para 240px no hover, mostrando nome e
 * fase de cada agente. O agente 05 aparece com cadeado: está bloqueado e
 * visível, porque é a próxima venda.
 *
 * A expansão sobrepõe a área de trabalho em vez de empurrá-la. Reflow de
 * gráfico no meio de uma apresentação chama atenção para o lugar errado.
 *
 * Trocar o perfil esmaece o que aquele perfil não usa — nunca some com nada:
 * a demonstração precisa navegar livre.
 */
const ICONES: Record<string, LucideIcon> = {
  guardiao: Database,
  visao: ScanEye,
  tradeoff: Scale,
  reposicao: Truck,
  diagnostico: BarChart3,
}

const ROTAS: Record<string, string> = {
  guardiao: '/guardiao',
  visao: '/visao',
  tradeoff: '/tradeoff',
  reposicao: '/reposicao',
  diagnostico: '/diagnostico',
}

/** Rotas que não são agentes, abaixo do divisor. Também filtram por perfil. */
const EXTRAS = [
  { id: 'checkin', rota: '/checkin', rotulo: 'Check-in / check-out', Icone: RotateCcw },
  { id: 'valor', rota: '/valor', rotulo: 'Valor', Icone: BarChart3 },
]

const CLASSE_LINK = (isActive: boolean, noPerfil: boolean) =>
  [
    'flex items-center gap-3 border-l-2 px-[26px] transition-colors group-hover/trilho:gap-2.5 group-hover/trilho:px-4',
    isActive
      ? 'border-l-sinal bg-aco-700 text-sinal'
      : 'border-l-transparent text-texto-2 hover:bg-aco-700/50 hover:text-texto',
    noPerfil ? '' : 'opacity-40',
  ].join(' ')

export function Trilho() {
  const { estado, despachar } = useApp()
  const perfil = perfilPorId(estado.perfilAtivo)
  const usa = (id: string) => perfil?.ve.includes(id) ?? true

  return (
    <div className="relative w-[var(--largura-trilho)] shrink-0">
      <nav
        aria-label="Agentes"
        className="group/trilho absolute inset-y-0 left-0 z-30 flex w-[var(--largura-trilho)] flex-col overflow-hidden border-r border-linha bg-aco-800 transition-[width] duration-150 hover:w-[240px]"
      >
        <ul className="flex flex-col">
          {agentes.map((agente) => {
            const Icone = ICONES[agente.id] ?? Database
            const bloqueado = agente.estado === 'bloqueado'
            return (
              <li key={agente.id}>
                <NavLink
                  to={ROTAS[agente.id]}
                  title={`${agente.nome} — ${agente.fase}${bloqueado ? ' (próxima onda)' : ''}`}
                  className={({ isActive }) => `h-14 ${CLASSE_LINK(isActive, usa(agente.id))}`}
                >
                  <span className="relative shrink-0">
                    <Icone size={18} aria-hidden />
                    {bloqueado && (
                      <Lock
                        size={10}
                        aria-hidden
                        className="absolute -bottom-1 -right-1.5 text-atencao"
                      />
                    )}
                  </span>
                  <span className="hidden min-w-0 flex-col group-hover/trilho:flex">
                    <span className="truncate text-xs font-semibold">
                      <span className="mono mr-1 text-2xs opacity-60">
                        {String(agente.numero).padStart(2, '0')}
                      </span>
                      {agente.nome}
                    </span>
                    <span className="truncate text-2xs text-texto-2">
                      {agente.fase}
                      {bloqueado && ' · bloqueado'}
                    </span>
                  </span>
                </NavLink>
              </li>
            )
          })}
        </ul>

        <div className="my-1 h-px w-full bg-linha" />

        <ul className="flex flex-col">
          {EXTRAS.map(({ id, rota, rotulo, Icone }) => (
            <li key={id}>
              <NavLink
                to={rota}
                title={rotulo}
                className={({ isActive }) =>
                  `h-11 text-2xs uppercase tracking-[0.06em] ${CLASSE_LINK(isActive, usa(id))}`
                }
              >
                <Icone size={16} className="shrink-0" aria-hidden />
                <span className="hidden truncate group-hover/trilho:inline">{rotulo}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <div className="h-px w-full bg-linha" />
          <button
            type="button"
            onClick={() => despachar({ tipo: 'roteiroEntrar' })}
            title="Roteiro guiado da apresentação (tecla R)"
            className="flex h-14 w-full items-center gap-3 px-[26px] text-sinal transition-colors hover:bg-aco-700 group-hover/trilho:gap-2.5 group-hover/trilho:px-4"
          >
            <PlayCircle size={18} className="shrink-0" aria-hidden />
            <span className="hidden min-w-0 flex-col items-start group-hover/trilho:flex">
              <span className="truncate text-xs font-semibold">Roteiro guiado</span>
              <span className="truncate text-2xs text-texto-2">
                9 passos · tecla R{estado.roteiro.ativo && ' · em curso'}
              </span>
            </span>
          </button>
        </div>
      </nav>
    </div>
  )
}
