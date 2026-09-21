import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Admin from './Admin'

function renderAdmin() {
  return render(<MemoryRouter><Admin /></MemoryRouter>)
}

test('présente un formulaire de connexion', async () => {
  renderAdmin()
  expect(await screen.findByLabelText(/adresse e-mail/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
})

test('n’expose aucun contenu éditable avant connexion', async () => {
  renderAdmin()
  await screen.findByLabelText(/adresse e-mail/i)
  expect(screen.queryByRole('button', { name: /enregistrer/i })).not.toBeInTheDocument()
})
