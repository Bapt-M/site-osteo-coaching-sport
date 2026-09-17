import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from './Navbar'

test('rend les liens de navigation', () => {
  render(<MemoryRouter initialEntries={['/histoire']}><Navbar /></MemoryRouter>)
  expect(screen.getAllByText('Histoire & formation').length).toBeGreaterThan(0)
  expect(screen.getAllByText('Prendre rendez-vous').length).toBeGreaterThan(0)
})

test('rend le bouton menu mobile', () => {
  render(<MemoryRouter><Navbar /></MemoryRouter>)
  expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument()
})
