import { chromium } from 'playwright'
const [alvo, saida, larg = 1920, alt = 1080, ...acoes] = process.argv.slice(2)
const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const p = await nav.newPage({ viewport: { width: +larg, height: +alt } })
const erros = []
p.on('pageerror', e => erros.push('pageerror: ' + e.message))
p.on('console', m => { if (m.type() === 'error' && !m.text().includes('ERR_FILE')) erros.push(m.text()) })
await p.goto(alvo, { waitUntil: 'load' })
await p.waitForTimeout(900)
for (const a of acoes) {
  const [verbo, ...resto] = a.split('::'); const sel = resto.join('::')
  if (verbo === 'clique') await p.click(sel)
  else if (verbo === 'espera') await p.waitForTimeout(+sel)
  else if (verbo === 'tecla') await p.keyboard.press(sel)
  await p.waitForTimeout(250)
}
await p.screenshot({ path: saida })
await nav.close()
console.log(erros.length ? 'PROBLEMAS:\n  ' + erros.join('\n  ') : 'sem erros')
