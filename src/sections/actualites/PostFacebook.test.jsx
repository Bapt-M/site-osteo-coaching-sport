import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostFacebook from './PostFacebook'

const LIEN = 'https://www.facebook.com/osteo/posts/123'

test('ne charge rien de Facebook avant le clic', () => {
  const { container } = render(<PostFacebook lien={LIEN} />)
  expect(container.querySelector('iframe')).toBeNull()
  expect(screen.getByText(/cookies/i)).toBeInTheDocument()
})

test('propose toujours d’ouvrir le post sur Facebook', () => {
  render(<PostFacebook lien={LIEN} />)
  const lien = screen.getByRole('link', { name: /voir sur facebook/i })
  expect(lien).toHaveAttribute('href', LIEN)
  expect(lien).toHaveAttribute('target', '_blank')
  expect(lien.getAttribute('rel')).toContain('noopener')
})

test('charge le lecteur officiel au clic', async () => {
  render(<PostFacebook lien={LIEN} />)
  await userEvent.click(screen.getByRole('button', { name: /afficher le post/i }))
  const iframe = screen.getByTitle(/publication facebook/i)
  expect(iframe.tagName).toBe('IFRAME')
  expect(iframe.getAttribute('src')).toContain('https://www.facebook.com/plugins/post.php?')
  expect(iframe.getAttribute('src')).toContain(encodeURIComponent(LIEN))
  expect(screen.queryByRole('button', { name: /afficher le post/i })).not.toBeInTheDocument()
})

test('dimensionne le lecteur avec la largeur réelle du conteneur', async () => {
  const { container } = render(<PostFacebook lien={LIEN} />)
  // jsdom ne calcule aucune mise en page : on simule un conteneur à 420 px.
  Object.defineProperty(container.firstChild, 'clientWidth', { value: 420, configurable: true })
  await userEvent.click(screen.getByRole('button', { name: /afficher le post/i }))
  const iframe = screen.getByTitle(/publication facebook/i)
  expect(new URL(iframe.getAttribute('src')).searchParams.get('width')).toBe('420')
  expect(iframe).toHaveStyle({ width: '420px', height: '545px' })
  expect(iframe.style.transform).toBe('')
})

test('repli à 500 px si la largeur du conteneur est nulle (jsdom)', async () => {
  render(<PostFacebook lien={LIEN} />)
  await userEvent.click(screen.getByRole('button', { name: /afficher le post/i }))
  const iframe = screen.getByTitle(/publication facebook/i)
  expect(new URL(iframe.getAttribute('src')).searchParams.get('width')).toBe('500')
})

test('donne le focus au lecteur une fois affiché, pour que le clavier ne retombe pas sur <body>', async () => {
  render(<PostFacebook lien={LIEN} />)
  await userEvent.click(screen.getByRole('button', { name: /afficher le post/i }))
  const iframe = screen.getByTitle(/publication facebook/i)
  expect(iframe).toHaveFocus()
})

test('reprend la hauteur du code d’intégration, 620 px à défaut', async () => {
  const { unmount } = render(<PostFacebook lien={LIEN} hauteur={645} />)
  await userEvent.click(screen.getByRole('button', { name: /afficher le post/i }))
  expect(screen.getByTitle(/publication facebook/i)).toHaveStyle({ height: '645px' })
  unmount()
  render(<PostFacebook lien={LIEN} />)
  await userEvent.click(screen.getByRole('button', { name: /afficher le post/i }))
  expect(screen.getByTitle(/publication facebook/i)).toHaveStyle({ height: '620px' })
})

test('sous 350 px, rend le lecteur à 350 px et le réduit pour tenir dans l’écran', async () => {
  const { container } = render(<PostFacebook lien={LIEN} hauteur={645} />)
  // Facebook ignore toute largeur inférieure à 350 px : le post déborderait.
  Object.defineProperty(container.firstChild, 'clientWidth', { value: 315, configurable: true })
  await userEvent.click(screen.getByRole('button', { name: /afficher le post/i }))
  const iframe = screen.getByTitle(/publication facebook/i)
  expect(new URL(iframe.getAttribute('src')).searchParams.get('width')).toBe('350')
  expect(iframe).toHaveStyle({ width: '350px', height: '497px' })
  expect(iframe.style.transform).toBe('scale(0.9)')
  // Le cadre prend la hauteur réduite, sinon un vide resterait sous le post.
  expect(iframe.parentElement).toHaveStyle({ height: '447px' })
})
