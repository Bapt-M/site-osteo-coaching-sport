import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Histoire from './Histoire'
import { lireFiches } from '../lib/supabase'

vi.mock('../lib/supabase', async (importOriginal) => ({
  ...(await importOriginal()),
  lireFiches: vi.fn(),
}))

beforeEach(() => { lireFiches.mockReset(); lireFiches.mockResolvedValue(null) })

function Wrapper({ children }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

test('affiche le titre principal', () => {
  render(<Histoire />, { wrapper: Wrapper })
  expect(screen.getByRole('heading', { name: /histoire/i })).toBeInTheDocument()
})

test('affiche la section origines', () => {
  render(<Histoire />, { wrapper: Wrapper })
  expect(screen.getAllByText(/kleinfrankenheim/i).length).toBeGreaterThan(0)
})

test('affiche la section parcours professionnel', () => {
  render(<Histoire />, { wrapper: Wrapper })
  expect(screen.getAllByText(/SIG Strasbourg/).length).toBeGreaterThan(0)
})

test('affiche la section diplômes', () => {
  render(<Histoire />, { wrapper: Wrapper })
  expect(screen.getAllByText(/diplômes/i).length).toBeGreaterThan(0)
})

test('affiche les hommages et témoignages d’origine si la base ne répond pas', async () => {
  render(<Histoire />, { wrapper: Wrapper })
  expect((await screen.findAllByText(/Fred FORTE/)).length).toBeGreaterThan(0)
  expect(screen.getAllByText(/Thierry RUPERT/).length).toBeGreaterThan(0)
  expect(screen.getByText(/Matthieu LORENTZ/)).toBeInTheDocument()
  expect(screen.getByText(/Richard BILLANT/)).toBeInTheDocument()
  expect(screen.getByText(/Paris McCURDY/)).toBeInTheDocument()
})

const fiche = (type, nom, extra = {}) => ({
  id: nom, type, nom, fonction: `Fonction de ${nom}`, titre: `Titre de ${nom}`,
  texte: `Premier paragraphe de ${nom}.\n\nSecond paragraphe de ${nom}.`, images: [], ...extra,
})

test('affiche les fiches de la base, dans l’ordre reçu', async () => {
  lireFiches.mockResolvedValue([
    fiche('hommage', 'Alice', { images: [{ url: '/a.jpg', legende: 'Alice au club' }] }),
    fiche('temoignage', 'Bruno'),
    fiche('temoignage', 'Chloé'),
  ])
  render(<Histoire />, { wrapper: Wrapper })
  const hommages = await screen.findByRole('region', { name: /ceux qui m’ont|ceux qui m'ont/i })
  expect(within(hommages).getByRole('heading', { name: 'Alice' })).toBeInTheDocument()
  expect(within(hommages).getByText(/Titre de Alice/)).toBeInTheDocument()
  expect(within(hommages).getByText('Second paragraphe de Alice.')).toBeInTheDocument()
  expect(within(hommages).getByAltText('Alice au club')).toHaveAttribute('src', '/a.jpg')
  expect(within(hommages).getByText('Alice au club')).toBeInTheDocument()
  expect(screen.queryByText(/Fred FORTE/)).not.toBeInTheDocument()
  const noms = screen.getAllByTestId('temoignage-nom').map(n => n.textContent)
  expect(noms).toEqual(['Bruno', 'Chloé'])
})

test('retombe sur le premier paragraphe du texte si le titre est vide', async () => {
  lireFiches.mockResolvedValue([fiche('temoignage', 'Chloé', { titre: '', texte: 'Premier paragraphe de Chloé.\n\nSuite.' })])
  render(<Histoire />, { wrapper: Wrapper })
  expect(await screen.findByText('Premier paragraphe de Chloé.')).toBeInTheDocument()
})

test('un témoignage montre son titre, puis tout le texte au clic', async () => {
  lireFiches.mockResolvedValue([fiche('temoignage', 'Bruno')])
  render(<Histoire />, { wrapper: Wrapper })
  expect(await screen.findByText('Titre de Bruno')).toBeInTheDocument()
  expect(screen.queryByText('Second paragraphe de Bruno.')).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /lire le témoignage/i }))
  expect(screen.getByText('Second paragraphe de Bruno.')).toBeInTheDocument()
})

test('n’affiche pas les fiches d’origine pendant la lecture', () => {
  lireFiches.mockReturnValue(new Promise(() => {}))
  render(<Histoire />, { wrapper: Wrapper })
  expect(screen.queryByText(/Fred FORTE/)).not.toBeInTheDocument()
})

test('défile jusqu’à #temoignages une fois les fiches chargées', async () => {
  Element.prototype.scrollIntoView = vi.fn()
  lireFiches.mockResolvedValue([])
  render(<Histoire />, {
    wrapper: ({ children }) => <MemoryRouter initialEntries={['/histoire#temoignages']}>{children}</MemoryRouter>,
  })
  await waitFor(() => expect(Element.prototype.scrollIntoView).toHaveBeenCalled())
  expect(document.getElementById('temoignages').scrollIntoView).toHaveBeenCalledWith({ block: 'start' })
})

test('affiche la galerie padel', () => {
  render(<Histoire />, { wrapper: Wrapper })
  expect(screen.getAllByText(/une nouvelle passion/i).length).toBeGreaterThan(0)
  expect(screen.getAllByAltText(/Club Med Opio/i).length).toBeGreaterThan(0)
})
