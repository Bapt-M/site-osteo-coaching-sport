import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BilanOsteopathique from './BilanOsteopathique'

function Wrapper({ children }) { return <MemoryRouter>{children}</MemoryRouter> }

test('affiche le titre principal', () => {
  render(<BilanOsteopathique />, { wrapper: Wrapper })
  expect(screen.getByRole('heading', { name: /bilan/i })).toBeInTheDocument()
})

test('affiche la section premier rendez-vous', () => {
  render(<BilanOsteopathique />, { wrapper: Wrapper })
  expect(screen.getByRole('heading', { name: /premier rendez-vous/i })).toBeInTheDocument()
})

test('affiche le CTA de prise de rendez-vous', () => {
  render(<BilanOsteopathique />, { wrapper: Wrapper })
  expect(screen.getByRole('link', { name: /rendez-vous/i })).toBeInTheDocument()
})
