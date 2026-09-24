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
