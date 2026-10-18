import { existsSync } from 'node:fs'
import { PAGES, DEFAUTS, ACTUALITES, CHAMPS, enParagraphes, lireListe } from './registre'
import { lienValide } from '../pages/admin/Champ'

test('toutes les clés sont uniques et pourvues', () => {
  const champs = [...PAGES.flatMap(p => p.groupes.flatMap(g => g.champs)), ...ACTUALITES.champs]
  const cles = champs.map(c => c.cle)
  expect(new Set(cles).size).toBe(cles.length)
  expect(champs.filter(c => c.defaut === undefined || c.defaut === null)).toEqual([])
  expect(Object.keys(DEFAUTS).length).toBe(cles.length)
})

test('le bloc contact et horaires est éditable', () => {
  const accueil = PAGES.find(p => p.id === 'accueil')
  const cles = accueil.groupes.flatMap(g => g.champs.map(c => c.cle))
  for (const c of ['contact.adresse', 'contact.mail', 'contact.horaires.titre', 'contact.horaires']) {
    expect(cles).toContain(c)
  }
  expect(DEFAUTS['contact.adresse']).toContain('Furdenheim')
  expect(lireListe(DEFAUTS['contact.horaires'], 'contact.horaires')[5]).toEqual({ jour: 'Samedi', horaire: '08:00 – 12:00' })
})

test('découpe les blocs multi-paragraphes', () => {
  expect(enParagraphes('un\n\ndeux\n\n\ntrois')).toEqual(['un', 'deux', 'trois'])
  expect(enParagraphes('')).toEqual([])
})

test('le contact passe par l’e-mail, plus par le téléphone', () => {
  expect(DEFAUTS['contact.mail']).toBe('krieger.manu@orange.fr')
  expect(Object.values(DEFAUTS).join(' ')).not.toContain('61 19 64 84')
})

test('les textes Actualités ont leur propre onglet, hors de la page Accueil', () => {
  expect(ACTUALITES.champs.map(c => c.cle)).toEqual(['actu.titre', 'actu.facebook.lien'])
  const accueil = PAGES.find(p => p.id === 'accueil')
  expect(accueil.groupes.find(g => g.id === 'actualites')).toBeUndefined()
  expect(DEFAUTS['actu.titre']).toBe('Actualités')
  expect(DEFAUTS['actu.facebook.lien']).toBe('')
})

test('les mentions légales signalent le contenu Facebook chargé à la demande', () => {
  const fb = lireListe(DEFAUTS['ml.paragraphes'], 'ml.paragraphes').find(p => p.titre === 'Contenus Facebook')
  expect(fb.texte).toMatch(/Facebook/)
  expect(fb.texte).toMatch(/cookies/)
})

test('les fiches ne sont plus des textes du registre', () => {
  const cles = Object.keys(DEFAUTS)
  expect(cles.filter(c => /^(hommage|temoignage|temoin)\.\d+\./.test(c))).toEqual([])
  for (const c of ['hommages.surtitre', 'hommages.titre1', 'temoignages.titre', 'temoins.surtitre', 'temoins.lien1']) {
    expect(cles).toContain(c)
  }
})

test('les liens Hommages et Témoignages de la hero sont éditables', () => {
  const bandeau = PAGES.find(p => p.id === 'accueil').groupes.find(g => g.id === 'hero')
  expect(bandeau.champs.map(c => c.cle)).toEqual(expect.arrayContaining(['hero.hommages', 'hero.temoignages']))
  expect(DEFAUTS['hero.hommages']).toBe('HOMMAGES')
  expect(DEFAUTS['hero.temoignages']).toBe('TÉMOIGNAGES')
})

test('ostéopathes et partenaires se gèrent dans leur page', () => {
  const groupe = (page, id) => PAGES.find(p => p.id === page).groupes.find(g => g.id === id)
  expect(groupe('bilan', 'equipe').fiches).toBe('osteopathe')
  expect(groupe('suivi', 'partenaires').fiches).toBe('partenaire')
})

/** Toutes les valeurs d'un champ, listes et galeries comprises, par type. */
function valeursParType(type) {
  return CHAMPS.flatMap(c => {
    if (c.type === type) return [c.defaut]
    if (c.type !== 'liste') return []
    return lireListe(c.defaut, c.cle).flatMap(e => c.colonnes.flatMap(col =>
      col.type === type ? [e[col.prop]]
        : col.type === 'images' && type === 'image' ? (e[col.prop] ?? []).map(p => p.image)
        : []))
  })
}

test('chaque photo d’origine existe dans le site', () => {
  const images = valeursParType('image').filter(Boolean)
  expect(images.length).toBeGreaterThan(50)
  expect(images.filter(src => !existsSync(`public${src}`))).toEqual([])
})

test('chaque lien d’origine est valide et mène à une page existante', () => {
  const routes = new Set(['/', '/histoire', '/bilan-osteopathique', '/suivi-sportif', '/projet-sportif',
                          '/kinesport-furd', '/intervention-entreprise', '/mentions-legales'])
  const liens = valeursParType('lien')
  expect(liens.filter(l => !lienValide(l))).toEqual([])
  expect(liens.filter(l => l.startsWith('/') && !routes.has(l.split('#')[0]))).toEqual([])
})

test('chaque liste d’origine se relit telle quelle', () => {
  for (const c of CHAMPS.filter(c => c.type === 'liste')) {
    expect(lireListe(c.defaut, c.cle).length, c.cle).toBeGreaterThan(0)
  }
})

test('une liste abîmée retombe sur la liste d’origine', () => {
  expect(lireListe('{pas du json', 'bilan.etapes')).toEqual(lireListe(DEFAUTS['bilan.etapes'], 'bilan.etapes'))
  expect(lireListe('"texte"', 'bilan.etapes')).toHaveLength(3)
  expect(lireListe('[]', 'bilan.etapes')).toEqual([])
})
