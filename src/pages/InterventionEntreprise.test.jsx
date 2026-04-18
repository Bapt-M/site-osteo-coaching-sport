import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import InterventionEntreprise from './InterventionEntreprise'

function Wrapper({ children }) { return <MemoryRouter>{children}</MemoryRouter> }

test('affiche le titre principal', () => {
  render(<InterventionEntreprise />, { wrapper: Wrapper })
  expect(screen.getByRole('heading', { name: /intervention/i })).toBeInTheDocument()
})

test('affiche la section bien-être au travail', () => {
  render(<InterventionEntreprise />, { wrapper: Wrapper })
  expect(screen.getByText(/bien-être au travail/i)).toBeInTheDocument()
})

test('affiche la section Club Med', () => {
  render(<InterventionEntreprise />, { wrapper: Wrapper })
  expect(screen.getByRole('heading', { name: /club med/i })).toBeInTheDocument()
})
