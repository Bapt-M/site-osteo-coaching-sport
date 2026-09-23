import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PAGES, pagePour, SITE } from './seo'

/** Routes publiques déclarées dans le routeur, /admin et le joker exclus. */
function routesPubliques() {
  // Vitest s'exécute depuis la racine du projet ; import.meta.url n'est pas
  // un chemin de fichier sous jsdom.
  const app = readFileSync(resolve(process.cwd(), 'src/App.jsx'), 'utf8')
  return [...app.matchAll(/<Route\s+path="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((r) => !r.startsWith('/admin') && r !== '*')
}

test('chaque route publique a ses métadonnées', () => {
  for (const route of routesPubliques()) {
    expect(pagePour(route), `route sans entrée dans seo.js : ${route}`).not.toBeNull()
  }
})

test('aucune métadonnée ne décrit une route disparue', () => {
  const routes = routesPubliques()
  for (const page of PAGES) {
    expect(routes, `décrite dans seo.js mais absente du routeur : ${page.chemin}`).toContain(page.chemin)
  }
})

test('les titres tiennent dans ce que Google affiche', () => {
  for (const page of PAGES) {
    expect(page.titre.length, `titre trop long : ${page.chemin}`).toBeLessThanOrEqual(60)
  }
})

test('les descriptions sont exploitables', () => {
  for (const page of PAGES) {
    // Trop courte, Google l'ignore ; trop longue, il la tronque.
    expect(page.description.length, `description hors bornes : ${page.chemin}`).toBeGreaterThan(50)
    expect(page.description.length, `description hors bornes : ${page.chemin}`).toBeLessThanOrEqual(160)
  }
})

test('la page en construction reste hors de l’index', () => {
  expect(pagePour('/kinesport-furd').indexable).toBe(false)
})

test('le domaine de référence est en https et sans barre finale', () => {
  expect(SITE).toMatch(/^https:\/\/[^/]+$/)
})
