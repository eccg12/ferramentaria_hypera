import { chromium } from 'playwright'
const BASE = process.argv[2]
const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const p = await nav.newPage({ viewport: { width: 1920, height: 1080 } })
const rotas = ['/guardiao', '/guardiao/item/FS-0192', '/visao', '/visao?painel=comparar',
               '/visao?painel=historico', '/visao?painel=fila', '/visao?painel=recebimento',
               '/checkin', '/tradeoff', '/reposicao', '/valor', '/diagnostico']
for (const r of rotas) {
  await p.goto(`${BASE}#${r}`, { waitUntil: 'load' })
  await p.waitForTimeout(500)
  if (r === '/visao') { await p.click('text=Avaliar peça'); await p.waitForTimeout(3200) }
  // conta títulos de bloco (h2/h3 com a classe .rotulo) e chips
  const n = await p.evaluate(() => ({
    chips: document.body.innerText.match(/degrau \d/gi)?.length ?? 0,
    blocos: document.querySelectorAll('h2.rotulo, h3.rotulo').length,
  }))
  console.log(`${r.padEnd(30)} blocos ${String(n.blocos).padStart(2)}  chips ${String(n.chips).padStart(2)}`)
}
await nav.close()
