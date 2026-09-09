/*
 * Gera a versão do FerraMon publicável como Artifact.
 *
 * O Artifact é um único arquivo HTML: não existe pasta ao lado dele, então o
 * caminho relativo da fotografia não resolve e a bancada cairia no painel de
 * "foto ausente". Aqui a imagem entra embutida como data: URI, no próprio
 * caminho que o seed declara — `caminhoAsset` devolve intacto tudo que não
 * começa com barra.
 *
 * O envelope (doctype, html, head, body) é responsabilidade do host, então a
 * saída traz só o conteúdo: título, estilos, raiz e bundle.
 *
 *   npm run build && node scripts/artifact.mjs [destino.html]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const destino = process.argv[2] ?? resolve(raiz, 'dist', 'ferramon-artifact.html')

const html = readFileSync(resolve(raiz, 'dist', 'index.html'), 'utf8')

const estilos = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1])
if (estilos.length !== 2) {
  throw new Error(`esperava 2 blocos de estilo na build, achei ${estilos.length}`)
}

const abre = html.indexOf('<script type="module">')
if (abre < 0) throw new Error('bundle não encontrado — rode npm run build antes')
const inicio = abre + '<script type="module">'.length
let bundle = html.slice(inicio, html.indexOf('</script>', inicio))

// a fotografia, embutida no lugar do caminho relativo
const CAMINHO_SEED = '"/assets/placa-FS-0192.jpg"'
const foto = resolve(raiz, 'public', 'assets', 'placa-FS-0192.jpg')

if (!existsSync(foto)) {
  console.warn('aviso: public/assets/placa-FS-0192.jpg não existe.')
  console.warn('       o artifact vai mostrar o painel de foto ausente.')
} else if (!bundle.includes(CAMINHO_SEED)) {
  throw new Error(`não achei ${CAMINHO_SEED} no bundle — o seed mudou?`)
} else {
  const bytes = readFileSync(foto)
  const uri = `data:image/jpeg;base64,${bytes.toString('base64')}`
  bundle = bundle.replace(CAMINHO_SEED, JSON.stringify(uri))
  console.log(`foto embutida: ${(bytes.length / 1024).toFixed(0)} kB → ${(uri.length / 1024).toFixed(0)} kB em base64`)
}

const saida = [
  // nome curto: é assim que a página aparece na aba e na galeria
  '<title>FerraMon</title>',
  `<style>${estilos[0]}</style>`,
  `<style>${estilos[1]}</style>`,
  '<div id="root"></div>',
  `<script type="module">${bundle}</script>`,
].join('\n')

writeFileSync(destino, saida, 'utf8')
console.log(`artifact: ${destino} — ${(Buffer.byteLength(saida) / 1024 / 1024).toFixed(2)} MB`)
