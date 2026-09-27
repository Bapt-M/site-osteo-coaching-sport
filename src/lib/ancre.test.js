import { garderAncre } from './ancre'

/** Une image « en cours de chargement » : jsdom ne charge rien, on force `complete`. */
function image(enCours = true) {
  const img = document.createElement('img')
  Object.defineProperty(img, 'complete', { value: !enCours })
  return img
}

let cible
beforeEach(() => {
  document.body.innerHTML = ''
  cible = document.createElement('section')
  cible.id = 'temoignages'
  cible.scrollIntoView = vi.fn()
})

test('vise la cible tout de suite', () => {
  document.body.append(cible)
  garderAncre('temoignages')
  expect(cible.scrollIntoView).toHaveBeenCalledWith({ block: 'start' })
})

test('revise la cible à chaque image chargée au-dessus d’elle, pas en dessous', () => {
  const dessus = image(), dessous = image()
  document.body.append(dessus, cible, dessous)
  garderAncre('temoignages')
  dessus.dispatchEvent(new Event('load'))
  expect(cible.scrollIntoView).toHaveBeenCalledTimes(2)
  dessous.dispatchEvent(new Event('load'))
  expect(cible.scrollIntoView).toHaveBeenCalledTimes(2)
})

test('une image en erreur change aussi la hauteur : on revise', () => {
  const dessus = image()
  document.body.append(dessus, cible)
  garderAncre('temoignages')
  dessus.dispatchEvent(new Event('error'))
  expect(cible.scrollIntoView).toHaveBeenCalledTimes(2)
})

test('laisse la main dès que le visiteur fait défiler lui-même', () => {
  const dessus = image()
  document.body.append(dessus, cible)
  garderAncre('temoignages')
  window.dispatchEvent(new Event('wheel'))
  dessus.dispatchEvent(new Event('load'))
  expect(cible.scrollIntoView).toHaveBeenCalledTimes(1)
})

test('s’arrête au démontage', () => {
  const dessus = image()
  document.body.append(dessus, cible)
  const arreter = garderAncre('temoignages')
  arreter()
  dessus.dispatchEvent(new Event('load'))
  expect(cible.scrollIntoView).toHaveBeenCalledTimes(1)
})

test('abandonne après le délai de garde', () => {
  vi.useFakeTimers()
  const dessus = image()
  document.body.append(dessus, cible)
  garderAncre('temoignages')
  vi.advanceTimersByTime(8000)
  dessus.dispatchEvent(new Event('load'))
  expect(cible.scrollIntoView).toHaveBeenCalledTimes(1)
  vi.useRealTimers()
})

test('cible absente : ne fait rien', () => {
  expect(() => garderAncre('absente')()).not.toThrow()
})
