import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SliderActions from './SliderActions'

function Wrapper({ children }) { return <MemoryRouter>{children}</MemoryRouter> }

test('rend le premier slide par défaut', () => {
  render(<SliderActions />, { wrapper: Wrapper })
  expect(screen.getByText(/Ostéopathie/i)).toBeInTheDocument()
})

test('rend les 4 slides dans le DOM', () => {
  render(<SliderActions />, { wrapper: Wrapper })
  expect(screen.getByText(/Coaching/i)).toBeInTheDocument()
  expect(screen.getByText(/Préparation/i)).toBeInTheDocument()
  expect(screen.getByText(/Suivi de/i)).toBeInTheDocument()
})

test('rend les 4 dots de navigation', () => {
  render(<SliderActions />, { wrapper: Wrapper })
  expect(screen.getAllByRole('button', { name: /Slide/i })).toHaveLength(4)
})
