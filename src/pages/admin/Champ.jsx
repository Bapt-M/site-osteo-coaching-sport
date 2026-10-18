import { createContext, useContext, useRef, useState } from 'react'
import { DEFAUTS, PAGES, lireListe } from '../../content/registre'
import { reduireImage } from '../../lib/image'
import { urlMedia } from '../../lib/supabase'

/** Classes des zones de saisie de l'administration. */
export const CHAMP = 'w-full rounded-lg border border-black/15 bg-white px-4 py-3 font-inter text-text-primary ' +
                     'outline-none focus:border-green-accent focus:ring-2 focus:ring-green-accent/25 transition'

const PETIT = 'font-inter text-xs hover:underline disabled:opacity-30 disabled:no-underline cursor-pointer'

/**
 * Client Supabase de l'éditeur et signalement des photos envoyées : une photo
 * envoyée puis remplacée avant l'enregistrement est effacée du bucket à
 * l'enregistrement suivant (voir Admin.jsx).
 */
export const ContexteMedias = createContext({ client: null, onEnvoi: () => {} })

/* ── Saisies élémentaires ───────────────────────────────────────────── */

function SaisieTexte({ id, valeur, onChange, multi, label }) {
  return multi ? (
    <textarea
      id={id} aria-label={label} rows={Math.min(14, String(valeur ?? '').split('\n').length + 1)}
      value={valeur ?? ''} onChange={e => onChange(e.target.value)}
      className={CHAMP + ' resize-y leading-relaxed'}
    />
  ) : (
    <input id={id} aria-label={label} type="text" value={valeur ?? ''}
           onChange={e => onChange(e.target.value)} className={CHAMP} />
  )
}

/** Destinations proposées à la saisie d'un lien : les pages du site. */
const PAGES_DU_SITE = [...new Set(PAGES.map(p => p.route))]
  .concat(['/#contact', '/histoire#hommages', '/histoire#temoignages', '/intervention-entreprise'])

/** Un lien valide : page du site, adresse web, e-mail ou téléphone. */
export const lienValide = (v) => !v || /^(\/(?!\/)|https?:\/\/|mailto:|tel:)/.test(v)

function SaisieLien({ id, valeur, onChange, label }) {
  const v = valeur ?? ''
  return (
    <div>
      <input id={id} aria-label={label} type="text" value={v} list="pages-du-site"
             placeholder="/histoire ou https://…" onChange={e => onChange(e.target.value.trim())}
             className={CHAMP + ' text-sm'} />
      {!lienValide(v) && (
        <p role="alert" className="font-inter text-xs text-red-600 mt-1">
          Commencez par « / » pour une page du site, ou par https://, mailto: ou tel:.
        </p>
      )}
    </div>
  )
}

/** Liste commune des pages du site, pour l'autocomplétion des liens. */
export function PagesDuSite() {
  return (
    <datalist id="pages-du-site">
      {PAGES_DU_SITE.map(r => <option key={r} value={r} />)}
    </datalist>
  )
}

/**
 * Une photo : aperçu, remplacement, retrait. La photo choisie est réduite
 * (WebP) puis envoyée tout de suite dans le bucket `medias` ; la valeur du
 * champ devient son chemin, enregistré avec le reste par la barre du bas.
 */
function SaisieImage({ id, valeur, onChange, label }) {
  const { client, onEnvoi } = useContext(ContexteMedias)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState(null)
  const champFichier = useRef(null)
  const src = urlMedia(valeur)

  async function choisir(fichier) {
    if (!fichier) return
    setEnvoi(true)
    setErreur(null)
    try {
      const { blob, extension, type } = await reduireImage(fichier)
      const chemin = `${crypto.randomUUID()}.${extension}`
      const { error } = await client.storage.from('medias').upload(chemin, blob, { contentType: type, upsert: false })
      if (error) throw new Error(error.message)
      onEnvoi(chemin)
      onChange(chemin)
    } catch (err) {
      setErreur(`Envoi refusé : ${err.message}`)
    } finally {
      setEnvoi(false)
      if (champFichier.current) champFichier.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-4">
      {src
        ? <img src={src} alt="" className="w-24 h-24 object-cover rounded-lg bg-black/5 shrink-0" />
        : <div className="w-24 h-24 rounded-lg bg-black/5 shrink-0 flex items-center justify-center font-inter text-xs text-text-secondary/60">aucune</div>}
      <div className="flex flex-col items-start gap-2 min-w-0">
        <label className={`font-inter text-sm text-green-accent hover:underline cursor-pointer ${envoi ? 'opacity-50 pointer-events-none' : ''}`}>
          {envoi ? 'Envoi…' : src ? 'Remplacer la photo' : 'Ajouter une photo'}
          <input ref={champFichier} id={id} aria-label={label} type="file" accept="image/*" className="sr-only"
                 disabled={envoi} onChange={e => choisir(e.target.files?.[0])} />
        </label>
        {src && (
          <button type="button" onClick={() => onChange('')} disabled={envoi}
                  className="font-inter text-sm text-red-600 hover:underline cursor-pointer">
            Retirer la photo
          </button>
        )}
        {erreur && <span role="alert" className="font-inter text-xs text-red-600">{erreur}</span>}
      </div>
    </div>
  )
}

/* ── Listes ─────────────────────────────────────────────────────────── */

/** Boutons d'un élément de liste : monter, descendre, supprimer. */
function Actions({ i, total, nom, deplacer, supprimer }) {
  return (
    <div className="flex items-center gap-3 shrink-0">
      <button type="button" onClick={() => deplacer(i, -1)} disabled={i === 0}
              aria-label={`Monter ${nom} ${i + 1}`} className={PETIT + ' text-text-secondary'}>↑ Monter</button>
      <button type="button" onClick={() => deplacer(i, 1)} disabled={i === total - 1}
              aria-label={`Descendre ${nom} ${i + 1}`} className={PETIT + ' text-text-secondary'}>↓ Descendre</button>
      <button type="button" onClick={() => supprimer(i)}
              aria-label={`Supprimer ${nom} ${i + 1}`} className={PETIT + ' text-red-600'}>Supprimer</button>
    </div>
  )
}

/** Opérations communes aux listes : chaque modification renvoie une nouvelle liste. */
function useOperations(elements, onChange) {
  return {
    maj: (i, prop, v) => onChange(elements.map((e, j) => j === i ? { ...e, [prop]: v } : e)),
    deplacer: (i, pas) => {
      const l = [...elements]
      ;[l[i], l[i + pas]] = [l[i + pas], l[i]]
      onChange(l)
    },
    supprimer: (i) => onChange(elements.filter((_, j) => j !== i)),
    ajouter: (vide) => onChange([...elements, vide]),
  }
}

/** Galerie d'un élément de liste (photos d'un espace de la salle…). */
function SaisieGalerie({ id, valeur, onChange, label }) {
  const photos = Array.isArray(valeur) ? valeur : []
  const ops = useOperations(photos, onChange)
  return (
    <div className="space-y-3">
      {photos.map((p, i) => (
        <div key={i} className="rounded-lg border border-black/10 p-3 space-y-3">
          <SaisieImage id={`${id}.${i}.image`} label={`${label} — photo ${i + 1}`}
                       valeur={p.image} onChange={v => ops.maj(i, 'image', v)} />
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[12rem]">
              <SaisieTexte id={`${id}.${i}.legende`} label={`${label} — légende ${i + 1}`}
                           valeur={p.legende} onChange={v => ops.maj(i, 'legende', v)} />
            </div>
            <Actions i={i} total={photos.length} nom="la photo" deplacer={ops.deplacer} supprimer={ops.supprimer} />
          </div>
        </div>
      ))}
      <button type="button" onClick={() => ops.ajouter({ image: '', legende: '' })}
              className="font-inter text-sm text-green-accent hover:underline cursor-pointer">
        + Ajouter une photo
      </button>
    </div>
  )
}

const SAISIES = { texte: SaisieTexte, multi: SaisieTexte, image: SaisieImage, lien: SaisieLien, images: SaisieGalerie }

/** Élément vide d'une liste, selon ses colonnes. */
const vide = (colonnes) => Object.fromEntries(colonnes.map(c => [c.prop, c.type === 'images' ? [] : '']))

function SaisieListe({ champ: { cle, colonnes, element }, valeur, onChange }) {
  const elements = lireListe(valeur, cle)
  const ops = useOperations(elements, l => onChange(JSON.stringify(l)))
  return (
    <div className="space-y-4">
      {elements.map((e, i) => (
        <fieldset key={i} className="rounded-xl border border-black/10 bg-black/[0.02] p-4 space-y-4 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <legend className="font-poppins font-semibold text-text-primary text-sm float-left">{i + 1}.</legend>
            <Actions i={i} total={elements.length} nom={element.replace(/^(un|une) /, '')}
                     deplacer={ops.deplacer} supprimer={ops.supprimer} />
          </div>
          {colonnes.map(c => {
            const Saisie = SAISIES[c.type]
            const id = `${cle}.${i}.${c.prop}`
            return (
              <div key={c.prop} className="clear-both">
                <label htmlFor={c.type === 'images' ? undefined : id}
                       className="block font-inter text-text-secondary text-xs font-medium mb-1.5">{c.libelle}</label>
                <Saisie id={id} label={`${c.libelle} ${i + 1}`} multi={c.type === 'multi'}
                        valeur={e[c.prop]} onChange={v => ops.maj(i, c.prop, v)} />
              </div>
            )
          })}
        </fieldset>
      ))}
      <button type="button" onClick={() => ops.ajouter(vide(colonnes))}
              className="px-4 py-2 rounded-full border border-green-accent/40 text-green-accent font-inter text-sm hover:bg-green-accent/5 cursor-pointer">
        + Ajouter {element}
      </button>
    </div>
  )
}

/* ── Champ du registre ──────────────────────────────────────────────── */

/** Un champ du registre, avec son état « modifié » et le retour à l'original. */
export default function Champ({ champ, valeur, modifie, onChange, onReset, contexte }) {
  const { cle, libelle, type = 'texte', multi, aide } = champ
  const surcharge = valeur !== DEFAUTS[cle]
  const maj = (v) => onChange(cle, v)
  const Saisie = SAISIES[type]
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <label htmlFor={type === 'liste' ? undefined : cle} className="font-inter text-text-primary text-sm font-medium">
          {contexte && <span className="text-text-secondary/60">{contexte} · </span>}
          {libelle}
          {modifie && <span className="ml-2 text-green-accent text-xs">modifié</span>}
        </label>
        {surcharge && (
          <button type="button" onClick={() => onReset(cle)}
                  className="font-inter text-text-secondary/70 hover:text-green-accent text-xs transition-colors cursor-pointer shrink-0">
            rétablir l’original
          </button>
        )}
      </div>
      {aide && <p className="font-inter text-xs text-text-secondary/70 -mt-1 mb-2">{aide}</p>}
      {type === 'liste'
        ? <SaisieListe champ={champ} valeur={valeur} onChange={maj} />
        : <Saisie id={cle} label={libelle} multi={multi} valeur={valeur} onChange={maj} />}
    </div>
  )
}
