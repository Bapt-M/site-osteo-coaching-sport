import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SuiviSportif from './SuiviSportif'

function Wrapper({ children }) { return <MemoryRouter>{children}</MemoryRouter> }

test('affiche le titre principal', () => {
  render(<SuiviSportif />, { wrapper: Wrapper })
  expect(screen.getByRole('heading', { name: /suivi sportif/i })).toBeInTheDocument()
})

test('affiche la liste des modalités de suivi', () => {
  render(<SuiviSportif />, { wrapper: Wrapper })
  expect(screen.getByText(/suivi régulier en cabinet/i)).toBeInTheDocument()
})

test('affiche la section athlètes SIG', () => {
  render(<SuiviSportif />, { wrapper: Wrapper })
  expect(screen.getByText(/SIG Basket Strasbourg/i)).toBeInTheDocument()
})
