import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Footer from './Footer'

test('rend la marque et les liens légaux', () => {
  render(<MemoryRouter><Footer /></MemoryRouter>)
  expect(screen.getByText(/OSTÉO/i)).toBeInTheDocument()
  expect(screen.getByText(/Mentions légales/i)).toBeInTheDocument()
})
