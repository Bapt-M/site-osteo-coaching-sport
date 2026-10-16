import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SuiviSportif from './SuiviSportif'
import { lireFiches } from '../lib/supabase'

vi.mock('../lib/supabase', async (importOriginal) => ({
  ...(await importOriginal()),
  lireFiches: vi.fn(),
}))

beforeEach(() => { lireFiches.mockReset(); lireFiches.mockResolvedValue(null) })

function Wrapper({ children }) { return <MemoryRouter>{children}</MemoryRouter> }

test('affiche le titre principal', () => {
  render(<SuiviSportif />, { wrapper: Wrapper })
  expect(screen.getByRole('heading', { name: /suivi sportif/i })).toBeInTheDocument()
})

test('affiche la liste des modalités de suivi', () => {
  render(<SuiviSportif />, { wrapper: Wrapper })
  expect(screen.getByText(/suivi régulier en cabinet/i)).toBeInTheDocument()
})

test('affiche la section athlètes SIG', () => {
  render(<SuiviSportif />, { wrapper: Wrapper })
  expect(screen.getByText(/SIG Basket Strasbourg/i)).toBeInTheDocument()
})

test('affiche les fiches « partenaire » de la base, et elles seules', async () => {
  lireFiches.mockResolvedValue([
    { id: 'a', type: 'partenaire', nom: 'Dr Martin', fonction: 'Sa fonction', titre: '', texte: 'Premier.\n\nSecond.',
      images: [{ url: 'https://cdn/a.webp', legende: '' }] },
    { id: 'b', type: 'temoignage', nom: 'Autre', fonction: '', titre: '', texte: '', images: [] },
  ])
  render(<SuiviSportif />, { wrapper: Wrapper })
  const section = await screen.findByRole('region', { name: /.+/ })
  expect(within(section).getByRole('heading', { name: 'Dr Martin' })).toBeInTheDocument()
  expect(within(section).getByText('Sa fonction')).toBeInTheDocument()
  expect(within(section).getByText('Second.')).toBeInTheDocument()
  expect(within(section).getByRole('img', { name: 'Dr Martin' })).toHaveAttribute('src', 'https://cdn/a.webp')
  expect(screen.queryByText('Autre')).not.toBeInTheDocument()
})

test('n’affiche pas la section tant qu’aucune fiche « partenaire » n’existe', async () => {
  render(<SuiviSportif />, { wrapper: Wrapper })
  await Promise.resolve()
  expect(screen.queryByRole('region')).not.toBeInTheDocument()
})
