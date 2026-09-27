import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Photos from './Photos'

vi.mock('../../lib/image', () => ({
  reduireImage: vi.fn(async () => ({
    blob: new Blob(['x'], { type: 'image/webp' }), extension: 'webp', type: 'image/webp',
  })),
}))

/** Faux client Supabase : juste ce que l'onglet appelle, avec des espions. */
function fauxClient(lignes = []) {
  const donnees = [...lignes]
  const espions = {
    upload: vi.fn(async () => ({ error: null })),
    remove: vi.fn(async () => ({ error: null })),
    insert: vi.fn(async (ligne) => {
      donnees.unshift({ id: 'nouveau', cree_le: '2026-09-24', ...ligne })
      return { error: null }
    }),
    update: vi.fn(),
    delete: vi.fn(),
  }
  const client = {
    from: () => ({
      select: () => ({ order: async () => ({ data: [...donnees], error: null }) }),
      insert: espions.insert,
      update: (valeurs) => ({ eq: async (_c, id) => { espions.update(id, valeurs); return { error: null } } }),
      delete: () => ({ eq: async (_c, id) => {
        espions.delete(id)
        donnees.splice(donnees.findIndex(l => l.id === id), 1)
        return { error: null }
      } }),
    }),
    storage: {
      from: () => ({
        upload: espions.upload,
        remove: espions.remove,
        getPublicUrl: (chemin) => ({ data: { publicUrl: `https://cdn/${chemin}` } }),
      }),
    },
  }
  return { client, espions }
}

const ligne = (i) => ({ id: `id${i}`, chemin: `p${i}.webp`, description: `Photo ${i}`, cree_le: `2026-09-${10 + i}` })

test('liste les photos et marque les 5 premières en ligne', async () => {
  const { client } = fauxClient([1, 2, 3, 4, 5, 6].map(ligne))
  render(<Photos client={client} />)
  const items = await screen.findAllByRole('listitem')
  expect(items).toHaveLength(6)
  expect(within(items[0]).getByText(/en ligne/i)).toBeInTheDocument()
  expect(within(items[4]).getByText(/en ligne/i)).toBeInTheDocument()
  expect(within(items[5]).queryByText(/en ligne/i)).not.toBeInTheDocument()
  // alt="" : l'image est décorative, elle n'a pas le rôle img.
  expect(items[0].querySelector('img')).toHaveAttribute('src', 'https://cdn/p1.webp')
})

test('publie une photo réduite avec sa description', async () => {
  const { client, espions } = fauxClient()
  render(<Photos client={client} />)
  const fichier = new File(['img'], 'padel.jpg', { type: 'image/jpeg' })
  await userEvent.upload(await screen.findByLabelText(/^photo$/i), fichier)
  await userEvent.type(screen.getByLabelText(/^description$/i), 'Stage padel')
  await userEvent.click(screen.getByRole('button', { name: /publier/i }))

  await waitFor(() => expect(espions.insert).toHaveBeenCalled())
  const [chemin, blob, options] = espions.upload.mock.calls[0]
  expect(chemin).toMatch(/^[0-9a-f-]{36}\.webp$/)
  expect(blob.type).toBe('image/webp')
  expect(options.contentType).toBe('image/webp')
  expect(espions.insert).toHaveBeenCalledWith({ chemin, description: 'Stage padel' })
  expect(await screen.findByText(/photo publiée/i)).toBeInTheDocument()
  expect(await screen.findAllByRole('listitem')).toHaveLength(1)
})

test('supprime le fichier envoyé si l’enregistrement échoue', async () => {
  const { client, espions } = fauxClient()
  espions.insert.mockResolvedValueOnce({ error: { message: 'refusé' } })
  render(<Photos client={client} />)
  await userEvent.upload(await screen.findByLabelText(/^photo$/i),
                         new File(['img'], 'a.jpg', { type: 'image/jpeg' }))
  await userEvent.click(screen.getByRole('button', { name: /publier/i }))
  expect(await screen.findByText(/refusé/)).toBeInTheDocument()
  const chemin = espions.upload.mock.calls[0][0]
  expect(espions.remove).toHaveBeenCalledWith([chemin])
})

test('modifie une description', async () => {
  const { client, espions } = fauxClient([ligne(1)])
  render(<Photos client={client} />)
  const champ = await screen.findByDisplayValue('Photo 1')
  await userEvent.clear(champ)
  await userEvent.type(champ, 'Nouvelle légende')
  await userEvent.click(screen.getByRole('button', { name: /enregistrer la description/i }))
  await waitFor(() => expect(espions.update).toHaveBeenCalledWith('id1', { description: 'Nouvelle légende' }))
})

test('supprime une photo après confirmation', async () => {
  const { client, espions } = fauxClient([ligne(1), ligne(2)])
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  render(<Photos client={client} />)
  const items = await screen.findAllByRole('listitem')
  await userEvent.click(within(items[0]).getByRole('button', { name: /supprimer/i }))
  await waitFor(() => expect(espions.delete).toHaveBeenCalledWith('id1'))
  expect(espions.remove).toHaveBeenCalledWith(['p1.webp'])
  await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(1))
})

test('signale, depuis le parent, que le fichier n’a pas pu être effacé après suppression', async () => {
  const { client, espions } = fauxClient([ligne(1), ligne(2)])
  espions.remove.mockResolvedValueOnce({ error: { message: 'stockage indisponible' } })
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  render(<Photos client={client} />)
  const items = await screen.findAllByRole('listitem')
  await userEvent.click(within(items[0]).getByRole('button', { name: /supprimer/i }))
  await waitFor(() => expect(espions.delete).toHaveBeenCalledWith('id1'))
  // La ligne disparaît (elle est bien retirée de la base) : l'avis doit donc
  // venir du parent Photos, pas de la <Ligne> qui vient de se démonter.
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Photo retirée du site, mais le fichier n’a pas pu être effacé : stockage indisponible',
  )
  await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(1))
})

test('ne supprime rien si l’on annule', async () => {
  const { client, espions } = fauxClient([ligne(1)])
  vi.spyOn(window, 'confirm').mockReturnValue(false)
  render(<Photos client={client} />)
  await userEvent.click(await screen.findByRole('button', { name: /supprimer/i }))
  expect(espions.delete).not.toHaveBeenCalled()
})
