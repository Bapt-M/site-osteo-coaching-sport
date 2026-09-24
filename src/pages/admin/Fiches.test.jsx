import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Fiches from './Fiches'

vi.mock('../../lib/image', () => ({
  reduireImage: vi.fn(async () => ({ blob: new Blob(['x'], { type: 'image/webp' }), extension: 'webp', type: 'image/webp' })),
}))

beforeAll(() => { URL.createObjectURL = vi.fn(() => 'blob:apercu'); URL.revokeObjectURL = vi.fn() })

/** Faux client : garde les lignes en mémoire et espionne les appels. */
function fauxClient(lignes = []) {
  let donnees = lignes.map(l => ({ fonction: '', titre: '', texte: '', images: [], ...l }))
  const espions = {
    upload: vi.fn(async () => ({ error: null })),
    remove: vi.fn(async () => ({ error: null })),
    insert: vi.fn(async (ligne) => { donnees.push({ id: `n${donnees.length}`, ...ligne }); return { error: null } }),
    update: vi.fn(),
    delete: vi.fn(),
  }
  const client = {
    from: () => ({
      select: () => ({
        eq: (_c, type) => ({
          order: () => ({
            order: async () => ({
              data: donnees.filter(d => d.type === type).sort((a, b) => a.ordre - b.ordre),
              error: null,
            }),
          }),
        }),
      }),
      insert: espions.insert,
      update: (valeurs) => ({ eq: async (_c, id) => {
        espions.update(id, valeurs)
        donnees = donnees.map(d => d.id === id ? { ...d, ...valeurs } : d)
        return { error: null }
      } }),
      delete: () => ({ eq: async (_c, id) => {
        espions.delete(id)
        donnees = donnees.filter(d => d.id !== id)
        return { error: null }
      } }),
    }),
    storage: { from: () => ({
      upload: espions.upload,
      remove: espions.remove,
      getPublicUrl: (chemin) => ({ data: { publicUrl: `https://cdn/${chemin}` } }),
    }) },
  }
  return { client, espions }
}

const h = (i, extra = {}) => ({ id: `h${i}`, type: 'hommage', nom: `Nom ${i}`, ordre: i, ...extra })

test('liste les fiches du type, dans l’ordre', async () => {
  const { client } = fauxClient([h(1), h(0), { ...h(9), type: 'temoignage' }])
  render(<Fiches client={client} type="hommage" />)
  const items = await screen.findAllByRole('listitem')
  expect(items.map(li => within(li).getByTestId('fiche-nom').textContent)).toEqual(['Nom 0', 'Nom 1'])
})

test('ajoute une fiche avec une image réduite et envoyée au bucket', async () => {
  const { client, espions } = fauxClient([h(0)])
  render(<Fiches client={client} type="hommage" />)
  await userEvent.click(await screen.findByRole('button', { name: /ajouter une fiche/i }))
  await userEvent.type(screen.getByLabelText(/^nom$/i), 'Fred FORTE')
  await userEvent.type(screen.getByLabelText(/fonction/i), 'SIG Strasbourg')
  await userEvent.type(screen.getByLabelText(/phrase mise en avant/i), 'Voilà mon Manu')
  await userEvent.type(screen.getByLabelText(/^texte$/i), 'Un.{Enter}{Enter}Deux.')
  await userEvent.upload(screen.getByLabelText(/ajouter une image/i), new File(['i'], 'a.jpg', { type: 'image/jpeg' }))
  await userEvent.type(screen.getByLabelText(/légende de l’image 1/i), 'Sous le maillot')
  await userEvent.click(screen.getByRole('button', { name: /enregistrer la fiche/i }))

  await waitFor(() => expect(espions.insert).toHaveBeenCalled())
  const [chemin, blob, options] = espions.upload.mock.calls[0]
  expect(chemin).toMatch(/^[0-9a-f-]{36}\.webp$/)
  expect(blob.type).toBe('image/webp')
  expect(options.contentType).toBe('image/webp')
  expect(espions.insert).toHaveBeenCalledWith({
    type: 'hommage', nom: 'Fred FORTE', fonction: 'SIG Strasbourg', titre: 'Voilà mon Manu',
    texte: 'Un.\n\nDeux.', images: [{ chemin, legende: 'Sous le maillot' }], ordre: 1,
  })
  expect(await screen.findAllByRole('listitem')).toHaveLength(2)
})

test('supprime les images envoyées si l’enregistrement échoue', async () => {
  const { client, espions } = fauxClient()
  espions.insert.mockResolvedValueOnce({ error: { message: 'refusé' } })
  render(<Fiches client={client} type="hommage" />)
  await userEvent.click(await screen.findByRole('button', { name: /ajouter une fiche/i }))
  await userEvent.type(screen.getByLabelText(/^nom$/i), 'X')
  await userEvent.upload(screen.getByLabelText(/ajouter une image/i), new File(['i'], 'a.jpg', { type: 'image/jpeg' }))
  await userEvent.click(screen.getByRole('button', { name: /enregistrer la fiche/i }))
  expect(await screen.findByRole('alert')).toHaveTextContent(/refusé/)
  expect(espions.remove).toHaveBeenCalledWith([espions.upload.mock.calls[0][0]])
})

test('modifie une fiche et efface du bucket l’image retirée, jamais une image du site', async () => {
  const { client, espions } = fauxClient([h(0, {
    images: [{ chemin: '/images/site.jpg', legende: 'site' }, { chemin: 'bucket.webp', legende: 'bucket' }],
  })])
  render(<Fiches client={client} type="hommage" />)
  await userEvent.click(await screen.findByRole('button', { name: /modifier/i }))
  expect(screen.getByLabelText(/^nom$/i)).toHaveValue('Nom 0')
  await userEvent.click(screen.getByRole('button', { name: /retirer l’image 2/i }))
  await userEvent.click(screen.getByRole('button', { name: /retirer l’image 1/i }))
  await userEvent.click(screen.getByRole('button', { name: /enregistrer la fiche/i }))
  await waitFor(() => expect(espions.update).toHaveBeenCalledWith('h0', expect.objectContaining({ images: [] })))
  expect(espions.remove).toHaveBeenCalledWith(['bucket.webp'])
  expect(espions.remove.mock.calls.flat(2)).not.toContain('/images/site.jpg')
})

test('limite à 4 images', async () => {
  const { client } = fauxClient()
  render(<Fiches client={client} type="temoignage" />)
  await userEvent.click(await screen.findByRole('button', { name: /ajouter une fiche/i }))
  for (let i = 0; i < 4; i++) {
    await userEvent.upload(screen.getByLabelText(/ajouter une image/i), new File(['i'], `${i}.jpg`, { type: 'image/jpeg' }))
  }
  expect(screen.queryByLabelText(/ajouter une image/i)).not.toBeInTheDocument()
})

test('monte une fiche d’un cran', async () => {
  const { client, espions } = fauxClient([h(0), h(1)])
  render(<Fiches client={client} type="hommage" />)
  const items = await screen.findAllByRole('listitem')
  await userEvent.click(within(items[1]).getByRole('button', { name: /monter/i }))
  await waitFor(() => expect(espions.update).toHaveBeenCalledWith('h1', { ordre: 0 }))
  expect(espions.update).toHaveBeenCalledWith('h0', { ordre: 1 })
  await waitFor(() =>
    expect(screen.getAllByTestId('fiche-nom').map(n => n.textContent)).toEqual(['Nom 1', 'Nom 0']))
  expect(within(screen.getAllByRole('listitem')[0]).getByRole('button', { name: /monter/i })).toBeDisabled()
})

test('supprime une fiche après confirmation, avec ses images du bucket', async () => {
  const { client, espions } = fauxClient([h(0, { images: [{ chemin: '/images/site.jpg' }, { chemin: 'b.webp' }] })])
  vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)
  render(<Fiches client={client} type="hommage" />)
  await userEvent.click(await screen.findByRole('button', { name: /supprimer/i }))
  expect(espions.delete).not.toHaveBeenCalled()
  await userEvent.click(screen.getByRole('button', { name: /supprimer/i }))
  await waitFor(() => expect(espions.delete).toHaveBeenCalledWith('h0'))
  expect(espions.remove).toHaveBeenCalledWith(['b.webp'])
  await waitFor(() => expect(screen.queryAllByRole('listitem')).toHaveLength(0))
})
