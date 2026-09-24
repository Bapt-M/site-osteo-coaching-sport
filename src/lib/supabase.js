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
