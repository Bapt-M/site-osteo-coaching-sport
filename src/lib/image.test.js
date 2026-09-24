import { dimensionsReduites } from './image'

test('réduit le plus grand côté à 1600 px en gardant les proportions', () => {
  expect(dimensionsReduites(4032, 3024)).toEqual({ largeur: 1600, hauteur: 1200 })
  expect(dimensionsReduites(3024, 4032)).toEqual({ largeur: 1200, hauteur: 1600 })
})

test('n\'agrandit jamais une petite image', () => {
  expect(dimensionsReduites(800, 600)).toEqual({ largeur: 800, hauteur: 600 })
})

test('arrondit au pixel', () => {
  expect(dimensionsReduites(3000, 1999)).toEqual({ largeur: 1600, hauteur: 1066 })
})

test('accepte une autre limite', () => {
  expect(dimensionsReduites(1000, 500, 400)).toEqual({ largeur: 400, hauteur: 200 })
})
