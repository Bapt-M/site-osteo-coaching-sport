import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import About from './About'

const rendre = () => render(<MemoryRouter><About /></MemoryRouter>)

test('rend le titre de section', () => {
  rendre()
  expect(screen.getByRole('heading', { name: /approche/i })).toBeInTheDocument()
})

test('« En savoir plus » mène à la page Histoire, pas à une section absente de l’accueil', () => {
  rendre()
  expect(screen.getByRole('link', { name: /En savoir plus/i })).toHaveAttribute('href', '/histoire')
})

test("rend l'image avec alt text", () => {
  rendre()
  expect(screen.getByAltText(/Emmanuel Krieger/i)).toBeInTheDocument()
})
