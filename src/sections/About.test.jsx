import { render, screen } from '@testing-library/react'
import About from './About'

test('rend le titre de section', () => {
  render(<About />)
  expect(screen.getByRole('heading', { name: /approche/i })).toBeInTheDocument()
})

test('rend le lien En savoir plus', () => {
  render(<About />)
  expect(screen.getByText(/En savoir plus/i)).toBeInTheDocument()
})

test("rend l'image avec alt text", () => {
  render(<About />)
  expect(screen.getByAltText(/Emmanuel Krieger/i)).toBeInTheDocument()
})
