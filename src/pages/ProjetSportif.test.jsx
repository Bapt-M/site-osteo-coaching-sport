import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProjetSportif from './ProjetSportif'

function Wrapper({ children }) { return <MemoryRouter>{children}</MemoryRouter> }

test('affiche le titre principal', () => {
  render(<ProjetSportif />, { wrapper: Wrapper })
  expect(screen.getByRole('heading', { name: /projet sportif/i })).toBeInTheDocument()
})

test('affiche la prise en charge globale', () => {
  render(<ProjetSportif />, { wrapper: Wrapper })
  expect(screen.getByText(/préparation physique/i)).toBeInTheDocument()
})

test('affiche les athlètes de référence', () => {
  render(<ProjetSportif />, { wrapper: Wrapper })
  expect(screen.getAllByText(/julien motz/i).length).toBeGreaterThan(0)
})
