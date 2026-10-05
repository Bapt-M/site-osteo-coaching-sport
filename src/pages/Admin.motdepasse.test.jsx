import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, beforeEach, afterEach } from 'vitest'
import Admin, { lireJeton, LONGUEUR_MIN_MDP } from './Admin'

/* Faux client Supabase : on pilote la session et les réponses d'auth. */
let auth
let ecouteur
const session = { user: { email: 'manu@exemple.fr' } }

vi.mock('../lib/supabase', () => ({
  supabaseConfigure: true,
  getSupabase: () => Promise.resolve({
    auth,
    from: () => ({ select: () => Promise.resolve({ data: [], error: null }) }),
  }),
}))

beforeEach(() => {
  auth = {
    getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
    onAuthStateChange: vi.fn(cb => {
      ecouteur = cb
      return { data: { subscription: { unsubscribe() {} } } }
    }),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    // Comme le vrai client : un échange réussi ouvre une session.
    verifyOtp: vi.fn(async () => {
      ecouteur('SIGNED_IN', session)
      return { data: { user: session.user, session }, error: null }
    }),
    updateUser: vi.fn(() => Promise.resolve({ error: null })),
  }
})

afterEach(() => window.history.replaceState(null, '', '/'))

function renderAdmin() {
  return render(<MemoryRouter><Admin /></MemoryRouter>)
}

function saisir(libelle, valeur) {
  fireEvent.change(screen.getByLabelText(libelle, { selector: 'input' }), { target: { value: valeur } })
}

function valider(mdp, confirmation = mdp) {
  saisir(/^nouveau mot de passe$/i, mdp)
  saisir(/confirmer/i, confirmation)
  fireEvent.click(screen.getByRole('button', { name: /enregistrer le mot de passe/i }))
}

async function ouvrirLien() {
  window.history.replaceState(null, '', '/admin#recuperation=jeton-123')
  renderAdmin()
  await screen.findByLabelText(/^nouveau mot de passe$/i, { selector: 'input' })
}

test('lireJeton extrait le jeton du fragment', () => {
  expect(lireJeton('#recuperation=abc')).toBe('abc')
  expect(lireJeton('')).toBeNull()
  expect(lireJeton('#autre=1')).toBeNull()
})

test('l’écran de connexion renvoie vers le webmaster en cas d’oubli', async () => {
  renderAdmin()
  expect(await screen.findByText(/demandez un lien de réinitialisation/i)).toBeInTheDocument()
})

test('le lien ne consomme le jeton qu’à la validation du nouveau mot de passe', async () => {
  await ouvrirLien()
  expect(auth.verifyOtp).not.toHaveBeenCalled()
  expect(screen.queryByRole('button', { name: /annuler/i })).not.toBeInTheDocument()

  valider('trop')
  expect(await screen.findByRole('alert')).toHaveTextContent(`${LONGUEUR_MIN_MDP} caractères`)

  valider('un-bon-mot-de-passe', 'un-autre-mot-de-passe')
  expect(await screen.findByRole('alert')).toHaveTextContent(/ne correspondent pas/)
  expect(auth.verifyOtp).not.toHaveBeenCalled()

  valider('un-bon-mot-de-passe')
  expect(await screen.findByRole('status')).toHaveTextContent('manu@exemple.fr')
  expect(auth.verifyOtp).toHaveBeenCalledWith({ token_hash: 'jeton-123', type: 'recovery' })
  expect(auth.updateUser).toHaveBeenCalledWith({ password: 'un-bon-mot-de-passe' })

  fireEvent.click(screen.getByRole('button', { name: /continuer vers l’administration/i }))
  expect(await screen.findByRole('button', { name: /se déconnecter/i })).toBeInTheDocument()
  expect(window.location.hash).toBe('')
})

test('un lien périmé est signalé', async () => {
  auth.verifyOtp.mockResolvedValue({ data: {}, error: { code: 'otp_expired', status: 403, message: 'expired' } })
  await ouvrirLien()
  valider('un-bon-mot-de-passe')
  expect(await screen.findByRole('alert')).toHaveTextContent(/expiré ou a déjà servi/)
  expect(auth.updateUser).not.toHaveBeenCalled()
})

test('après un mot de passe refusé, le nouvel essai ne réutilise pas le jeton', async () => {
  auth.updateUser
    .mockResolvedValueOnce({ error: { code: 'same_password', message: 'New password should be different' } })
  await ouvrirLien()

  valider('un-bon-mot-de-passe')
  expect(await screen.findByRole('alert')).toHaveTextContent(/différent de l’ancien/)

  valider('un-autre-mot-de-passe')
  expect(await screen.findByRole('status')).toBeInTheDocument()
  expect(auth.verifyOtp).toHaveBeenCalledTimes(1)
  expect(auth.updateUser).toHaveBeenCalledTimes(2)
})

test('connecté, « Mot de passe » ouvre le formulaire par-dessus l’éditeur, annulable', async () => {
  auth.getSession.mockResolvedValue({ data: { session } })
  renderAdmin()

  fireEvent.click(await screen.findByRole('button', { name: /^mot de passe$/i }))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: /annuler/i }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(auth.updateUser).not.toHaveBeenCalled()
})

test('connecté, le changement direct n’échange aucun jeton', async () => {
  auth.getSession.mockResolvedValue({ data: { session } })
  renderAdmin()

  fireEvent.click(await screen.findByRole('button', { name: /^mot de passe$/i }))
  valider('un-bon-mot-de-passe')
  expect(await screen.findByRole('status')).toBeInTheDocument()
  expect(auth.verifyOtp).not.toHaveBeenCalled()
  expect(auth.updateUser).toHaveBeenCalledWith({ password: 'un-bon-mot-de-passe' })
})
