import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

// Generate route-specific HTML and discovery files from one site configuration.
const root = new URL('../', import.meta.url)
const site = JSON.parse(await readFile(new URL('src/data/site.json', root), 'utf8'))
const template = await readFile(new URL('dist/index.html', root), 'utf8')
const escape = (value) => value.replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[c])

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${site.url}/#organization`,
      name: site.name,
      url: `${site.url}/`,
      description: site.description,
      logo: {
        '@type': 'ImageObject',
        url: `${site.url}/preambl-logo.png`,
        width: 512,
        height: 512,
      },
      sameAs: ['https://github.com/Preambl-ai'],
    },
    {
      '@type': 'WebSite',
      '@id': `${site.url}/#website`,
      name: site.name,
      url: `${site.url}/`,
      publisher: { '@id': `${site.url}/#organization` },
    },
  ],
}

for (const [path, page] of Object.entries(site.pages)) {
  const canonical = `${site.url}${path}`
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(page.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*("\s*\/?>)/, `$1${escape(page.description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*("\s*\/?>)/, `$1${escape(page.title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*("\s*\/?>)/, `$1${escape(page.description)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*("\s*\/?>)/, `$1${canonical}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*("\s*\/?>)/, `$1${escape(page.title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*("\s*\/?>)/, `$1${escape(page.description)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*("\s*\/?>)/, `$1${canonical}$2`)

  const data = JSON.stringify(structuredData).replace(/</g, '\\u003c')
  html = html.replace('</head>', `<script type="application/ld+json">${data}</script>\n</head>`)

  // Visible initial content for every visitor. React replaces it on startup.
  // It is also usable when scripts fail or JavaScript is disabled.
  const heading = path === '/' ? 'Preambl — AI inference hardware' : 'Preambl-0'
  const content = path === '/' ? site.description : page.description
  const initialContent = `<div id="root"><main class="container" style="padding-top:96px;padding-bottom:96px"><a href="/">Preambl</a><h1>${escape(heading)}</h1><p>${escape(content)}</p><nav aria-label="Site"><a href="/">Home</a> ·<a href="https://github.com/Preambl-ai">GitHub</a></nav></main></div>`
  html = html.replace('<div id="root"></div>', initialContent)

  const destination = new URL(path === '/' ? 'dist/index.html' : `dist${path}/index.html`, root)
  await mkdir(new URL('./', destination), { recursive: true })
  await writeFile(destination, html)
  console.log(`Generated ${fileURLToPath(destination)}`)
}

const urls = Object.keys(site.pages).map((path) => `  <url><loc>${site.url}${path}</loc></url>`).join('\n')
await writeFile(new URL('dist/sitemap.xml', root), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)
await writeFile(new URL('dist/robots.txt', root), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`)
