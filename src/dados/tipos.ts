/*
 * Tipos de src/dados/seed.json — a fonte única de verdade do FerraMon.
 * Não crie dados paralelos dentro de componentes: se faltar algo, adicione ao seed.
 */

// ---------------------------------------------------------------- vocabulário

/** Os quatro níveis de condição da Hypera. */
export type EstadoCondicao = 'novo' | 'ok' | 'desgastado' | 'danificado'

/** Onde a peça está no ciclo de vida físico. */
export type LocalItem = 'armario' | 'maquina' | 'avaliacao' | 'reparo'

/** Resultado de uma cota contra a tolerância. Cor vem daqui, não de opinião. */
export type StatusCota = 'ok' | 'atencao' | 'fora'

/** Severidade de um achado do agente de visão. */
export type SeveridadeAchado = 'condenar' | 'atencao' | 'observar'

export type Area = 'manipulacao' | 'compressao' | 'embalagem'
export type SubArea = 'formacao' | 'alimentacao' | 'selagem' | 'corte'

export type SeveridadeDesvio = 'alta' | 'media' | 'baixa'

export type TipoDesvio =
  | 'nao_devolvido'
  | 'troca_sem_motivo'
  | 'ciclos_acima_limite'
  | 'sem_medicao'
  | 'divergencia_reserva'

/** As quatro ações possíveis no bloco de decisão. Nunca há aprovação automática. */
export type AcaoDecisao = 'aprovar' | 'reparo' | 'condenar' | 'segunda_opiniao'

// ---------------------------------------------------------------- meta e casca

export interface Meta {
  produto: string
  subtitulo: string
  cliente: string
  parceria: string
  versao: string
  geradoEm: string
  ambiente: string
  aviso: string
}

export interface Agente {
  id: string
  numero: number
  nome: string
  fase: string
  /** Degrau da escada analítica: 1 identidade, 2 rastreabilidade, 3 critério, 4 predição. */
  degrau: number
  estado: 'ativo' | 'bloqueado'
  resumo: string
  /** Produtos Google usados na tela — vira o rodapé técnico, sempre com ressalva. */
  stack: string[]
}

export interface Perfil {
  id: string
  nome: string
  /** Ids de agente/rota que este perfil usa no dia a dia. Filtra, não esconde. */
  ve: string[]
  descricao: string
}

export interface PassoRoteiro {
  passo: number
  rota: string
  perfil: string
  titulo: string
  fala: string
}

// ---------------------------------------------------------------- geometria

/** Coordenadas normalizadas 0..1 sobre a foto, para as marcações colarem em qualquer zoom. */
export interface Cavidade {
  id: string
  numero: number
  linha: number
  coluna: number
  cx: number
  cy: number
  r: number
}

export interface Serrilha {
  id: string
  banda: string
  tipo: 'vedacao' | 'guia'
  cx: number
  cy: number
  w: number
  h: number
}

export interface Geometria {
  imagem: string
  larguraPx: number
  alturaPx: number
  nota: string
  cavidades: Cavidade[]
  serrilhas: Serrilha[]
}

export interface SpecCota {
  nominal: number
  tol: number
  unidade: string
}

// ---------------------------------------------------------------- itens

export interface Aquisicao {
  data: string
  valor: number
  vidaContabilAnos: number
}

export interface Item {
  serial: string
  familia: string
  familiaLabel: string
  area: Area
  subarea: SubArea | null
  site: string
  galpao: string
  maquina: string
  formato: string | null
  posicao: string
  kit: string | null
  fornecedor: string
  aquisicao: Aquisicao
  ciclos: number
  limiteCiclos: number
  estado: EstadoCondicao
  local: LocalItem
  temMedicao: boolean
  reservaSap: string | null
  /** Peça da prova de conceito. Há uma por área, para mostrar que o conceito atravessa as três. */
  poc: boolean
  referenciaZero?: { medicaoId: string; escaneadaEm: string }
  destaque?: boolean
}

// ---------------------------------------------------------------- medições

export interface Cota {
  alvo: string
  tipo: string
  valor: number
  nominal: number
  tolerancia: number
  unidade: string
  status: StatusCota
}

export interface Achado {
  id: string
  tipo: string
  rotulo: string
  /** Abaixo de 0,50 o achado é para acompanhamento, nunca veredito. */
  score: number
  severidade: SeveridadeAchado
  /** Id de cavidade ou serrilha; pode listar mais de um, separado por vírgula. */
  alvo: string
  detalhe: string
  poligono?: number[][]
}

export interface DecisaoHumana {
  usuario: string
  decisao: string
  data: string
  observacao: string
}

export interface Medicao {
  id: string
  itemSerial: string
  data: string
  rig: string
  rigDescricao: string
  /** Calibração rastreável: é o que faz a medição valer para a Qualidade. */
  calibracao: { certificado: string; validade: string; rastreavel: boolean }
  ciclosNaMedicao: number
  cotas: Cota[]
  serrilha: {
    perdaAlturaPico: number
    unidade: string
    limite: number
    alvo: string
    status: StatusCota
  }
  planicidade: { valor: number; limite: number; unidade: string; status: StatusCota }
  achados: Achado[]
  estado: EstadoCondicao
  concordanciaPainel: number | null
  avaliadoresPainel: number | null
  decisaoHumana: DecisaoHumana | null
}

export interface PontoTendencia {
  ciclos: number
  desgaste: number
}

export interface Tendencia {
  itemSerial: string
  /** Degrau 2, não 4. A tela precisa dizer isso na cara. */
  degrau: number
  metodo: string
  avisoDegrau: string
  inclinacaoPorCemMilGolpes: number
  unidadeInclinacao: string
  limiteCondenacao: number
  /** Só pode aparecer dentro do bloco de tendência, com o aviso de degrau 2. */
  vidaRemanescenteGolpes: number
  pontos: PontoTendencia[]
}

// ---------------------------------------------------------------- movimento

export interface Movimentacao {
  id: string
  itemSerial: string
  tipo: 'check-out' | 'check-in'
  data: string
  op: string
  maquina: string
  produto: string
  operador: string
  motivo: string | null
}

export interface Desvio {
  id: string
  tipo: TipoDesvio
  rotulo: string
  itemSerial: string
  severidade: SeveridadeDesvio
  aberto: boolean
  abertoEm: string
  fechadoEm?: string
  detalhe: string
  acao: string
  responsavel: string
}

export interface OP {
  op: string
  produto: string
  formato: string
  maquina: string
  unidadesProduzidas: number
  bolhasPorGolpe: number
  /** unidades ÷ bolhas por golpe. É daqui que sai o contador de ciclos. */
  golpes: number
  inicio: string
  fonte: string
}

// ---------------------------------------------------------------- economia

export interface PontoCurva {
  ciclos: number
  manter: number
  repor: number
}

export interface TradeOff {
  itemSerial: string
  moeda: string
  custoRepor: { valor: number; detalhe: string }
  custoManterProximos100k: {
    valor: number
    componentes: { rotulo: string; valor: number }[]
  }
  pontoOtimoGolpes: number
  curva: PontoCurva[]
  recomendacao: string
  aviso: string
}

export interface Fornecedor {
  codigo: string
  nome: string
  familias: string[]
  precoMedio: number
  prazoSemanas: number
  durabilidadeMediaGolpes: number
  foraDeSpecNoRecebimento: number
  /** Precisa estar visível: 15 a 18 peças ainda não fecham a conclusão. */
  amostras: number
  nota: string
}

export interface FichaAquisicao {
  id: string
  familia: string
  itemOrigem: string | null
  quantidade: number
  valorUnitario: number
  exercicio: number
  origem: string
  status: string
  /** Marcada quando a ficha nasce na tela de trade-off durante a sessão. */
  nova?: boolean
}

export interface LinhaPlano3YP {
  exercicio: number
  familia: string
  quantidade: number
  valor: number
}

export type Cenario = 'conservador' | 'base' | 'otimista'
export type Escopo = 'piloto' | 'parque'

export type ValoresPorCenario = Record<Cenario, number>

export interface Alavanca {
  id: string
  rotulo: string
  fase: string
  piloto: ValoresPorCenario
  parque: ValoresPorCenario
}

export interface BusinessCase {
  fonte: string
  moeda: string
  unidade: string
  aviso: string
  alavancas: Alavanca[]
  totais: Record<Escopo, ValoresPorCenario>
  efeitoContabil: { piloto: number; parque: number; nota: string }
  capturaPorFase: { fase: string; acumulado: number; rotulo: string }[]
}

export interface Formato {
  codigo: string
  produto: string
  bolhasPorGolpe: number
  espessuraComprimidoMm: number
}

// ---------------------------------------------------------------- raiz

export interface Seed {
  meta: Meta
  agentes: Agente[]
  perfis: Perfil[]
  roteiro: PassoRoteiro[]
  geometria: Geometria
  specs: { profundidadeCavidade: SpecCota }
  itens: Item[]
  medicoes: Medicao[]
  tendencia: Tendencia
  movimentacoes: Movimentacao[]
  desvios: Desvio[]
  ops: OP[]
  tradeoff: TradeOff
  fornecedores: Fornecedor[]
  fichasAquisicao: FichaAquisicao[]
  plano3YP: LinhaPlano3YP[]
  businessCase: BusinessCase
  formatos: Formato[]
}
