import { FICHES_ORIGINE } from './fiches'
import { HOMMAGES, TEMOIGNAGES } from './histoire'

test('reprend les 2 hommages puis les 3 témoignages, dans l’ordre', () => {
  expect(FICHES_ORIGINE.map(f => [f.type, f.nom, f.ordre])).toEqual([
    ['hommage', 'Fred FORTE', 0],
    ['hommage', 'Thierry RUPERT', 1],
    ['temoignage', 'Matthieu LORENTZ', 0],
    ['temoignage', 'Richard BILLANT', 1],
    ['temoignage', 'Paris McCURDY', 2],
  ])
})

test('hommage : citation en titre, paragraphes en texte, images légendées', () => {
  const fred = FICHES_ORIGINE[0]
  expect(fred.titre).toBe(HOMMAGES[0].citation)
  expect(fred.texte).toBe(HOMMAGES[0].paragraphes.join('\n\n'))
  expect(fred.images).toEqual(HOMMAGES[0].images.map(i => ({ chemin: i.src, legende: i.legende })))
})

test('témoignage : extrait en titre, image avec sa description, langue dans la fonction', () => {
  const [lorentz, billant, paris] = FICHES_ORIGINE.slice(2)
  expect(lorentz.titre).toBe(TEMOIGNAGES[0].extrait)
  expect(lorentz.images).toEqual([])
  expect(billant.images).toEqual([{ chemin: TEMOIGNAGES[1].img, legende: TEMOIGNAGES[1].imgAlt }])
  expect(paris.fonction).toBe('Ancien basketteur professionnel · témoignage en anglais')
})

test('chaque fiche a un identifiant stable', () => {
  expect(new Set(FICHES_ORIGINE.map(f => f.id)).size).toBe(5)
})
