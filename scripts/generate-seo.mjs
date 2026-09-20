import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const site = 'https://liuyinchu.github.io'
const read = (file) => readFile(path.join(root, file), 'utf8')
const html = await read('dist/index.html')
const router = await read('src/router/index.js')
const articles = JSON.parse(await read('public/articles.json'))
const frontier = JSON.parse(await read('public/ai-frontier/benchmarks.json'))

// Only actual page routes: omit comments, redirects, parameter patterns and 404.
const routes = [...router.matchAll(/^\s*\{ path: '([^']+)', component:/gm)]
  .map((match) => match[1])
  .filter((route) => !route.includes(':'))
const pages = [...new Set([
  ...routes,
  ...articles.map((article) => `/space1/${article.id}`),
  ...frontier.benchmarks.map((benchmark) => `/ai-frontier/benchmarks/${benchmark.id}`),
])]

// GitHub Pages serves extensionless URLs from .html files. These real entries
// avoid using the SPA's 404 fallback for pages that search engines should index.
for (const route of pages) {
  if (route === '/') continue
  const file = path.join(root, 'dist', `${route.slice(1)}.html`)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, html)
}

const escapeXml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;')
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((route) => `  <url><loc>${escapeXml(new URL(route, site).href)}</loc></url>`).join('\n')}
</urlset>
`
await writeFile(path.join(root, 'dist/sitemap.xml'), sitemap)
await writeFile(path.join(root, 'dist/robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`)
console.log(`Basic SEO: ${pages.length} page entries, sitemap.xml and robots.txt generated.`)
