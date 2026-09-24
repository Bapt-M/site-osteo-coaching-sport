import { useEffect, useRef, useState } from 'react'
import { reduireImage } from '../../lib/image'
import { CHAMP } from './Champ'

export const MAX_IMAGES = 4

const BOUTON = 'px-6 py-2.5 rounded-full bg-green-accent text-white font-poppins font-bold text-sm ' +
               'hover:bg-teal-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer'

/** Une image du site (« /images/… ») n'est jamais effacée : seul le bucket l'est. */
export const dansLeBucket = (chemin) => !chemin.startsWith('/')

/**
 * Formulaire d'une fiche. Les nouvelles images ne sont envoyées qu'à
 * l'enregistrement ; si la ligne est refusée, elles sont retirées du bucket.
 * Les images retirées du bucket ne le sont qu'une fois la ligne enregistrée.
 */
export default function FicheFormulaire({ client, type, fiche, ordre, onFini, onAnnuler }) {
  const [nom, setNom] = useState(fiche?.nom ?? '')
  const [fonction, setFonction] = useState(fiche?.fonction ?? '')
  const [titre, setTitre] = useState(fiche?.titre ?? '')
  const [texte, setTexte] = useState(fiche?.texte ?? '')
  // { chemin, legende } pour une image existante ; { fichier, apercu, legende } pour une nouvelle.
  const [images, setImages] = useState(fiche?.images ?? [])
  const [cleChamp, setCleChamp] = useState(0)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState(null)
  const stockage = client.storage.from('fiches')

  // Les aperçus créés par URL.createObjectURL doivent être libérés une fois inutiles :
  // à leur retrait, à l'annulation du formulaire, ou au démontage — pas seulement à
  // l'enregistrement. `imagesRef` donne au nettoyage de démontage la valeur la plus
  // récente sans dépendre de `images` dans les dépendances de l'effet.
  const imagesRef = useRef(images)
  imagesRef.current = images
  useEffect(() => () => {
    imagesRef.current.forEach(img => img.apercu && URL.revokeObjectURL(img.apercu))
  }, [])

  const apercu = (img) => img.apercu
    ?? (dansLeBucket(img.chemin) ? stockage.getPublicUrl(img.chemin).data.publicUrl : img.chemin)

  function ajouter(fichier) {
    if (!fichier || images.length >= MAX_IMAGES) return
    setImages(liste => [...liste, { id: crypto.randomUUID(), fichier, apercu: URL.createObjectURL(fichier), legende: '' }])
    setCleChamp(k => k + 1)
  }

  const majLegende = (i, legende) => setImages(liste => liste.map((img, j) => j === i ? { ...img, legende } : img))
  const retirer = (i) => setImages(liste => {
    if (liste[i].apercu) URL.revokeObjectURL(liste[i].apercu)
    return liste.filter((_, j) => j !== i)
  })

  function annuler() {
    images.forEach(img => img.apercu && URL.revokeObjectURL(img.apercu))
    onAnnuler()
  }

  async function enregistrer(e) {
    e.preventDefault()
    if (!nom.trim()) return
    setEnvoi(true)
    setErreur(null)
    const envoyees = []
    try {
      const finales = []
      for (const img of images) {
        if (!img.fichier) { finales.push({ chemin: img.chemin, legende: img.legende.trim() }); continue }
        const { blob, extension, type: mime } = await reduireImage(img.fichier)
        const chemin = `${crypto.randomUUID()}.${extension}`
        const { error } = await stockage.upload(chemin, blob, { contentType: mime, upsert: false })
        if (error) throw new Error(`Envoi d’une image refusé : ${error.message}`)
        envoyees.push(chemin)
        finales.push({ chemin, legende: img.legende.trim() })
      }
      const ligne = { type, nom: nom.trim(), fonction: fonction.trim(), titre: titre.trim(), texte: texte.trim(), images: finales }
      const { error } = fiche
        ? await client.from('fiches').update(ligne).eq('id', fiche.id)
        : await client.from('fiches').insert({ ...ligne, ordre })
      if (error) throw new Error(`Enregistrement refusé : ${error.message}`)

      const gardes = new Set(finales.map(i => i.chemin))
      const retirees = (fiche?.images ?? []).map(i => i.chemin).filter(c => dansLeBucket(c) && !gardes.has(c))
      let avertissement = null
      if (retirees.length) {
        const { error: errRetrait } = await stockage.remove(retirees)
        if (errRetrait) avertissement = `Fiche enregistrée, mais une image retirée n’a pas pu être effacée : ${errRetrait.message}`
      }
      images.forEach(img => img.apercu && URL.revokeObjectURL(img.apercu))
      imagesRef.current = []   // déjà révoquées : le nettoyage au démontage ne doit pas les révoquer deux fois
      onFini(avertissement)
    } catch (err) {
      if (envoyees.length) await stockage.remove(envoyees)
      setErreur(err.message)
      setEnvoi(false)
    }
  }

  const champ = (id, libelle, valeur, maj, props = {}) => (
    <div>
      <label htmlFor={id} className="block font-inter text-text-primary text-sm font-medium mb-2">{libelle}</label>
      {props.multi
        ? <textarea id={id} rows={props.rows ?? 3} value={valeur} onChange={e => maj(e.target.value)}
                    className={CHAMP + ' resize-y leading-relaxed'} />
        : <input id={id} type="text" value={valeur} onChange={e => maj(e.target.value)}
                 required={props.required} className={CHAMP} />}
    </div>
  )

  return (
    <form onSubmit={enregistrer} noValidate className="bg-white rounded-2xl border border-black/10 p-6 mb-10">
      {/* `disabled` sur ce fieldset se propage à tous les champs et boutons descendants
          (y compris ceux du fieldset « Images » imbriqué) : pendant l'enregistrement,
          plus aucune saisie ne peut être perdue ou envoyée en double. Le fieldset porte
          l'espacement vertical (`space-y-5`) : c'est lui, et non plus le <form>, qui a les
          champs comme enfants directs ; ses styles de bordure/marge par défaut sont
          neutralisés pour rester invisible dans la mise en page. */}
      <fieldset disabled={envoi} className="space-y-5 min-w-0 border-0 p-0 m-0">
        <h3 className="font-poppins font-bold text-text-primary text-base">
          {fiche ? `Modifier « ${fiche.nom} »` : 'Nouvelle fiche'}
        </h3>
        {champ('fiche-nom', 'Nom', nom, setNom, { required: true })}
        {champ('fiche-fonction', 'Fonction ou métier', fonction, setFonction)}
        {champ('fiche-titre', 'Phrase mise en avant', titre, setTitre, { multi: true, rows: 2 })}
        {champ('fiche-texte', 'Texte', texte, setTexte, { multi: true, rows: 8 })}
        <p className="font-inter text-xs text-text-secondary/70 -mt-3">Une ligne vide entre deux paragraphes.</p>

        <fieldset className="space-y-3">
          <legend className="font-inter text-text-primary text-sm font-medium mb-2">Images ({images.length}/{MAX_IMAGES})</legend>
          {images.map((img, i) => (
            <div key={img.chemin ?? img.id} className="flex gap-4 items-center">
              <img src={apercu(img)} alt="" className="w-20 h-20 object-cover rounded-lg bg-black/5 shrink-0" />
              <input type="text" value={img.legende} onChange={e => majLegende(i, e.target.value)}
                     aria-label={`Légende de l’image ${i + 1}`} placeholder="Légende (facultative)"
                     className={CHAMP + ' text-sm'} />
              <button type="button" onClick={() => retirer(i)} aria-label={`Retirer l’image ${i + 1}`}
                      className="font-inter text-sm text-red-600 hover:underline cursor-pointer shrink-0">
                Retirer
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <div>
              <label htmlFor="fiche-image" className="block font-inter text-sm text-green-accent mb-1">Ajouter une image</label>
              <input key={cleChamp} id="fiche-image" type="file" accept="image/*"
                     onChange={e => ajouter(e.target.files?.[0])}
                     className="block font-inter text-sm text-text-secondary" />
            </div>
          )}
        </fieldset>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={!nom.trim() || envoi} className={BOUTON}>
            {envoi ? 'Enregistrement…' : 'Enregistrer la fiche'}
          </button>
          <button type="button" onClick={annuler} disabled={envoi}
                  className="font-inter text-sm text-text-secondary hover:underline cursor-pointer">
            Annuler
          </button>
          {erreur && <span role="alert" className="font-inter text-sm text-red-600">{erreur}</span>}
        </div>
      </fieldset>
    </form>
  )
}
