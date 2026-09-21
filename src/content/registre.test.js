import { PAGES, DEFAUTS, enParagraphes } from './registre'

test('toutes les clés sont uniques et pourvues', () => {
  const champs = PAGES.flatMap(p => p.groupes.flatMap(g => g.champs))
  const cles = champs.map(c => c.cle)
  expect(new Set(cles).size).toBe(cles.length)
  expect(champs.filter(c => c.defaut === undefined || c.defaut === null)).toEqual([])
  expect(Object.keys(DEFAUTS).length).toBe(cles.length)
})

test('le bloc contact et horaires est éditable', () => {
  const accueil = PAGES.find(p => p.id === 'accueil')
  const cles = accueil.groupes.flatMap(g => g.champs.map(c => c.cle))
  for (const c of ['contact.adresse', 'contact.mail', 'contact.horaires.titre', 'jour.0.day', 'jour.5.hours']) {
    expect(cles).toContain(c)
  }
  expect(DEFAUTS['contact.adresse']).toContain('Furdenheim')
  expect(DEFAUTS['jour.5.hours']).toBe('08:00 – 12:00')
})

test('découpe les blocs multi-paragraphes', () => {
  expect(enParagraphes('un\n\ndeux\n\n\ntrois')).toEqual(['un', 'deux', 'trois'])
  expect(enParagraphes('')).toEqual([])
})

test('le contact passe par l’e-mail, plus par le téléphone', () => {
  expect(DEFAUTS['contact.mail']).toBe('krieger.manu@orange.fr')
  expect(Object.values(DEFAUTS).join(' ')).not.toContain('61 19 64 84')
})
