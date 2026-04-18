import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Services from './Services'

function Wrapper({ children }) { return <MemoryRouter>{children}</MemoryRouter> }

test('rend les 4 services', () => {
  render(<Services />, { wrapper: Wrapper })
  expect(screen.getByText(/Ostéopathie du sport/i)).toBeInTheDocument()
  expect(screen.getByText(/Coaching personnalisé/i)).toBeInTheDocument()
  expect(screen.getByText(/Préparation physique/i)).toBeInTheDocument()
  expect(screen.getByText(/Suivi de performance/i)).toBeInTheDocument()
})

test('ouvre un service au clic', () => {
  render(<Services />, { wrapper: Wrapper })
  const item = screen.getByText(/Ostéopathie du sport/i)
  fireEvent.click(item)
  expect(screen.getByText(/douleurs musculaires/i)).toBeInTheDocument()
})
