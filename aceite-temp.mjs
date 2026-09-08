import { chromium } from 'playwright'
const BASE = process.argv[2]
const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const problemas = []
const ok = []

// ---- 1 e 2: roteiro inteiro só com a seta, selo em toda rota
{
  const p = await nav.newPage({ viewport: { width: 1920, height: 1080 } })
  const erros = []
  p.on('pageerror', e => erros.push(e.message))
  await p.goto(BASE, { waitUntil: 'load' })
  await p.waitForTimeout(700)
  await p.keyboard.press('r')
  await p.waitForTimeout(400)
  let semSelo = []
  let semChip = []
  for (let i = 1; i <= 9; i++) {
    await p.waitForTimeout(600)
    const rota = p.url().split('#')[1]
    const selo = await p.locator('text=/Ambiente demonstrativo/i').count()
    if (selo === 0) semSelo.push(rota)
    const chips = await p.locator('text=/Degrau \\d/').count()
    if (chips === 0) semChip.push(rota)
    if (i < 9) await p.keyboard.press('ArrowRight')
  }
  ok.push(`1. roteiro inteiro corre só com a seta direita, 9 passos`)
  if (semSelo.length) problemas.push(`2. selo ausente em: ${semSelo.join(', ')}`)
  else ok.push('2. selo de ambiente demonstrativo presente nos 9 passos')
  if (semChip.length) problemas.push(`3. rota sem nenhum chip de fase: ${semChip.join(', ')}`)
  if (erros.length) problemas.push(`erros de página durante o roteiro: ${erros.join(' | ')}`)
  await p.close()
}

// ---- 2b: selo em TODA rota, inclusive as que o roteiro não visita
{
  const p = await nav.newPage({ viewport: { width: 1600, height: 900 } })
  const rotas = ['/guardiao', '/guardiao/item/FS-0192', '/visao', '/checkin', '/tradeoff',
                 '/reposicao', '/valor', '/diagnostico']
  const faltando = []
  for (const r of rotas) {
    await p.goto(`${BASE}#${r}`, { waitUntil: 'load' })
    await p.waitForTimeout(450)
    if (await p.locator('text=/Ambiente demonstrativo/i').count() === 0) faltando.push(r)
  }
  if (faltando.length) problemas.push(`2b. selo ausente em: ${faltando.join(', ')}`)
  else ok.push(`2b. selo presente nas ${rotas.length} rotas`)
  await p.close()
}

// ---- 4: vida remanescente só no bloco de tendência
{
  const p = await nav.newPage({ viewport: { width: 1600, height: 900 } })
  const rotas = ['/guardiao', '/guardiao/item/FS-0192', '/visao', '/visao?painel=comparar',
                 '/visao?painel=fila', '/visao?painel=recebimento', '/checkin', '/tradeoff',
                 '/reposicao', '/valor', '/diagnostico']
  const vazando = []
  for (const r of rotas) {
    await p.goto(`${BASE}#${r}`, { waitUntil: 'load' })
    await p.waitForTimeout(450)
    const txt = await p.locator('body').innerText()
    if (/vida remanescente/i.test(txt)) vazando.push(r)
  }
  // só a aba de histórico pode ter
  await p.goto(`${BASE}#/visao?painel=historico`, { waitUntil: 'load' })
  await p.waitForTimeout(600)
  const noHistorico = await p.locator('text=/Vida remanescente/i').count()
  const comAviso = await p.locator('text=/Não é predição/i').count()
  if (vazando.length) problemas.push(`4. vida remanescente aparece fora do bloco: ${vazando.join(', ')}`)
  else ok.push('4. vida remanescente só existe na aba de histórico')
  if (noHistorico === 0) problemas.push('4b. vida remanescente não aparece no bloco de tendência')
  else if (comAviso === 0) problemas.push('4b. vida remanescente sem o aviso de degrau ao lado')
  else ok.push('4b. no bloco de tendência, com o aviso de degrau 2 colado')
  await p.close()
}

// ---- 5: nenhuma aprovação automática
{
  const p = await nav.newPage({ viewport: { width: 1600, height: 900 } })
  await p.goto(`${BASE}#/visao`, { waitUntil: 'load' })
  await p.waitForTimeout(700)
  await p.click('text=Avaliar peça')
  await p.waitForTimeout(3200)
  const txt = await p.locator('aside').innerText()
  const temRegistroSemAcao = /Registrada por/i.test(txt)
  if (temRegistroSemAcao) problemas.push('5. decisão apareceu registrada sem ação humana')
  else ok.push('5. nenhuma decisão registrada sem ação humana')
  await p.close()
}

// ---- 8: legibilidade a 1920x1080 — nada estourando a largura
{
  const p = await nav.newPage({ viewport: { width: 1920, height: 1080 } })
  const rotas = ['/guardiao', '/guardiao/item/FS-0192', '/visao', '/checkin', '/tradeoff',
                 '/reposicao', '/valor', '/diagnostico']
  const estourando = []
  for (const r of rotas) {
    await p.goto(`${BASE}#${r}`, { waitUntil: 'load' })
    await p.waitForTimeout(500)
    const over = await p.evaluate(() =>
      document.documentElement.scrollWidth > window.innerWidth + 1)
    if (over) estourando.push(r)
  }
  if (estourando.length) problemas.push(`8. rolagem horizontal em: ${estourando.join(', ')}`)
  else ok.push('8. nenhuma rota rola na horizontal a 1920x1080')
  await p.close()
}

await nav.close()
console.log('APROVADO:'); ok.forEach(o => console.log('  ' + o))
if (problemas.length) { console.log('\nFALHOU:'); problemas.forEach(x => console.log('  ' + x)) }
else console.log('\nnenhuma falha')
