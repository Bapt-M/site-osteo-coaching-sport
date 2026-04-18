import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from './Navbar'

test('rend les liens de navigation', () => {
  render(<MemoryRouter><Navbar /></MemoryRouter>)
  expect(screen.getByText('Histoire')).toBeInTheDocument()
  expect(screen.getByText('Prendre rendez-vous')).toBeInTheDocument()
})

test('rend le bouton menu mobile', () => {
  render(<MemoryRouter><Navbar /></MemoryRouter>)
  expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument()
})
