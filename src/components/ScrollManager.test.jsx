import { render, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Link } from 'react-router-dom'
import ScrollManager from './ScrollManager'

beforeEach(() => { window.scrollTo = vi.fn() })

test('remonte en haut quand on clique le lien de la page où l’on est déjà', async () => {
  const { getByRole } = render(
    <MemoryRouter initialEntries={['/histoire']}>
      <ScrollManager />
      <Link to="/histoire">Histoire</Link>
    </MemoryRouter>,
  )
  window.scrollTo.mockClear()
  await userEvent.click(getByRole('link'))
  expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }))
})

test('défile jusqu’à la section visée par l’ancre', async () => {
  vi.useFakeTimers()
  const vise = vi.fn()
  render(
    <MemoryRouter initialEntries={['/#contact']}>
      <ScrollManager />
      <section id="contact" ref={e => { if (e) e.scrollIntoView = vise }} />
    </MemoryRouter>,
  )
  await act(() => vi.advanceTimersByTime(100))
  expect(vise).toHaveBeenCalledWith(expect.objectContaining({ block: 'start' }))
  vi.useRealTimers()
})
