import { render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ContenuProvider } from './ContenuProvider'
import { lireContenus, lireFiches } from '../lib/supabase'
import BilanOsteopathique from '../pages/BilanOsteopathique'
import ProjetSportif from '../pages/ProjetSportif'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

vi.mock('../lib/supabase', async (importOriginal) => ({
  ...(await importOriginal()),
  lireContenus: vi.fn(),
  lireFiches: vi.fn(async () => null),
}))

const avec = (contenus, page) => {
  lireContenus.mockResolvedValue(contenus)
  return render(<MemoryRouter initialEntries={['/histoire']}><ContenuProvider>{page}</ContenuProvider></MemoryRouter>)
}

test('les étapes, la galerie et la photo de fond modifiées remplacent celles d’origine', async () => {
  const { container } = avec({
    'bilan.etapes': JSON.stringify([{ titre: 'Étape unique', texte: 'Tout en une fois.' }]),
    'bilan.galerie': JSON.stringify([{ image: '0b1c2d3e-1111-4222-8333-444455556666.webp', legende: 'Nouvelle salle' }]),
    'bilan.image': '/images/autre.jpg',
  }, <BilanOsteopathique />)
  expect(await screen.findByRole('heading', { name: 'Étape unique' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: /premier rendez-vous/i })).not.toBeInTheDocument()
  expect(screen.getByText('01')).toBeInTheDocument()
  expect(screen.getByAltText('Nouvelle salle').getAttribute('src')).toMatch(/\/storage\/v1\/object\/public\/medias\/0b1c2d3e-/)
  expect(container.innerHTML).toMatch(/url\((&quot;)?\/images\/autre\.jpg/)
})

test('un bouton suit la destination saisie', async () => {
  avec({ 'projet.bouton.lien': 'https://exemple.fr/rdv' }, <ProjetSportif />)
  await waitFor(() => expect(screen.getByRole('link', { name: /discutons/i })).toHaveAttribute('href', 'https://exemple.fr/rdv'))
  const bouton = screen.getByRole('link', { name: /discutons/i })
  expect(bouton).toHaveAttribute('target', '_blank')
})

test('un bouton ou une citation vidés disparaissent du site', async () => {
  avec({ 'projet.bouton': '', 'projet.citation': '' }, <ProjetSportif />)
  await waitFor(() => expect(screen.queryByRole('link', { name: /discutons/i })).not.toBeInTheDocument())
  expect(screen.queryByText(/qui peut le plus/)).not.toBeInTheDocument()
})

test('menu, pied de page et lien de rendez-vous se modifient depuis l’admin', async () => {
  avec({
    'nav.liens': JSON.stringify([{ label: 'Le cabinet', lien: '/bilan-osteopathique' }]),
    'pied.pages': JSON.stringify([{ label: 'Accueil', lien: '/' }]),
    'lien.rdv': 'https://rdv.exemple.fr',
    'pied.copyright': '© {annee} Cabinet',
  }, <><Navbar /><Footer /></>)
  await waitFor(() => expect(screen.getByRole('link', { name: 'Le cabinet' })).toHaveAttribute('href', '/bilan-osteopathique'))
  expect(screen.queryByText('Histoire & formation')).not.toBeInTheDocument()
  const pied = screen.getByRole('contentinfo')
  expect(within(pied).getByRole('link', { name: 'Accueil' })).toHaveAttribute('href', '/')
  expect(within(pied).getByRole('link', { name: /prendre rendez-vous/i })).toHaveAttribute('href', 'https://rdv.exemple.fr')
  expect(within(pied).getByText(`© ${new Date().getFullYear()} Cabinet`)).toBeInTheDocument()
})
