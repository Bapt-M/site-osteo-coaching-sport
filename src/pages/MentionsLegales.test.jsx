import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MentionsLegales from './MentionsLegales'
import { A_COMPLETER } from '../content/data/mentions'

function renderPage() {
  return render(<MemoryRouter><MentionsLegales /></MemoryRouter>)
}

test('rend les rubriques obligatoires', () => {
  renderPage()
  for (const t of ['Éditeur du site', 'Directeur de la publication', 'Hébergeur',
                   'Propriété intellectuelle', 'Données personnelles', 'Responsabilité']) {
    expect(screen.getByText(t)).toBeInTheDocument()
  }
})

test('identifie l’éditeur et l’hébergeur', () => {
  renderPage()
  expect(screen.getAllByText(/Emmanuel Krieger/).length).toBeGreaterThan(0)
  expect(screen.getByText(/krieger\.manu@orange\.fr/)).toBeInTheDocument()
  expect(screen.getByText(/Netlify, Inc\./)).toBeInTheDocument()
})

test('signale visiblement les identifiants légaux manquants', () => {
  renderPage()
  // SIRET, TVA, ADELI et statut juridique ne peuvent pas être devinés
  expect(screen.getAllByText(A_COMPLETER).length).toBe(4)
})
