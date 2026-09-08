import type { AcaoDecisao, FichaAquisicao, Movimentacao } from '../dados/tipos'

/** Uma disposição de peça registrada durante a sessão. Sempre com autor e hora. */
export interface DecisaoRegistrada {
  id: string
  itemSerial: string
  medicaoId: string
  acao: AcaoDecisao
  /** O perfil ativo no momento do registro é o autor. */
  usuario: string
  perfilId: string
  data: string
  observacao: string
}

/** Uma tratativa de desvio registrada pelo Guardião. */
export interface TratativaRegistrada {
  id: string
  desvioId: string
  usuario: string
  perfilId: string
  data: string
  observacao: string
}

export interface EstadoRoteiro {
  ativo: boolean
  passo: number
}

export interface EstadoApp {
  perfilAtivo: string
  decisoes: DecisaoRegistrada[]
  tratativas: TratativaRegistrada[]
  /** Movimentações criadas no check-in/check-out durante a sessão. */
  movimentacoesSessao: Movimentacao[]
  /** Fichas criadas na tela de trade-off durante a sessão. */
  fichasSessao: FichaAquisicao[]
  roteiro: EstadoRoteiro
}

export type AcaoApp =
  | { tipo: 'trocarPerfil'; perfilId: string }
  | { tipo: 'registrarDecisao'; decisao: Omit<DecisaoRegistrada, 'id' | 'data'> }
  | { tipo: 'registrarTratativa'; tratativa: Omit<TratativaRegistrada, 'id' | 'data'> }
  | { tipo: 'registrarMovimentacao'; movimentacao: Omit<Movimentacao, 'id'> }
  | { tipo: 'criarFicha'; ficha: Omit<FichaAquisicao, 'id' | 'nova'> }
  | { tipo: 'roteiroEntrar'; passo?: number }
  | { tipo: 'roteiroIr'; passo: number }
  | { tipo: 'roteiroAvancar' }
  | { tipo: 'roteiroVoltar' }
  | { tipo: 'roteiroSair' }
  | { tipo: 'reiniciarDemonstracao' }
