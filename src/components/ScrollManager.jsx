import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Sans cela, React Router conserve la position de défilement d'une route à
 * l'autre : on arrive au milieu de la page suivante, et les liens vers une
 * ancre (#hommages, #temoignages) ne font rien.
 *
 * - avec ancre : on défile jusqu'à la section visée ;
 * - sans ancre : on remonte en haut.
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      return
    }
    // La cible n'existe qu'après le rendu de la nouvelle route.
    let annule = false
    const viser = () => {
      if (annule) return
      const cible = document.getElementById(hash.slice(1))
      if (cible) cible.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    const t = window.setTimeout(viser, 60)
    return () => { annule = true; window.clearTimeout(t) }
  }, [pathname, hash])

  return null
}
