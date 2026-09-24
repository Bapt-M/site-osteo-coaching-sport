import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Testimonials, { initiales, tronquer } from './Testimonials'
import { lireFiches } from '../lib/supabase'

vi.mock('../lib/supabase', async (importOriginal) => ({
  ...(await importOriginal()),
  lireFiches: vi.fn(),
}))

beforeEach(() => { lireFiches.mockReset(); lireFiches.mockResolvedValue(null) })

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

const temoignage = (nom, titre = `Titre de ${nom}`) =>
  ({ id: nom, type: 'temoignage', nom, fonction: `Fonction de ${nom}`, titre, texte: '', images: [] })

test('rend les 3 témoignages d’origine si la base ne répond pas', async () => {
  renderWithRouter(<Testimonials />)
  expect(await screen.findByText(/Matthieu LORENTZ/)).toBeInTheDocument()
  expect(screen.getByText(/Richard BILLANT/)).toBeInTheDocument()
  expect(screen.getByText(/Paris McCURDY/)).toBeInTheDocument()
  expect(screen.getByText(/on parlait souvent des victoires/i)).toBeInTheDocument()
})

test('n’affiche que les 3 premiers témoignages de la base, jamais un hommage', async () => {
  lireFiches.mockResolvedValue([
    { ...temoignage('Hommage X'), type: 'hommage' },
    temoignage('Alice'), temoignage('Bruno'), temoignage('Chloé'), temoignage('David'),
  ])
  renderWithRouter(<Testimonials />)
  expect(await screen.findByText('Alice')).toBeInTheDocument()
  expect(screen.getByText('Chloé')).toBeInTheDocument()
  expect(screen.queryByText('David')).not.toBeInTheDocument()
  expect(screen.queryByText('Hommage X')).not.toBeInTheDocument()
  expect(screen.getByText('Titre de Alice')).toBeInTheDocument()
  expect(screen.getByText('Fonction de Alice')).toBeInTheDocument()
})

test('initiales et titre tronqué', () => {
  expect(initiales('Matthieu LORENTZ')).toBe('ML')
  expect(initiales('Paris McCURDY')).toBe('PM')
  expect(initiales('Cher')).toBe('C')
  const long = 'mot '.repeat(100).trim()
  const court = tronquer(long)
  expect(court.length).toBeLessThanOrEqual(221)
  expect(court.endsWith('…')).toBe(true)
  expect(tronquer('Court.')).toBe('Court.')
})

test('renvoie vers les hommages et les témoignages de la page Histoire', async () => {
  renderWithRouter(<Testimonials />)
  expect(await screen.findByText(/Matthieu LORENTZ/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /témoignages/i })).toHaveAttribute('href', '/histoire#temoignages')
  expect(screen.getByRole('link', { name: /hommages/i })).toHaveAttribute('href', '/histoire#hommages')
})
