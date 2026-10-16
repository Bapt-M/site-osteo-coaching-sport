import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BilanOsteopathique from './BilanOsteopathique'
import { lireFiches } from '../lib/supabase'

vi.mock('../lib/supabase', async (importOriginal) => ({
  ...(await importOriginal()),
  lireFiches: vi.fn(),
}))

beforeEach(() => { lireFiches.mockReset(); lireFiches.mockResolvedValue(null) })

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

test('affiche les fiches « osteopathe » de la base, et elles seules', async () => {
  lireFiches.mockResolvedValue([
    { id: 'a', type: 'osteopathe', nom: 'Emmanuel', fonction: 'Sa fonction', titre: '', texte: 'Premier.\n\nSecond.',
      images: [{ url: 'https://cdn/a.webp', legende: '' }] },
    { id: 'b', type: 'temoignage', nom: 'Autre', fonction: '', titre: '', texte: '', images: [] },
  ])
  render(<BilanOsteopathique />, { wrapper: Wrapper })
  const section = await screen.findByRole('region', { name: /.+/ })
  expect(within(section).getByRole('heading', { name: 'Emmanuel' })).toBeInTheDocument()
  expect(within(section).getByText('Sa fonction')).toBeInTheDocument()
  expect(within(section).getByText('Second.')).toBeInTheDocument()
  expect(within(section).getByRole('img', { name: 'Emmanuel' })).toHaveAttribute('src', 'https://cdn/a.webp')
  expect(screen.queryByText('Autre')).not.toBeInTheDocument()
})

test('n’affiche pas la section tant qu’aucune fiche « osteopathe » n’existe', async () => {
  render(<BilanOsteopathique />, { wrapper: Wrapper })
  await Promise.resolve()
  expect(screen.queryByRole('region')).not.toBeInTheDocument()
})
