import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Actualites from './Actualites'
import { DEFAUTS } from '../../content/registre'

// L'onglet Photos a ses propres tests : ici, seul compte qu'il soit présent.
vi.mock('./Photos', () => ({ default: () => <div data-testid="photos" /> }))

function rendre(valeurs = DEFAUTS, initial = DEFAUTS) {
  const onChange = vi.fn()
  const onReset = vi.fn()
  render(<Actualites client={{}} valeurs={valeurs} initial={initial} onChange={onChange} onReset={onReset} />)
  return { onChange, onReset }
}

test('réunit le titre, les photos et le post Facebook dans un seul onglet', () => {
  rendre()
  expect(screen.getByRole('heading', { level: 2, name: 'Actualités' })).toBeInTheDocument()
  expect(screen.getByLabelText(/titre de la section/i)).toHaveValue('Actualités')
  expect(screen.getByRole('heading', { name: 'Photos' })).toBeInTheDocument()
  expect(screen.getByTestId('photos')).toBeInTheDocument()
  const facebook = screen.getByRole('region', { name: /dernier post facebook/i })
  expect(within(facebook).getByRole('textbox')).toHaveValue('')
})

test('la saisie du lien Facebook passe par l’enregistrement commun des textes', async () => {
  const { onChange } = rendre()
  const champ = within(screen.getByRole('region', { name: /dernier post facebook/i })).getByRole('textbox')
  await userEvent.type(champ, 'x')
  expect(onChange).toHaveBeenCalledWith('actu.facebook.lien', 'x')
})

test('signale un champ modifié et permet de rétablir l’original', async () => {
  const valeurs = { ...DEFAUTS, 'actu.titre': 'Nouveautés' }
  const { onReset } = rendre(valeurs, DEFAUTS)
  expect(screen.getByText('modifié')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /rétablir l’original/i }))
  expect(onReset).toHaveBeenCalledWith('actu.titre')
})
