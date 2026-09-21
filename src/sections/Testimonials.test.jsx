import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Testimonials from './Testimonials'

// La section contient désormais des <Link> : il lui faut un routeur.
function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

test('rend les 3 témoignages', () => {
  renderWithRouter(<Testimonials />)
  expect(screen.getByText(/Matthieu Lorentz/i)).toBeInTheDocument()
  expect(screen.getByText(/Richard Billant/i)).toBeInTheDocument()
  expect(screen.getByText(/Paris McCurdy/i)).toBeInTheDocument()
})

test('cite de vrais extraits, pas des textes fictifs', () => {
  renderWithRouter(<Testimonials />)
  expect(screen.getByText(/repousser mes limites/i)).toBeInTheDocument()
  expect(screen.queryByText(/Michel Perraud/i)).not.toBeInTheDocument()
})

test('renvoie vers les hommages et les témoignages de la page Histoire', () => {
  renderWithRouter(<Testimonials />)
  expect(screen.getByRole('link', { name: /témoignages/i })).toHaveAttribute('href', '/histoire#temoignages')
  expect(screen.getByRole('link', { name: /hommages/i })).toHaveAttribute('href', '/histoire#hommages')
})
