import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Durée pendant laquelle on recale la cible si la page change de hauteur. */
const SUIVI_MS = 2000

/**
 * Sans cela, React Router conserve la position de défilement d'une route à
 * l'autre : on arrive au milieu de la page suivante, et les liens vers une
 * ancre (#hommages, #contact) ne font rien.
 *
 * - avec ancre : on défile jusqu'à la section visée, puis on la recale tant
 *   que le contenu chargé au-dessus (photos, publications) la fait bouger ;
 * - sans ancre : on remonte en haut — y compris quand on clique le lien de
 *   la page où l'on est déjà (d'où `key`, qui change à chaque navigation).
 */
export default function ScrollManager() {
  const { pathname, hash, key } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      return
    }
    let annule = false
    const id = decodeURIComponent(hash.slice(1))
    const viser = (behavior) => {
      if (annule) return
      document.getElementById(id)?.scrollIntoView({ behavior, block: 'start' })
    }
    // La cible n'existe qu'après le rendu de la nouvelle route.
    const t = window.setTimeout(() => viser('smooth'), 60)

    // Le contenu chargé ensuite au-dessus de la cible la déplace : on la recale.
    // Le visiteur qui fait défiler lui-même reprend la main.
    const observateur = typeof ResizeObserver === 'function'
      ? new ResizeObserver(() => viser('instant'))
      : null
    observateur?.observe(document.body)
    const lacher = () => { annule = true; observateur?.disconnect() }
    const fin = window.setTimeout(lacher, SUIVI_MS)
    const evenements = ['wheel', 'touchstart', 'keydown']
    evenements.forEach(e => window.addEventListener(e, lacher, { passive: true, once: true }))

    return () => {
      annule = true
      window.clearTimeout(t)
      window.clearTimeout(fin)
      observateur?.disconnect()
      evenements.forEach(e => window.removeEventListener(e, lacher))
    }
  }, [pathname, hash, key])

  return null
}
