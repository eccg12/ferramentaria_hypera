import { chromium } from 'playwright'
const [alvo, saida, larg = 1920, alt = 1080, ...acoes] = process.argv.slice(2)
const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const p = await nav.newPage({ viewport: { width: +larg, height: +alt } })
const erros = []
p.on('console', m => { if (m.type() === 'error') erros.push(m.text()) })
p.on('pageerror', e => erros.push('pageerror: ' + e.message))
p.on('requestfailed', r => erros.push('falhou: ' + r.url().slice(0, 100)))
await p.goto(alvo, { waitUntil: 'load' })
await p.waitForTimeout(800)
for (const a of acoes) {
  const [verbo, ...resto] = a.split('::')
  const alvoSel = resto.join('::')
  if (verbo === 'clique') await p.click(alvoSel)
  else if (verbo === 'hover') await p.hover(alvoSel)
  else if (verbo === 'espera') await p.waitForTimeout(+alvoSel)
  else if (verbo === 'tecla') await p.keyboard.press(alvoSel)
  await p.waitForTimeout(250)
}
await p.screenshot({ path: saida })
await nav.close()
console.log(erros.length ? 'PROBLEMAS:\n  ' + erros.join('\n  ') : 'sem erros')
