import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Footer from './Footer'

test('rend la marque et les liens légaux', () => {
  render(<MemoryRouter><Footer /></MemoryRouter>)
  expect(screen.getAllByText(/OSTÉO/i).length).toBeGreaterThan(0)
  expect(screen.getAllByText(/Mentions légales/i).length).toBeGreaterThan(0)
})
