import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Hero from './Hero'

// Le hero rend deux variantes (mobile + desktop) filtrées par media query :
// en jsdom les deux sont dans le DOM, d'où les requêtes `getAll*`.
function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

test('rend le logo', () => {
  renderWithRouter(<Hero />)
  expect(screen.getAllByAltText(/Ostéo et Coaching/i).length).toBeGreaterThan(0)
})

test('rend la phrase signature', () => {
  renderWithRouter(<Hero />)
  expect(screen.getAllByText(/UN DES HOMMES DE L'OMBRE/i).length).toBeGreaterThan(0)
})

test('rend le nom Emmanuel Krieger', () => {
  renderWithRouter(<Hero />)
  expect(screen.getByText(/EMMANUEL KRIEGER/i)).toBeInTheDocument()
})

test('rend les 4 services feuilles', () => {
  renderWithRouter(<Hero />)
  expect(screen.getByText(/SUIVI DES SPORTIFS/i)).toBeInTheDocument()
  expect(screen.getByText(/PROJET SPORTIF/i)).toBeInTheDocument()
  expect(screen.getByText(/BILAN, TRAITEMENT/i)).toBeInTheDocument()
  expect(screen.getByText(/PROGRAMME ET SUIVI/i)).toBeInTheDocument()
})

test('rend le lien histoire et formation', () => {
  renderWithRouter(<Hero />)
  expect(screen.getByText(/HISTOIRE ET FORMATION/i)).toBeInTheDocument()
})
