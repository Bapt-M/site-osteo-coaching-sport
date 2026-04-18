import { render, screen } from '@testing-library/react'
import Testimonials from './Testimonials'

test('rend les 3 témoignages', () => {
  render(<Testimonials />)
  expect(screen.getByText(/Michel Perraud/i)).toBeInTheDocument()
  expect(screen.getByText(/Sophie Martin/i)).toBeInTheDocument()
  expect(screen.getByText(/Thomas Lebrun/i)).toBeInTheDocument()
})

test('rend le titre de section', () => {
  render(<Testimonials />)
  expect(screen.getByText(/Ce que disent/i)).toBeInTheDocument()
})
