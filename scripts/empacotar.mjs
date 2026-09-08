/*
 * Empacota a build num único dist/index.html, autossuficiente.
 *
 * Motivo: a demonstração precisa abrir por duplo clique, sem servidor
 * (critério de aceite 6). Sob file://, o Chrome bloqueia por CORS tanto o
 * <script type="module" src> quanto o <link rel=stylesheet> e as fontes.
 * Script e folha de estilo passam a ser embutidos; as fontes viram data: URI.
 *
 * A fotografia da placa continua sendo um arquivo à parte em dist/assets/:
 * <img> não sofre a restrição, e manter a foto fora do HTML deixa o arquivo
 * final leve e a troca da imagem trivial.
 */
import { readFileSync, writeFileSync, rmSync, existsSync, readdirSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'

const dist = resolve(process.cwd(), 'dist')
const htmlPath = join(dist, 'index.html')
let html = readFileSync(htmlPath, 'utf8')

const consumidos = []

/** Converte um woff2 do disco em data: URI. */
function fonteEmbutida(caminho) {
  const b64 = readFileSync(caminho).toString('base64')
  return `data:font/woff2;base64,${b64}`
}

/** Troca url('./fontes/x.woff2') por data: URI, resolvendo a partir de `base`. */
function embutirFontes(css, base) {
  return css.replace(/url\((['"]?)([^'")]+\.woff2)\1\)/g, (inteiro, _aspas, ref) => {
    const arquivo = resolve(base, ref)
    if (!existsSync(arquivo)) {
      console.warn(`  aviso: fonte não encontrada, mantida como referência — ${ref}`)
      return inteiro
    }
    consumidos.push(arquivo)
    return `url(${fonteEmbutida(arquivo)})`
  })
}

// 1. o <style> do próprio index.html (as declarações @font-face)
html = html.replace(/<style>([\s\S]*?)<\/style>/g, (_, css) => `<style>${embutirFontes(css, dist)}</style>`)

// 2. folhas de estilo geradas pelo Vite
html = html.replace(
  /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,
  (_inteiro, href) => {
    const arquivo = join(dist, href)
    consumidos.push(arquivo)
    const css = embutirFontes(readFileSync(arquivo, 'utf8'), dirname(arquivo))
    return `<style>\n${css}\n</style>`
  },
)

// 3. o bundle
html = html.replace(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g, (_inteiro, src) => {
  const arquivo = join(dist, src)
  consumidos.push(arquivo)
  const js = readFileSync(arquivo, 'utf8').replace(/<\/script/gi, '<\\/script')
  return `<script type="module">\n${js}\n</script>`
})

writeFileSync(htmlPath, html, 'utf8')

// limpa o que foi embutido
for (const arquivo of new Set(consumidos)) rmSync(arquivo, { force: true })
for (const dir of ['estaticos', 'fontes']) {
  const caminho = join(dist, dir)
  if (existsSync(caminho) && readdirSync(caminho).length === 0) rmSync(caminho, { recursive: true, force: true })
}

const kb = (Buffer.byteLength(html) / 1024).toFixed(0)
console.log(`empacotado: dist/index.html — ${kb} kB, autossuficiente (abre por file://)`)
const restante = existsSync(join(dist, 'assets')) ? readdirSync(join(dist, 'assets')) : []
console.log(`dist/assets: ${restante.length ? restante.join(', ') : '(vazio — falta a foto da placa)'}`)
