import { useState } from 'react'
import { Casca } from '../../casca/Casca'
import { Abas } from '../../componentes/Abas'
import { BotaoReiniciar } from '../../componentes/BotaoReiniciar'
import { TituloTela } from '../../componentes/TituloTela'
import { desvios, itens } from '../../dados/seletores'
import { BaseSerializada } from './BaseSerializada'
import { FilaDesvios } from './FilaDesvios'

/**
 * Guardião de Dados — Fase 1, degrau 2.
 * Duas visões: a fila de desvios (padrão) e a base serializada.
 */
type Aba = 'desvios' | 'base'

export function TelaGuardiao() {
  const [aba, setAba] = useState<Aba>('desvios')

  return (
    <Casca agenteId="guardiao">
      <div className="flex h-full flex-col">
        <TituloTela
          agenteId="guardiao"
          acessorio={
            <>
              <Abas<Aba>
                abas={[
                  { id: 'desvios', rotulo: 'Fila de desvios', contagem: desvios.filter((d) => d.aberto).length },
                  { id: 'base', rotulo: 'Base serializada', contagem: itens.length },
                ]}
                ativa={aba}
                aoTrocar={setAba}
              />
              <BotaoReiniciar />
            </>
          }
        />
        <div className="min-h-0 flex-1 overflow-auto">
          {aba === 'desvios' ? <FilaDesvios /> : <BaseSerializada />}
        </div>
      </div>
    </Casca>
  )
}
