import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import KinesportFurd from './KinesportFurd'
import { ESPACES } from '../content/data/remise'

function Wrapper({ children }) { return <MemoryRouter>{children}</MemoryRouter> }

test('affiche le titre et l’introduction', () => {
  render(<KinesportFurd />, { wrapper: Wrapper })
  expect(screen.getByRole('heading', { level: 1, name: /remise en forme/i })).toBeInTheDocument()
  expect(screen.getByText(/programme adapté, réaliste et évolutif/i)).toBeInTheDocument()
})

test('présente chaque espace de la salle avec toutes ses photos', () => {
  render(<KinesportFurd />, { wrapper: Wrapper })
  for (const espace of ESPACES) {
    expect(screen.getByRole('heading', { name: espace.title })).toBeInTheDocument()
    for (const { alt } of espace.photos) expect(screen.getByAltText(alt)).toBeInTheDocument()
  }
})

test('le bouton de contact ouvre un e-mail', () => {
  render(<KinesportFurd />, { wrapper: Wrapper })
  expect(screen.getByRole('link', { name: /me contacter/i }).getAttribute('href'))
    .toMatch(/^mailto:krieger\.manu@orange\.fr\?subject=/)
})
