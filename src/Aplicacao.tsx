import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProvedorApp } from './estado/contexto'
import { BarraRoteiro } from './roteiro/BarraRoteiro'
import { TelaGuardiao } from './telas/guardiao/TelaGuardiao'
import { FichaItem } from './telas/guardiao/FichaItem'
import { TelaVisao } from './telas/visao/TelaVisao'
import { TelaCheckin } from './telas/checkin/TelaCheckin'
import { TelaTradeOff } from './telas/tradeoff/TelaTradeOff'
import { TelaReposicao } from './telas/reposicao/TelaReposicao'
import { TelaValor } from './telas/valor/TelaValor'
import { TelaDiagnostico } from './telas/diagnostico/TelaDiagnostico'

/*
 * HashRouter: a build precisa abrir por file:// e no GitHub Pages.
 * Rota padrão /guardiao — a demonstração começa pelos desvios, não por um
 * relatório.
 */

export function Aplicacao() {
  return (
    <ProvedorApp>
      <HashRouter>
        {/*
          A barra do roteiro fica fora das rotas e abaixo delas: o modo
          apresentação acompanha a navegação sem cada tela precisar saber dele.
        */}
        <div className="flex h-full flex-col">
        <div className="min-h-0 flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/guardiao" replace />} />
          <Route path="/guardiao" element={<TelaGuardiao />} />
          <Route path="/guardiao/item/:serial" element={<FichaItem />} />
          <Route path="/visao" element={<TelaVisao />} />
          <Route path="/checkin" element={<TelaCheckin />} />
          <Route path="/tradeoff" element={<TelaTradeOff />} />
          <Route path="/reposicao" element={<TelaReposicao />} />
          <Route path="/valor" element={<TelaValor />} />
          <Route path="/diagnostico" element={<TelaDiagnostico />} />
          <Route path="*" element={<Navigate to="/guardiao" replace />} />
        </Routes>
        </div>
        <BarraRoteiro />
        </div>
      </HashRouter>
    </ProvedorApp>
  )
}
