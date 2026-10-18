import { useState } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Champ, { ContexteMedias } from './Champ'
import { DEFAUTS, PAR_CLE, lireListe } from '../../content/registre'
import { mediasCites } from '../Admin'

vi.mock('../../lib/image', () => ({
  reduireImage: vi.fn(async () => ({ blob: new Blob(['x'], { type: 'image/webp' }), extension: 'webp', type: 'image/webp' })),
}))

/** Rend un champ du registre et expose sa valeur courante. */
function rendre(cle, { client = null, onEnvoi = vi.fn() } = {}) {
  const valeurs = { current: DEFAUTS[cle] }
  function Hote() {
    const [v, setV] = useState(DEFAUTS[cle])
    valeurs.current = v
    return (
      <ContexteMedias.Provider value={{ client, onEnvoi }}>
        <Champ champ={PAR_CLE[cle]} valeur={v} modifie={false}
               onChange={(_, nv) => setV(nv)} onReset={() => setV(DEFAUTS[cle])} />
      </ContexteMedias.Provider>
    )
  }
  render(<Hote />)
  return { liste: () => lireListe(valeurs.current, cle), valeur: () => valeurs.current }
}

test('liste : ajoute, modifie, déplace et supprime des éléments', async () => {
  const { liste } = rendre('bilan.etapes')
  expect(liste()).toHaveLength(3)

  await userEvent.click(screen.getByRole('button', { name: /ajouter une étape/i }))
  expect(liste()).toHaveLength(4)
  await userEvent.type(screen.getByLabelText('Titre 4'), 'Bilan de fin')
  expect(liste()[3]).toEqual({ titre: 'Bilan de fin', texte: '' })

  await userEvent.click(screen.getByRole('button', { name: 'Monter étape 4' }))
  expect(liste()[2].titre).toBe('Bilan de fin')

  await userEvent.click(screen.getByRole('button', { name: 'Supprimer étape 1' }))
  expect(liste().map(e => e.titre)).toEqual(['Calendrier personnalisé', 'Bilan de fin', 'Forfait annuel'])
})

test('image : la photo choisie est envoyée au bucket medias et devient la valeur', async () => {
  const upload = vi.fn(async () => ({ error: null }))
  const onEnvoi = vi.fn()
  const client = { storage: { from: (b) => { expect(b).toBe('medias'); return { upload } } } }
  const { valeur } = rendre('bilan.image', { client, onEnvoi })

  await userEvent.upload(screen.getByLabelText('Photo de fond'), new File(['i'], 'a.jpg', { type: 'image/jpeg' }))
  await waitFor(() => expect(valeur()).toMatch(/^[0-9a-f-]{36}\.webp$/))
  expect(upload).toHaveBeenCalledWith(valeur(), expect.any(Blob), expect.objectContaining({ contentType: 'image/webp' }))
  expect(onEnvoi).toHaveBeenCalledWith(valeur())

  await userEvent.click(screen.getByRole('button', { name: /retirer la photo/i }))
  expect(valeur()).toBe('')
  await userEvent.click(screen.getByRole('button', { name: /rétablir/i }))
  expect(valeur()).toBe('/images/cabinet-1.jpg')
})

test('lien : signale une destination qui n’est ni une page ni une adresse', async () => {
  rendre('projet.bouton.lien')
  const champ = screen.getByLabelText('Bouton — destination')
  await userEvent.clear(champ)
  await userEvent.type(champ, 'www.exemple.fr')
  expect(screen.getByRole('alert')).toHaveTextContent(/commencez par/i)
  await userEvent.clear(champ)
  await userEvent.type(champ, 'https://www.exemple.fr')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('galerie d’un élément : ajoute et retire des photos', async () => {
  const { liste } = rendre('remise.espaces')
  const espace4 = screen.getAllByRole('group')[3]
  expect(liste()[3].photos).toHaveLength(2)
  await userEvent.click(within(espace4).getByRole('button', { name: /ajouter une photo/i }))
  expect(liste()[3].photos).toHaveLength(3)
  await userEvent.click(within(espace4).getByRole('button', { name: 'Supprimer la photo 1' }))
  expect(liste()[3].photos.map(p => p.image)).toEqual(['/images/remise-boxe-salle.jpg', ''])
})

test('repère les photos du bucket citées, en champ simple comme dans une liste', () => {
  const a = '0b1c2d3e-1111-4222-8333-444455556666.webp'
  const b = '9f8e7d6c-1111-4222-8333-444455556666.jpg'
  const cites = mediasCites({ 'x.image': a, 'x.liste': JSON.stringify([{ image: b }, { image: '/images/site.jpg' }]) })
  expect([...cites].sort()).toEqual([a, b].sort())
})
