import { useCallback, useEffect, useState } from 'react'
import FicheFormulaire, { dansLeBucket } from './FicheFormulaire'

const LIBELLES = {
  hommage: { titre: 'Hommages', aide: 'Affichés sur la page Histoire, dans cet ordre.' },
  temoignage: { titre: 'Témoignages', aide: 'Affichés sur la page Histoire, dans cet ordre ; les 3 premiers aussi sur l’accueil.' },
}

const PETIT = 'font-inter text-sm hover:underline disabled:opacity-30 disabled:no-underline cursor-pointer'

/** Onglet d'administration d'un type de fiche : liste, ordre, édition, suppression. */
export default function Fiches({ client, type }) {
  const [fiches, setFiches] = useState(null)
  const [edition, setEdition] = useState(undefined)   // undefined : aucune ; null : nouvelle ; ligne : existante
  const [message, setMessage] = useState(null)

  const charger = useCallback(async () => {
    const { data, error } = await client.from('fiches')
      .select('id, type, nom, fonction, titre, texte, images, ordre, cree_le')
      .eq('type', type).order('ordre').order('cree_le')
    if (error) { setMessage({ type: 'erreur', texte: `Lecture impossible : ${error.message}` }); setFiches([]); return }
    setFiches(data ?? [])
  }, [client, type])

  useEffect(() => { setEdition(undefined); setMessage(null); charger() }, [charger])

  async function deplacer(i, pas) {
    const liste = [...fiches]
    ;[liste[i], liste[i + pas]] = [liste[i + pas], liste[i]]
    setFiches(liste)
    // Renumérote toute la liste : robuste même si deux fiches partagent un ordre.
    const reponses = await Promise.all(liste.map((f, k) =>
      f.ordre === k ? null : client.from('fiches').update({ ordre: k }).eq('id', f.id)))
    const echec = reponses.find(r => r?.error)
    if (echec) setMessage({ type: 'erreur', texte: `Ordre non enregistré : ${echec.error.message}` })
    charger()
  }

  async function supprimer(fiche) {
    if (!window.confirm(`Supprimer définitivement la fiche « ${fiche.nom} » ?`)) return
    setMessage(null)
    const { error } = await client.from('fiches').delete().eq('id', fiche.id)
    if (error) { setMessage({ type: 'erreur', texte: `Suppression refusée : ${error.message}` }); return }
    const chemins = (fiche.images ?? []).map(i => i.chemin).filter(dansLeBucket)
    if (chemins.length) {
      const { error: errFichiers } = await client.storage.from('fiches').remove(chemins)
      if (errFichiers) setMessage({ type: 'erreur', texte: `Fiche supprimée, mais ses images n’ont pas pu être effacées : ${errFichiers.message}` })
    }
    charger()
  }

  const { titre, aide } = LIBELLES[type]
  const vignette = (f) => {
    const c = f.images?.[0]?.chemin
    if (!c) return null
    return dansLeBucket(c) ? client.storage.from('fiches').getPublicUrl(c).data.publicUrl : c
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="font-poppins font-bold text-text-primary text-2xl">{titre}</h2>
        <p className="font-inter text-sm text-text-secondary mt-1">{aide}</p>
      </div>

      {message && (
        <p role="alert" className={`font-inter text-sm mb-6 ${message.type === 'erreur' ? 'text-red-600' : 'text-green-accent'}`}>
          {message.texte}
        </p>
      )}

      {edition !== undefined ? (
        <FicheFormulaire
          key={edition?.id ?? 'nouvelle'}
          client={client} type={type} fiche={edition}
          ordre={fiches?.length ? Math.max(...fiches.map(f => f.ordre)) + 1 : 0}
          onAnnuler={() => setEdition(undefined)}
          onFini={(avertissement) => {
            setEdition(undefined)
            setMessage(avertissement ? { type: 'erreur', texte: avertissement } : { type: 'succes', texte: 'Fiche enregistrée.' })
            charger()
          }}
        />
      ) : (
        <button type="button" onClick={() => { setMessage(null); setEdition(null) }}
                className="mb-8 px-6 py-2.5 rounded-full bg-green-accent text-white font-poppins font-bold text-sm hover:bg-teal-accent transition-colors cursor-pointer">
          Ajouter une fiche
        </button>
      )}

      {fiches === null
        ? <p className="font-inter text-text-secondary">Chargement…</p>
        : fiches.length === 0
          ? <p className="font-inter text-text-secondary">Aucune fiche pour l’instant.</p>
          : (
            <ul className="space-y-4">
              {fiches.map((f, i) => (
                <li key={f.id} className="flex gap-5 items-start bg-white rounded-2xl border border-black/10 p-4">
                  {vignette(f)
                    ? <img src={vignette(f)} alt="" className="w-20 h-20 object-cover rounded-lg bg-black/5 shrink-0" />
                    : <div className="w-20 h-20 rounded-lg bg-black/5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div data-testid="fiche-nom" className="font-poppins font-bold text-text-primary">{f.nom}</div>
                    <div className="font-inter text-sm text-text-secondary">{f.fonction}</div>
                    {f.titre && <p className="font-inter text-sm text-text-secondary/80 mt-2 line-clamp-2">« {f.titre} »</p>}
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <button type="button" onClick={() => deplacer(i, -1)} disabled={i === 0}
                              aria-label={`Monter « ${f.nom} »`} className={PETIT + ' text-text-secondary'}>↑ Monter</button>
                      <button type="button" onClick={() => deplacer(i, 1)} disabled={i === fiches.length - 1}
                              aria-label={`Descendre « ${f.nom} »`} className={PETIT + ' text-text-secondary'}>↓ Descendre</button>
                      <button type="button" onClick={() => { setMessage(null); setEdition(f) }}
                              className={PETIT + ' text-green-accent'}>Modifier</button>
                      <button type="button" onClick={() => supprimer(f)}
                              className={PETIT + ' text-red-600'}>Supprimer</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
    </>
  )
}
