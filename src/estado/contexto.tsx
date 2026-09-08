/*
 * Estado da aplicação. React Context + useReducer, sem localStorage:
 * a demonstração roda várias vezes seguidas e precisa começar limpa a cada
 * recarga da página, além do botão de reiniciar.
 */
import { createContext, useCallback, useContext, useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'
import { perfilPorId, roteiro } from '../dados/seletores'
import type { AcaoApp, DecisaoRegistrada, EstadoApp, TratativaRegistrada } from './tipos'

const ESTADO_INICIAL: EstadoApp = {
  perfilAtivo: 'lider',
  decisoes: [],
  tratativas: [],
  movimentacoesSessao: [],
  fichasSessao: [],
  roteiro: { ativo: false, passo: 1 },
}

/** Hora do registro. Isolada para a leitura do reducer ficar óbvia. */
const agora = () => new Date().toISOString()

function limitar(passo: number): number {
  return Math.min(Math.max(passo, 1), roteiro.length)
}

function reducer(estado: EstadoApp, acao: AcaoApp): EstadoApp {
  switch (acao.tipo) {
    case 'trocarPerfil':
      return { ...estado, perfilAtivo: acao.perfilId }

    case 'registrarDecisao': {
      const nova: DecisaoRegistrada = {
        ...acao.decisao,
        id: `DEC-${estado.decisoes.length + 1}`,
        data: agora(),
      }
      return { ...estado, decisoes: [...estado.decisoes, nova] }
    }

    case 'registrarTratativa': {
      const nova: TratativaRegistrada = {
        ...acao.tratativa,
        id: `TRT-${estado.tratativas.length + 1}`,
        data: agora(),
      }
      return { ...estado, tratativas: [...estado.tratativas, nova] }
    }

    case 'registrarMovimentacao': {
      const nova = {
        ...acao.movimentacao,
        id: `MOV-S${String(estado.movimentacoesSessao.length + 1).padStart(3, '0')}`,
      }
      return { ...estado, movimentacoesSessao: [...estado.movimentacoesSessao, nova] }
    }

    case 'criarFicha': {
      const nova = {
        ...acao.ficha,
        id: `FA-2027-${String(100 + estado.fichasSessao.length + 1)}`,
        nova: true,
      }
      // uma ficha por item de origem: apertar o botão duas vezes não duplica
      if (estado.fichasSessao.some((f) => f.itemOrigem === acao.ficha.itemOrigem)) return estado
      return { ...estado, fichasSessao: [...estado.fichasSessao, nova] }
    }

    case 'roteiroEntrar':
      return { ...estado, roteiro: { ativo: true, passo: limitar(acao.passo ?? 1) } }

    case 'roteiroIr':
      return { ...estado, roteiro: { ...estado.roteiro, passo: limitar(acao.passo) } }

    case 'roteiroAvancar':
      return { ...estado, roteiro: { ...estado.roteiro, passo: limitar(estado.roteiro.passo + 1) } }

    case 'roteiroVoltar':
      return { ...estado, roteiro: { ...estado.roteiro, passo: limitar(estado.roteiro.passo - 1) } }

    case 'roteiroSair':
      return { ...estado, roteiro: { ...estado.roteiro, ativo: false } }

    case 'reiniciarDemonstracao':
      // volta ao estado inicial inteiro: decisões, tratativas, movimentações,
      // fichas, perfil e roteiro. A demo roda várias vezes seguidas.
      return { ...ESTADO_INICIAL }

    default:
      return estado
  }
}

interface ValorContexto {
  estado: EstadoApp
  despachar: (acao: AcaoApp) => void
  /** Nome do perfil ativo — é o autor de toda decisão e tratativa registrada. */
  usuarioAtual: string
  decisaoDoItem: (serial: string) => DecisaoRegistrada | undefined
  tratativaDoDesvio: (desvioId: string) => TratativaRegistrada | undefined
}

const Contexto = createContext<ValorContexto | null>(null)

export function ProvedorApp({ children }: { children: ReactNode }) {
  const [estado, despachar] = useReducer(reducer, ESTADO_INICIAL)

  const usuarioAtual = perfilPorId(estado.perfilAtivo)?.nome ?? estado.perfilAtivo

  const decisaoDoItem = useCallback(
    (serial: string) => estado.decisoes.filter((d) => d.itemSerial === serial).at(-1),
    [estado.decisoes],
  )

  const tratativaDoDesvio = useCallback(
    (desvioId: string) => estado.tratativas.find((t) => t.desvioId === desvioId),
    [estado.tratativas],
  )

  const valor = useMemo(
    () => ({ estado, despachar, usuarioAtual, decisaoDoItem, tratativaDoDesvio }),
    [estado, usuarioAtual, decisaoDoItem, tratativaDoDesvio],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useApp(): ValorContexto {
  const valor = useContext(Contexto)
  if (!valor) throw new Error('useApp precisa estar dentro de <ProvedorApp>')
  return valor
}
