import { AlertTriangle } from 'lucide-react'
import { meta, perfis } from '../dados/seletores'
import { useApp } from '../estado/contexto'

/**
 * Cabeçalho de 56px: marca à esquerda, seletor de perfil, e o selo de ambiente
 * demonstrativo à direita, em --atencao. O selo é permanente e não fecha:
 * um número inventado que pareça medição real vira expectativa contratual.
 */
export function Cabecalho() {
  const { estado, despachar } = useApp()

  return (
    <header className="flex h-[var(--altura-cabecalho)] shrink-0 items-center gap-4 border-b border-linha bg-aco-800 px-4">
      <div className="flex items-baseline gap-2">
        <span className="text-base font-bold tracking-tight text-texto">{meta.produto}</span>
        <span className="hidden text-xs text-texto-2 lg:inline">{meta.subtitulo}</span>
      </div>

      <span aria-hidden className="hidden h-5 w-px bg-linha xl:block" />
      <span className="hidden text-xs text-texto-2 xl:inline">{meta.cliente}</span>

      <div className="ml-auto flex items-center gap-3">
        <label htmlFor="seletor-perfil" className="rotulo hidden sm:inline">
          Perfil
        </label>
        <select
          id="seletor-perfil"
          value={estado.perfilAtivo}
          onChange={(e) => despachar({ tipo: 'trocarPerfil', perfilId: e.target.value })}
          className="rounded-controle border border-linha bg-aco-700 px-2 py-1 text-xs font-semibold text-texto"
        >
          {perfis.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>

        <span
          title={meta.aviso}
          className="flex items-center gap-1.5 rounded-controle border border-atencao/50 bg-atencao/10 px-2 py-1 text-2xs font-semibold uppercase tracking-[0.08em] text-atencao"
        >
          <AlertTriangle size={12} aria-hidden />
          Ambiente demonstrativo
          <span className="hidden md:inline">· dados fictícios</span>
        </span>
      </div>
    </header>
  )
}
