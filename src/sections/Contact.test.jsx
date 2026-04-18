import { render, screen } from '@testing-library/react'
import Contact from './Contact'

test('rend le titre Prendre rendez-vous', () => {
  render(<Contact />)
  expect(screen.getByText(/Prendre rendez-vous/i)).toBeInTheDocument()
})

test('rend les horaires', () => {
  render(<Contact />)
  expect(screen.getByText(/Lundi/i)).toBeInTheDocument()
  expect(screen.getByText(/Vendredi/i)).toBeInTheDocument()
})

test('rend le CTA de réservation', () => {
  render(<Contact />)
  expect(screen.getByText(/Réserver en ligne/i)).toBeInTheDocument()
})
