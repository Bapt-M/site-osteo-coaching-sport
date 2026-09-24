import { useCallback, useEffect, useState } from 'react'
import { reduireImage } from '../../lib/image'

/** Nombre de photos affichées sur l'accueil (cf. `lirePhotos()`). */
export const EN_LIGNE = 5

const CHAMP = 'w-full rounded-lg border border-black/15 bg-white px-4 py-3 font-inter text-text-primary ' +
              'outline-none focus:border-green-accent focus:ring-2 focus:ring-green-accent/25 transition'
const BOUTON = 'px-6 py-2.5 rounded-full bg-green-accent text-white font-poppins font-bold text-sm ' +
               'hover:bg-teal-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer'

/* ── Formulaire d'ajout ─────────────────────────────────────────────── */

function Ajout({ client, onPubliee }) {
  const [fichier, setFichier] = useState(null)
  const [description, setDescription] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [message, setMessage] = useState(null)
  const [cleChamp, setCleChamp] = useState(0)   // réinitialise l'<input type=file>

  async function publier(e) {
    e.preventDefault()
    if (!fichier) return
    setEnvoi(true)
    setMessage(null)
    try {
      const { blob, extension, type } = await reduireImage(fichier)
      const chemin = `${crypto.randomUUID()}.${extension}`
      const stockage = client.storage.from('photos')
      const envoiFichier = await stockage.upload(chemin, blob, { contentType: type, upsert: false })
      if (envoiFichier.error) throw new Error(`Envoi refusé : ${envoiFichier.error.message}`)
      const { error } = await client.from('photos').insert({ chemin, description: description.trim() })
      if (error) {
        // Pas de fichier orphelin dans le stockage.
        await stockage.remove([chemin])
        throw new Error(`Enregistrement refusé : ${error.message}`)
      }
      setFichier(null)
      setDescription('')
      setCleChamp(k => k + 1)
      setMessage({ type: 'succes', texte: 'Photo publiée.' })
      onPubliee()
    } catch (err) {
      setMessage({ type: 'erreur', texte: err.message })
    } finally {
      setEnvoi(false)
    }
  }

  // noValidate : jsdom ne reconnaît pas un <input type="file" required> rempli via
  // userEvent.upload comme valide et bloquerait silencieusement la soumission en test ;
  // la vérification `if (!fichier) return` fait déjà foi côté JS.
  return (
    <form onSubmit={publier} noValidate className="bg-white rounded-2xl border border-black/10 p-6 mb-12 space-y-5">
      <h3 className="font-poppins font-bold text-text-primary text-base">Ajouter une photo</h3>
      <div>
        <label htmlFor="photo-fichier" className="block font-inter text-text-primary text-sm font-medium mb-2">Photo</label>
        <input key={cleChamp} id="photo-fichier" type="file" accept="image/*" required
               onChange={e => setFichier(e.target.files?.[0] ?? null)}
               className="block font-inter text-sm text-text-secondary" />
      </div>
      <div>
        <label htmlFor="photo-description" className="block font-inter text-text-primary text-sm font-medium mb-2">Description</label>
        <textarea id="photo-description" rows={3} value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Affichée quand le visiteur clique sur la photo."
                  className={CHAMP + ' resize-y leading-relaxed'} />
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={!fichier || envoi} className={BOUTON}>
          {envoi ? 'Publication…' : 'Publier'}
        </button>
        {message && (
          <span role={message.type === 'erreur' ? 'alert' : 'status'}
                className={`font-inter text-sm ${message.type === 'erreur' ? 'text-red-600' : 'text-green-accent'}`}>
            {message.texte}
          </span>
        )}
      </div>
    </form>
  )
}

/* ── Une photo de la liste ──────────────────────────────────────────── */

function Ligne({ client, photo, enLigne, onChange }) {
  const [description, setDescription] = useState(photo.description)
  const [occupe, setOccupe] = useState(false)
  const [erreur, setErreur] = useState(null)
  const url = client.storage.from('photos').getPublicUrl(photo.chemin).data.publicUrl

  async function enregistrer() {
    setOccupe(true)
    setErreur(null)
    const { error } = await client.from('photos').update({ description: description.trim() }).eq('id', photo.id)
    setOccupe(false)
    if (error) setErreur(`Enregistrement refusé : ${error.message}`)
    else onChange()
  }

  async function supprimer() {
    if (!window.confirm('Supprimer définitivement cette photo ?')) return
    setOccupe(true)
    setErreur(null)
    const { error } = await client.from('photos').delete().eq('id', photo.id)
    if (error) {
      setOccupe(false)
      setErreur(`Suppression refusée : ${error.message}`)
      return
    }
    await client.storage.from('photos').remove([photo.chemin])
    onChange()
  }

  return (
    <li className="flex gap-5 items-start bg-white rounded-2xl border border-black/10 p-4">
      <img src={url} alt="" className="w-28 h-28 object-cover rounded-lg bg-black/5 shrink-0" />
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center gap-3 font-inter text-xs text-text-secondary/70">
          {enLigne && <span className="px-2 py-0.5 rounded-full bg-green-accent/10 text-green-accent font-medium">En ligne</span>}
          <span>{new Date(photo.cree_le).toLocaleDateString('fr-FR')}</span>
        </div>
        <textarea rows={2} value={description} aria-label="Description de la photo"
                  onChange={e => setDescription(e.target.value)}
                  className={CHAMP + ' resize-y leading-relaxed text-sm'} />
        <div className="flex items-center gap-4">
          <button type="button" onClick={enregistrer}
                  disabled={occupe || description.trim() === photo.description}
                  className="font-inter text-sm text-green-accent hover:underline disabled:opacity-40 disabled:no-underline cursor-pointer"
                  aria-label="Enregistrer la description">
            Enregistrer
          </button>
          <button type="button" onClick={supprimer} disabled={occupe}
                  className="font-inter text-sm text-red-600 hover:underline disabled:opacity-40 cursor-pointer">
            Supprimer
          </button>
          {erreur && <span role="alert" className="font-inter text-sm text-red-600">{erreur}</span>}
        </div>
      </div>
    </li>
  )
}

/* ── Onglet ─────────────────────────────────────────────────────────── */

export default function Photos({ client }) {
  const [photos, setPhotos] = useState(null)
  const [erreur, setErreur] = useState(null)

  const charger = useCallback(async () => {
    const { data, error } = await client.from('photos')
      .select('id, chemin, description, cree_le')
      .order('cree_le', { ascending: false })
    if (error) { setErreur(`Lecture impossible : ${error.message}`); setPhotos([]); return }
    setErreur(null)
    setPhotos(data ?? [])
  }, [client])

  useEffect(() => { charger() }, [charger])

  return (
    <>
      <div className="mb-8">
        <h2 className="font-poppins font-bold text-text-primary text-2xl">Photos d’actualité</h2>
        <p className="font-inter text-sm text-text-secondary mt-1">
          Les {EN_LIGNE} plus récentes s’affichent en nuage sur l’accueil, juste après le carrousel.
        </p>
      </div>

      <Ajout client={client} onPubliee={charger} />

      {erreur && <p role="alert" className="font-inter text-red-600 text-sm mb-6">{erreur}</p>}
      {photos === null
        ? <p className="font-inter text-text-secondary">Chargement des photos…</p>
        : photos.length === 0
          ? <p className="font-inter text-text-secondary">Aucune photo publiée pour l’instant.</p>
          : (
            <ul className="space-y-4">
              {photos.map((p, i) => (
                <Ligne key={`${p.id}-${p.description}`} client={client} photo={p}
                       enLigne={i < EN_LIGNE} onChange={charger} />
              ))}
            </ul>
          )}
    </>
  )
}
