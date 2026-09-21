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
  expect(screen.getAllByText(/kleinfrankenheim/i).length).toBeGreaterThan(0)
})

test('affiche la section parcours professionnel', () => {
  render(<Histoire />, { wrapper: Wrapper })
  expect(screen.getAllByText(/SIG Strasbourg/).length).toBeGreaterThan(0)
})

test('affiche la section diplômes', () => {
  render(<Histoire />, { wrapper: Wrapper })
  expect(screen.getAllByText(/diplômes/i).length).toBeGreaterThan(0)
})

test('affiche les hommages', () => {
  render(<Histoire />, { wrapper: Wrapper })
  expect(screen.getAllByText(/Fred FORTE/).length).toBeGreaterThan(0)
  expect(screen.getAllByText(/Thierry RUPERT/).length).toBeGreaterThan(0)
})

test('affiche les témoignages', () => {
  render(<Histoire />, { wrapper: Wrapper })
  expect(screen.getByText(/Matthieu LORENTZ/)).toBeInTheDocument()
  expect(screen.getByText(/Richard BILLANT/)).toBeInTheDocument()
  expect(screen.getByText(/Paris McCURDY/)).toBeInTheDocument()
})

test('affiche la galerie padel', () => {
  render(<Histoire />, { wrapper: Wrapper })
  expect(screen.getAllByText(/une nouvelle passion/i).length).toBeGreaterThan(0)
  expect(screen.getAllByAltText(/Club Med Opio/i).length).toBeGreaterThan(0)
})
