import { afterEach, expect, test, vi } from 'vitest'

vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test')
const { lirePhotos, urlPhoto } = await import('./supabase')

afterEach(() => { vi.unstubAllGlobals() })

test('construit l\'URL publique d\'une photo', () => {
  expect(urlPhoto('abc.webp')).toBe('https://test.supabase.co/storage/v1/object/public/photos/abc.webp')
})

test('lit les 5 dernières photos, plus récentes d\'abord', async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => [
      { id: '1', chemin: 'a.webp', description: 'Stage padel' },
      { id: '2', chemin: 'b.webp', description: null },
    ],
  })
  vi.stubGlobal('fetch', fetchMock)

  const photos = await lirePhotos()

  const appel = fetchMock.mock.calls[0][0]
  expect(appel).toContain('/rest/v1/photos?')
  expect(appel).toContain('order=cree_le.desc')
  expect(appel).toContain('limit=5')
  expect(photos).toEqual([
    { id: '1', url: urlPhoto('a.webp'), description: 'Stage padel' },
    { id: '2', url: urlPhoto('b.webp'), description: '' },
  ])
})

test('renvoie une liste vide si la reponse est en erreur', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }))
  expect(await lirePhotos()).toEqual([])
})

test('renvoie une liste vide si le reseau tombe', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('hors ligne')))
  expect(await lirePhotos()).toEqual([])
})
