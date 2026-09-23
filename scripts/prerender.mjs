#!/usr/bin/env node
/**
 * prerender.mjs — exécuté après `vite build`, cf. package.json.
 *
 * Une application à page unique ne sert qu'un seul index.html : les huit pages
 * partagent donc le même titre et la même description tant que le JavaScript
 * n'a pas tourné. Les robots savent exécuter du JavaScript, mais plus tard et
 * moins sûrement — et le titre lu au moment de l'indexation est souvent celui
 * d'origine.
 *
 * Ce script écrit un index.html par route, avec ses propres métadonnées. Le
 * corps de page reste inchangé : React prend le relais côté navigateur comme
 * avant. Netlify sert le fichier correspondant au chemin demandé, la règle de
 * repli /* ne s'appliquant qu'à défaut de fichier.
 *
 * Les pages sont écrites en `<route>.html` à la racine, et non en
 * `<route>/index.html` : cette seconde forme fait rediriger /histoire vers
 * /histoire/ en 301, ce qui ajoute un aller-retour à chaque lien interne et
 * décale l'URL servie de la balise canonical.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PAGES, SITE } from '../src/content/seo.js'

const RACINE = dirname(dirname(fileURLToPath(import.meta.url)))
const DIST = join(RACINE, 'dist')

/** Échappe une valeur destinée à un attribut HTML. */
const attr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/** Remplace le contenu d'une balise meta identifiée par son nom ou sa propriété. */
function meta(html, cle, valeur) {
  const motif = new RegExp(`(<meta\\s+(?:name|property)="${cle}"\\s+content=")[^"]*(")`)
  if (!motif.test(html)) throw new Error(`balise meta introuvable : ${cle}`)
  return html.replace(motif, `$1${attr(valeur)}$2`)
}

/** Garde-fou : toute route de App.jsx doit être décrite dans seo.js. */
function verifierRoutes() {
  const app = readFileSync(join(RACINE, 'src/App.jsx'), 'utf8')
  const routes = [...app.matchAll(/<Route\s+path="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((r) => !r.startsWith('/admin') && r !== '*')

  const declarees = new Set(PAGES.map((p) => p.chemin))
  const oubliees = routes.filter((r) => !declarees.has(r))
  const fantomes = PAGES.map((p) => p.chemin).filter((c) => !routes.includes(c))

  if (oubliees.length || fantomes.length) {
    const details = [
      oubliees.length ? `absentes de seo.js : ${oubliees.join(', ')}` : '',
      fantomes.length ? `déclarées mais sans route : ${fantomes.join(', ')}` : '',
    ].filter(Boolean).join(' | ')
    throw new Error(`src/content/seo.js et App.jsx divergent — ${details}`)
  }
}

function prerendre() {
  const gabarit = readFileSync(join(DIST, 'index.html'), 'utf8')

  for (const page of PAGES) {
    const url = SITE + (page.chemin === '/' ? '/' : page.chemin)
    let html = gabarit

    html = html.replace(/<title>[^<]*<\/title>/, `<title>${attr(page.titre)}</title>`)
    html = meta(html, 'description', page.description)
    html = meta(html, 'og:title', page.titre)
    html = meta(html, 'og:description', page.description)
    html = meta(html, 'og:url', url)

    // La balise canonical désigne l'adresse de référence de la page : sans
    // elle, les variantes d'URL (paramètres de campagne, /index.html) sont
    // vues comme autant de doublons.
    const entetes = [`<link rel="canonical" href="${attr(url)}">`]
    if (page.indexable === false) entetes.push('<meta name="robots" content="noindex, follow">')
    html = html.replace('</head>', `  ${entetes.join('\n  ')}\n</head>`)

    const fichier = page.chemin === '/' ? 'index.html' : `${page.chemin.slice(1)}.html`
    writeFileSync(join(DIST, fichier), html)
  }
}

function sitemap() {
  const lignes = ['<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  const jour = new Date().toISOString().slice(0, 10)

  for (const page of PAGES.filter((p) => p.indexable !== false)) {
    lignes.push('  <url>',
      `    <loc>${SITE}${page.chemin}</loc>`,
      `    <lastmod>${jour}</lastmod>`,
      `    <priority>${page.priorite ?? '0.8'}</priority>`,
      '  </url>')
  }
  lignes.push('</urlset>')
  writeFileSync(join(DIST, 'sitemap.xml'), lignes.join('\n') + '\n')
}

verifierRoutes()
prerendre()
sitemap()

const indexees = PAGES.filter((p) => p.indexable !== false).length
console.log(`  prérendu : ${PAGES.length} pages — ${indexees} au sitemap, ${PAGES.length - indexees} en noindex`)
