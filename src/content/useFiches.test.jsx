import { renderHook, waitFor } from '@testing-library/react'
import { useFiches } from './useFiches'
import { lireFiches } from '../lib/supabase'

vi.mock('../lib/supabase', async (importOriginal) => ({
  ...(await importOriginal()),
  lireFiches: vi.fn(),
}))

test('null pendant la lecture, puis les fiches lues', async () => {
  const fiches = [{ id: '1', type: 'hommage', nom: 'A', fonction: '', titre: '', texte: '', images: [] }]
  lireFiches.mockResolvedValue(fiches)
  const { result } = renderHook(() => useFiches())
  expect(result.current).toBeNull()
  await waitFor(() => expect(result.current).toEqual(fiches))
})

test('repli sur les fiches d’origine si la base ne répond pas', async () => {
  lireFiches.mockResolvedValue(null)
  const { result } = renderHook(() => useFiches())
  await waitFor(() => expect(result.current).not.toBeNull())
  expect(result.current.map(f => f.nom)).toContain('Fred FORTE')
  expect(result.current[0].images[0].url).toBe('/images/fred-forte.jpg')
})

test('une base vide reste vide', async () => {
  lireFiches.mockResolvedValue([])
  const { result } = renderHook(() => useFiches())
  await waitFor(() => expect(result.current).toEqual([]))
})
