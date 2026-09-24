import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Actualites from './Actualites'
import { lirePhotos } from '../lib/supabase'
import { DEFAUTS } from '../content/registre'

const etat = vi.hoisted(() => ({ textes: {} }))

vi.mock('../lib/supabase', () => ({ lirePhotos: vi.fn() }))
vi.mock('../content/ContenuProvider', () => ({ useTextes: () => etat.textes }))

const LIEN = 'https://www.facebook.com/osteo/posts/123'
const PHOTOS = [{ id: '1', url: 'https://x/1.webp', description: 'Stage padel' }]

function avecLien(lien) {
  etat.textes = { ...DEFAUTS, 'actu.facebook.lien': lien }
}

beforeEach(() => { lirePhotos.mockReset() })

test('photos et Facebook : deux colonnes', async () => {
  avecLien(LIEN)
  lirePhotos.mockResolvedValue(PHOTOS)
  render(<Actualites />)
  expect(await screen.findByAltText(/stage padel/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /afficher le post/i })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Actualités' })).toBeInTheDocument()
  expect(screen.getByTestId('actualites-grille')).toHaveClass('desktop:grid-cols-2')
})

test('sans photo : Facebook seul, pleine largeur', async () => {
  avecLien(LIEN)
  lirePhotos.mockResolvedValue([])
  render(<Actualites />)
  await waitFor(() => expect(lirePhotos).toHaveBeenCalled())
  await waitFor(() =>
    expect(screen.getByTestId('actualites-grille')).not.toHaveClass('desktop:grid-cols-2'))
  expect(screen.queryByRole('button', { name: /agrandir/i })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: /afficher le post/i })).toBeInTheDocument()
})

test('lien absent : nuage seul', async () => {
  avecLien('')
  lirePhotos.mockResolvedValue(PHOTOS)
  render(<Actualites />)
  expect(await screen.findByAltText(/stage padel/i)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /afficher le post/i })).not.toBeInTheDocument()
  expect(screen.getByTestId('actualites-grille')).not.toHaveClass('desktop:grid-cols-2')
})

test('lien non Facebook : ignoré', async () => {
  avecLien('https://www.instagram.com/p/abc/')
  lirePhotos.mockResolvedValue(PHOTOS)
  render(<Actualites />)
  await screen.findByAltText(/stage padel/i)
  expect(screen.queryByRole('button', { name: /afficher le post/i })).not.toBeInTheDocument()
})

test('ni photo ni lien : rien n’est rendu', async () => {
  avecLien('')
  lirePhotos.mockResolvedValue([])
  const { container } = render(<Actualites />)
  await waitFor(() => expect(lirePhotos).toHaveBeenCalled())
  await waitFor(() => expect(container).toBeEmptyDOMElement())
})

test('code d’intégration collé : le post est affiché, sans reprendre la balise telle quelle', async () => {
  const PERMALIEN = 'https://www.facebook.com/permalink.php?story_fbid=pfbid0abc&id=615'
  avecLien(`<iframe src="https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(PERMALIEN)}&show_text=true&width=500" width="500" height="645" onload="alert(1)"></iframe>`)
  lirePhotos.mockResolvedValue([])
  render(<Actualites />)
  expect(await screen.findByRole('link', { name: /voir sur facebook/i })).toHaveAttribute('href', PERMALIEN)
  await userEvent.click(screen.getByRole('button', { name: /afficher le post/i }))
  const iframe = screen.getByTitle(/publication facebook/i)
  expect(iframe).toHaveStyle({ height: '645px' })
  expect(iframe).not.toHaveAttribute('onload')
  expect(new URL(iframe.getAttribute('src')).searchParams.get('href')).toBe(PERMALIEN)
})
