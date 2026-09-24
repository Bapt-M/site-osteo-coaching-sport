export const url = import.meta.env.VITE_SUPABASE_URL
export const cle = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/** Vrai si les variables d'environnement sont renseignées. */
export const supabaseConfigure = Boolean(url && cle)

let instance = null
let chargement = null

/**
 * Charge le client à la demande. `supabase-js` pèse ~200 ko : le sortir du
 * paquet principal évite de le faire télécharger à chaque visiteur avant même
 * l'affichage de la page.
 *
 * Renvoie `null` si la configuration manque — le site doit rester affichable.
 */
export function getSupabase() {
  if (!supabaseConfigure) return Promise.resolve(null)
  if (instance) return Promise.resolve(instance)
  chargement ??= import('@supabase/supabase-js')
    .then(({ createClient }) => {
      instance = createClient(url, cle, { auth: { persistSession: true, autoRefreshToken: true } })
      return instance
    })
    .catch(() => null)
  return chargement
}

/**
 * Lecture des textes publiés, en `fetch` direct plutôt qu'avec le SDK : le
 * site public n'a besoin que d'un SELECT, inutile de lui faire télécharger
 * 200 ko de client. Toute panne renvoie un objet vide, jamais une exception.
 */
export async function lireContenus() {
  if (!supabaseConfigure) return {}
  try {
    const reponse = await fetch(`${url}/rest/v1/site_content?select=cle,valeur`, {
      headers: { apikey: cle, Authorization: `Bearer ${cle}` },
    })
    if (!reponse.ok) return {}
    const lignes = await reponse.json()
    return Object.fromEntries(lignes.map(({ cle, valeur }) => [cle, valeur]))
  } catch {
    return {}
  }
}

/** URL publique d'une photo du bucket `photos`. */
export const urlPhoto = (chemin) => `${url}/storage/v1/object/public/photos/${chemin}`

/**
 * Les dernières photos d'actualité, plus récentes d'abord. Même principe que
 * `lireContenus()` : `fetch` direct, et toute panne renvoie une liste vide.
 */
export async function lirePhotos(limite = 5) {
  if (!supabaseConfigure) return []
  try {
    const reponse = await fetch(
      `${url}/rest/v1/photos?select=id,chemin,description&order=cree_le.desc&limit=${limite}`,
      { headers: { apikey: cle, Authorization: `Bearer ${cle}` } },
    )
    if (!reponse.ok) return []
    const lignes = await reponse.json()
    return lignes.map(({ id, chemin, description }) => ({
      id, url: urlPhoto(chemin), description: description ?? '',
    }))
  } catch {
    return []
  }
}

/**
 * URL d'une image de fiche. Un chemin qui commence par « / » désigne une
 * image livrée avec le site (les fiches d'origine) ; sinon, un objet du
 * bucket `fiches`.
 */
export const urlFiche = (chemin) =>
  chemin.startsWith('/') ? chemin : `${url}/storage/v1/object/public/fiches/${chemin}`

/** Ligne de la table `fiches` → fiche prête à afficher. */
export function versFiche(ligne) {
  return {
    id: ligne.id,
    type: ligne.type,
    nom: ligne.nom ?? '',
    fonction: ligne.fonction ?? '',
    titre: ligne.titre ?? '',
    texte: ligne.texte ?? '',
    images: (ligne.images ?? []).map(i => ({ url: urlFiche(i.chemin), legende: i.legende ?? '' })),
  }
}

/**
 * Hommages et témoignages, dans l'ordre choisi par Manu. Renvoie `null` sur
 * toute panne — l'appelant retombe alors sur les fiches d'origine — mais une
 * liste vide telle quelle : Manu a pu tout retirer.
 */
export async function lireFiches() {
  if (!supabaseConfigure) return null
  try {
    const reponse = await fetch(
      `${url}/rest/v1/fiches?select=id,type,nom,fonction,titre,texte,images&order=ordre.asc,cree_le.asc`,
      { headers: { apikey: cle, Authorization: `Bearer ${cle}` } },
    )
    if (!reponse.ok) return null
    return (await reponse.json()).map(versFiche)
  } catch {
    return null
  }
}
