import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, beforeEach, afterEach } from 'vitest'
import Admin, { lireLienAuth, LONGUEUR_MIN_MDP } from './Admin'

/* Faux client Supabase : on pilote la session et les événements d'auth. */
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
    resetPasswordForEmail: vi.fn(() => Promise.resolve({ error: null })),
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

test('lireLienAuth reconnaît un lien de réinitialisation et un lien périmé', () => {
  expect(lireLienAuth('#access_token=x&type=recovery')).toEqual({ recuperation: true, erreur: null })
  expect(lireLienAuth('')).toEqual({ recuperation: false, erreur: null })
  expect(lireLienAuth('#error=access_denied&error_code=otp_expired').erreur).toMatch(/expiré/)
  expect(lireLienAuth('#error=server_error').erreur).toMatch(/pas valide/)
})

test('« Mot de passe oublié ? » envoie un lien qui ramène sur /admin', async () => {
  renderAdmin()
  fireEvent.click(await screen.findByRole('button', { name: /mot de passe oublié/i }))
  expect(screen.queryByLabelText(/^mot de passe$/i)).not.toBeInTheDocument()

  saisir(/adresse e-mail/i, 'manu@exemple.fr')
  fireEvent.click(screen.getByRole('button', { name: /recevoir le lien/i }))

  expect(await screen.findByRole('status')).toHaveTextContent(/si cette adresse correspond à un compte/i)
  expect(auth.resetPasswordForEmail).toHaveBeenCalledWith('manu@exemple.fr', {
    redirectTo: `${window.location.origin}/admin`,
  })
})

test('un lien périmé affiche un message sur l’écran de connexion', async () => {
  window.history.replaceState(null, '', '/admin#error=access_denied&error_code=otp_expired')
  renderAdmin()
  expect(await screen.findByRole('alert')).toHaveTextContent(/expiré/)
  expect(window.location.hash).toBe('')
})

test('arrivé par un lien de réinitialisation, on choisit le mot de passe avant l’éditeur', async () => {
  window.history.replaceState(null, '', '/admin#access_token=x&type=recovery')
  auth.getSession.mockResolvedValue({ data: { session } })
  renderAdmin()

  expect(await screen.findByRole('heading', { name: /nouveau mot de passe/i })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /annuler/i })).not.toBeInTheDocument()

  saisir(/^nouveau mot de passe$/i, 'trop')
  saisir(/confirmer/i, 'trop')
  fireEvent.click(screen.getByRole('button', { name: /enregistrer le mot de passe/i }))
  expect(await screen.findByRole('alert')).toHaveTextContent(`${LONGUEUR_MIN_MDP} caractères`)

  saisir(/^nouveau mot de passe$/i, 'un-bon-mot-de-passe')
  saisir(/confirmer/i, 'un-autre-mot-de-passe')
  fireEvent.click(screen.getByRole('button', { name: /enregistrer le mot de passe/i }))
  expect(await screen.findByRole('alert')).toHaveTextContent(/ne correspondent pas/)
  expect(auth.updateUser).not.toHaveBeenCalled()

  saisir(/confirmer/i, 'un-bon-mot-de-passe')
  fireEvent.click(screen.getByRole('button', { name: /enregistrer le mot de passe/i }))
  fireEvent.click(await screen.findByRole('button', { name: /continuer vers l’administration/i }))

  expect(auth.updateUser).toHaveBeenCalledWith({ password: 'un-bon-mot-de-passe' })
  expect(await screen.findByRole('button', { name: /se déconnecter/i })).toBeInTheDocument()
})

test('l’événement PASSWORD_RECOVERY ouvre aussi le formulaire', async () => {
  renderAdmin()
  await screen.findByLabelText(/adresse e-mail/i)
  ecouteur('PASSWORD_RECOVERY', session)
  expect(await screen.findByRole('heading', { name: /nouveau mot de passe/i })).toBeInTheDocument()
})

test('une erreur Supabase est affichée en français', async () => {
  window.history.replaceState(null, '', '/admin#access_token=x&type=recovery')
  auth.getSession.mockResolvedValue({ data: { session } })
  auth.updateUser.mockResolvedValue({ error: { code: 'same_password', message: 'New password should be different' } })
  renderAdmin()

  await screen.findByLabelText(/^nouveau mot de passe$/i, { selector: 'input' })
  saisir(/^nouveau mot de passe$/i, 'un-bon-mot-de-passe')
  saisir(/confirmer/i, 'un-bon-mot-de-passe')
  fireEvent.click(screen.getByRole('button', { name: /enregistrer le mot de passe/i }))
  expect(await screen.findByRole('alert')).toHaveTextContent(/différent de l’ancien/)
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
