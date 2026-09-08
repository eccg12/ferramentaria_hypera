import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Casca } from './casca/Casca'
import { Marcador } from './componentes/Marcador'
import { BotaoReiniciar } from './componentes/BotaoReiniciar'
import { TituloTela } from './componentes/TituloTela'
import { ProvedorApp } from './estado/contexto'
import { TelaGuardiao } from './telas/guardiao/TelaGuardiao'

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
        <Routes>
          <Route path="/" element={<Navigate to="/guardiao" replace />} />
          <Route path="/guardiao" element={<TelaGuardiao />} />
          <Route
            path="/visao"
            element={<TelaMarcador agenteId="visao" nome="Agente de Visão" prompt="Prompt 4" />}
          />
          <Route
            path="/checkin"
            element={<TelaMarcador nome="Check-in / check-out" prompt="Prompt 7" />}
          />
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
      </HashRouter>
    </ProvedorApp>
  )
}
