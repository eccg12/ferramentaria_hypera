import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Casca } from './casca/Casca'
import { Marcador } from './componentes/Marcador'
import { BotaoReiniciar } from './componentes/BotaoReiniciar'
import { TituloTela } from './componentes/TituloTela'
import { ProvedorApp } from './estado/contexto'
import { BarraRoteiro } from './roteiro/BarraRoteiro'
import { TelaGuardiao } from './telas/guardiao/TelaGuardiao'
import { FichaItem } from './telas/guardiao/FichaItem'
import { TelaVisao } from './telas/visao/TelaVisao'
import { TelaCheckin } from './telas/checkin/TelaCheckin'

/*
 * HashRouter: a build precisa abrir por file:// e no GitHub Pages.
 * Rota padrão /guardiao — a demonstração começa pelos desvios, não por um
 * relatório.
 */

function TelaMarcador({ agenteId, nome, prompt }: { agenteId?: string; nome: string; prompt: string }) {
  return (
    <Casca agenteId={agenteId}>
      <TituloTela agenteId={agenteId} titulo={nome} acessorio={<BotaoReiniciar />} />
      <Marcador nome={nome} prompt={prompt} />
    </Casca>
  )
}

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
          <Route
            path="/tradeoff"
            element={
              <TelaMarcador agenteId="tradeoff" nome="Trade-Off CAPEX × OPEX" prompt="Prompt 10" />
            }
          />
          <Route
            path="/reposicao"
            element={
              <TelaMarcador agenteId="reposicao" nome="Reposição & Fornecedores" prompt="Prompt 11" />
            }
          />
          <Route path="/valor" element={<TelaMarcador nome="Valor" prompt="Prompt 12" />} />
          <Route
            path="/diagnostico"
            element={
              <TelaMarcador agenteId="diagnostico" nome="Diagnóstico de Máquina" prompt="Prompt 13" />
            }
          />
          <Route path="*" element={<Navigate to="/guardiao" replace />} />
        </Routes>
        </div>
        <BarraRoteiro />
        </div>
      </HashRouter>
    </ProvedorApp>
  )
}
