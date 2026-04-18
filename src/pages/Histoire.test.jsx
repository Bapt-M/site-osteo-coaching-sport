import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Histoire from './Histoire'

function Wrapper({ children }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

test('affiche le titre principal', () => {
  render(<Histoire />, { wrapper: Wrapper })
  expect(screen.getByRole('heading', { name: /histoire/i })).toBeInTheDocument()
})

test('affiche la section origines', () => {
  render(<Histoire />, { wrapper: Wrapper })
  expect(screen.getByText(/kleinfrankenheim/i)).toBeInTheDocument()
})

test('affiche la section parcours professionnel', () => {
  render(<Histoire />, { wrapper: Wrapper })
  expect(screen.getByText(/sig/i)).toBeInTheDocument()
})

test('affiche la section diplômes', () => {
  render(<Histoire />, { wrapper: Wrapper })
  expect(screen.getByText(/diplômes/i)).toBeInTheDocument()
})
