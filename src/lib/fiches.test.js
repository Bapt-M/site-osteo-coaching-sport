import { afterEach, expect, test, vi } from 'vitest'

vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test')
const { lireFiches, urlFiche, versFiche } = await import('./supabase')

afterEach(() => { vi.unstubAllGlobals() })

test('une image du site garde son chemin, une image du bucket prend l’URL publique', () => {
  expect(urlFiche('/images/fred-forte.jpg')).toBe('/images/fred-forte.jpg')
  expect(urlFiche('abc.webp')).toBe('https://test.supabase.co/storage/v1/object/public/fiches/abc.webp')
})

test('met une ligne au format d’affichage', () => {
  expect(versFiche({
    id: '1', type: 'hommage', nom: 'Fred FORTE', fonction: null, titre: 'Voilà', texte: 'a\n\nb',
    images: [{ chemin: '/images/x.jpg', legende: 'X' }, { chemin: 'y.webp' }], ordre: 0,
  })).toEqual({
    id: '1', type: 'hommage', nom: 'Fred FORTE', fonction: '', titre: 'Voilà', texte: 'a\n\nb',
    images: [
      { url: '/images/x.jpg', legende: 'X' },
      { url: 'https://test.supabase.co/storage/v1/object/public/fiches/y.webp', legende: '' },
    ],
  })
})

test('ignore les entrées d’image dont le chemin n’est pas exploitable', () => {
  expect(versFiche({
    id: '1', type: 'hommage', nom: 'X',
    images: [{ chemin: 42 }, { legende: 'sans chemin' }, { chemin: '/images/x.jpg', legende: 'ok' }],
  }).images).toEqual([{ url: '/images/x.jpg', legende: 'ok' }])
})

test('un chemin commençant par « // » est traité comme un objet du bucket, jamais comme une URL externe', () => {
  expect(urlFiche('//images/x.jpg')).toBe('https://test.supabase.co/storage/v1/object/public/fiches///images/x.jpg')
})

test('lit les fiches dans l’ordre choisi', async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true, json: async () => [{ id: '1', type: 'temoignage', nom: 'A', images: [] }],
  })
  vi.stubGlobal('fetch', fetchMock)
  const fiches = await lireFiches()
  const appel = fetchMock.mock.calls[0][0]
  expect(appel).toContain('/rest/v1/fiches?')
  expect(appel).toContain('order=ordre.asc,cree_le.asc')
  expect(fiches).toEqual([{ id: '1', type: 'temoignage', nom: 'A', fonction: '', titre: '', texte: '', images: [] }])
})

test('une liste vide est respectée', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }))
  expect(await lireFiches()).toEqual([])
})

test('renvoie null en cas d’erreur HTTP ou réseau', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }))
  expect(await lireFiches()).toBeNull()
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('hors ligne')))
  expect(await lireFiches()).toBeNull()
})
