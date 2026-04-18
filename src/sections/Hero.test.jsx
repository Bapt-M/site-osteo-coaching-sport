import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Hero from './Hero'

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

test('rend le logo', () => {
  renderWithRouter(<Hero />)
  expect(screen.getByAltText(/Ostéo et Coaching/i)).toBeInTheDocument()
})

test('rend la phrase signature', () => {
  renderWithRouter(<Hero />)
  expect(screen.getByText(/UN DES HOMMES DE L'OMBRE/i)).toBeInTheDocument()
})

test('rend le nom Emmanuel Krieger', () => {
  renderWithRouter(<Hero />)
  expect(screen.getByText(/EMMANUEL KRIEGER/i)).toBeInTheDocument()
})

test('rend les 5 services feuilles', () => {
  renderWithRouter(<Hero />)
  expect(screen.getByText(/SUIVI SPORTIF/i)).toBeInTheDocument()
  expect(screen.getByText(/PERSONAL/i)).toBeInTheDocument()
})
