import { RefreshCw } from 'lucide-react'
import { useApp } from '../estado/contexto'
import { Botao } from './Botao'

/**
 * Limpa decisões, tratativas, movimentações e fichas registradas na sessão.
 * Precisa existir e precisa ser fácil de achar: a demonstração roda várias
 * vezes seguidas na mesma reunião.
 */
export function BotaoReiniciar({ className = '' }: { className?: string }) {
  const { estado, despachar } = useApp()
  const registros =
    estado.decisoes.length +
    estado.tratativas.length +
    estado.movimentacoesSessao.length +
    estado.fichasSessao.length

  return (
    <Botao
      variante="fantasma"
      onClick={() => despachar({ tipo: 'reiniciarDemonstracao' })}
      title="Limpa tudo o que foi registrado nesta sessão e volta ao estado inicial"
      className={className}
    >
      <RefreshCw size={13} aria-hidden />
      Reiniciar demonstração
      {registros > 0 && <span className="mono ml-0.5 text-2xs text-sinal">{registros}</span>}
    </Botao>
  )
}
