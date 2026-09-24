import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NuagePhotos, { texteAlternatif } from './NuagePhotos'

const PHOTOS = [
  { id: '1', url: 'https://x/1.webp', description: 'Stage padel avec l’équipe de France' },
  { id: '2', url: 'https://x/2.webp', description: 'Match de Pro A' },
  { id: '3', url: 'https://x/3.webp', description: '' },
]

test('affiche une vignette cliquable par photo', () => {
  render(<NuagePhotos photos={PHOTOS} />)
  expect(screen.getAllByRole('button', { name: /agrandir/i })).toHaveLength(3)
  expect(screen.getByAltText(/stage padel/i)).toHaveAttribute('src', 'https://x/1.webp')
})

test('texte alternatif : début de la description, ou rang à défaut', () => {
  expect(texteAlternatif({ description: 'a'.repeat(200) }, 0)).toHaveLength(81)
  expect(texteAlternatif({ description: '' }, 2)).toBe('Photo d’actualité 3')
})

test('ouvre la visionneuse avec la description au clic', async () => {
  render(<NuagePhotos photos={PHOTOS} />)
  await userEvent.click(screen.getAllByRole('button', { name: /agrandir/i })[1])
  const dialogue = screen.getByRole('dialog')
  expect(within(dialogue).getByText('Match de Pro A')).toBeInTheDocument()
  expect(within(dialogue).getByText('2 / 3')).toBeInTheDocument()
})

test('navigue avec les flèches et boucle', async () => {
  render(<NuagePhotos photos={PHOTOS} />)
  await userEvent.click(screen.getAllByRole('button', { name: /agrandir/i })[0])
  await userEvent.keyboard('{ArrowRight}')
  expect(within(screen.getByRole('dialog')).getByText('Match de Pro A')).toBeInTheDocument()
  await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
  expect(within(screen.getByRole('dialog')).getByText('3 / 3')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /photo suivante/i }))
  expect(within(screen.getByRole('dialog')).getByText('1 / 3')).toBeInTheDocument()
})

test('se ferme avec Échap et rend le focus à la vignette', async () => {
  render(<NuagePhotos photos={PHOTOS} />)
  const vignette = screen.getAllByRole('button', { name: /agrandir/i })[2]
  await userEvent.click(vignette)
  await userEvent.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(vignette).toHaveFocus()
})

test('se ferme avec le bouton ×', async () => {
  render(<NuagePhotos photos={PHOTOS} />)
  await userEvent.click(screen.getAllByRole('button', { name: /agrandir/i })[0])
  await userEvent.click(screen.getByRole('button', { name: /fermer/i }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('garde le focus dans la visionneuse', async () => {
  render(<NuagePhotos photos={PHOTOS} />)
  await userEvent.click(screen.getAllByRole('button', { name: /agrandir/i })[0])
  const dialogue = screen.getByRole('dialog')
  for (let i = 0; i < 5; i++) {
    await userEvent.tab()
    expect(dialogue.contains(document.activeElement)).toBe(true)
  }
})
