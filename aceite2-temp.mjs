import { chromium } from 'playwright'
const BASE = process.argv[2]
const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const ok = [], problemas = []

// ---- 5b: foco de teclado visível e navegação por Tab
{
  const p = await nav.newPage({ viewport: { width: 1600, height: 900 } })
  await p.goto(`${BASE}#/guardiao`, { waitUntil: 'load' })
  await p.waitForTimeout(600)
  let semAnel = 0, alcancados = 0
  for (let i = 0; i < 25; i++) {
    await p.keyboard.press('Tab')
    const r = await p.evaluate(() => {
      const e = document.activeElement
      if (!e || e === document.body) return null
      const s = getComputedStyle(e)
      return { tag: e.tagName, outline: s.outlineStyle, largura: s.outlineWidth }
    })
    if (!r) continue
    alcancados++
    if (r.outline === 'none' || r.largura === '0px') semAnel++
  }
  if (semAnel > 0) problemas.push(`foco sem anel visível em ${semAnel} de ${alcancados} elementos`)
  else ok.push(`foco de teclado visível nos ${alcancados} elementos alcançados por Tab`)
  await p.close()
}

// ---- 6/7: build por file:// sem rede nenhuma
{
  const ctx = await nav.newContext({ viewport: { width: 1600, height: 900 } })
  const externas = []
  await ctx.route('**/*', (rota) => {
    const u = rota.request().url()
    if (!u.startsWith('file://') && !u.startsWith('data:') && !u.startsWith('blob:')) {
      externas.push(u.slice(0, 90))
      return rota.abort()
    }
    return rota.continue()
  })
  const p = await ctx.newPage()
  const erros = []
  p.on('pageerror', e => erros.push(e.message))
  const rotas = ['/guardiao', '/guardiao/item/FS-0192', '/visao', '/checkin', '/tradeoff',
                 '/reposicao', '/valor', '/diagnostico']
  for (const r of rotas) {
    await p.goto(`${BASE}#${r}`, { waitUntil: 'load' })
    await p.waitForTimeout(400)
  }
  const fontes = await p.evaluate(async () => {
    await document.fonts.ready
    return Array.from(document.fonts).filter(f => f.status === 'loaded').map(f => `${f.family} ${f.weight}`)
  })
  if (externas.length) problemas.push(`pediu rede: ${[...new Set(externas)].join(', ')}`)
  else ok.push('6/7. as 8 rotas abrem por file:// sem nenhum pedido de rede')
  if (erros.length) problemas.push(`erros por file://: ${erros.join(' | ')}`)
  if (fontes.length === 0) problemas.push('nenhuma fonte carregou sem rede')
  else ok.push(`tipografia sem rede: ${fontes.join(', ')}`)
  await ctx.close()
}

// ---- movimento reduzido em toda a demonstração
{
  const ctx = await nav.newContext({ viewport: { width: 1600, height: 900 }, reducedMotion: 'reduce' })
  const p = await ctx.newPage()
  await p.goto(`${BASE}#/visao`, { waitUntil: 'load' })
  await p.waitForTimeout(600)
  await p.click('text=Avaliar peça')
  await p.waitForTimeout(120)
  const achados = await p.locator('h3', { hasText: 'Achados ·' }).first().textContent()
  const linhaVarredura = await p.locator('svg[data-bancada] line').count()
  if (!achados.includes('4 de 4')) problemas.push('movimento reduzido não revelou tudo de uma vez')
  else if (linhaVarredura > 0) problemas.push('movimento reduzido ainda desenhou a passada')
  else ok.push('prefers-reduced-motion revela tudo de uma vez, sem a passada')
  await ctx.close()
}

await nav.close()
console.log('APROVADO:'); ok.forEach(o => console.log('  ' + o))
if (problemas.length) { console.log('\nFALHOU:'); problemas.forEach(x => console.log('  ' + x)) }
else console.log('\nnenhuma falha')
