import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { pagePour, TITRE_DEFAUT, NOM } from '../content/seo'

/**
 * Aligne le titre de l'onglet et la description sur la page affichée.
 *
 * Le HTML livré porte déjà ces valeurs, écrites au build par
 * scripts/prerender.mjs : ce hook ne sert donc qu'aux navigations internes,
 * où aucun nouveau document n'est chargé. Il puise dans la même table, pour
 * que les deux ne puissent pas diverger.
 */
export default function useSeo() {
  const { pathname } = useLocation()

  useEffect(() => {
    const page = pagePour(pathname)
    document.title = page
      ? page.titre
      : pathname.startsWith('/admin')
        ? `Administration — ${NOM}`
        : TITRE_DEFAUT

    if (page) {
      const balise = document.querySelector('meta[name="description"]')
      if (balise) balise.setAttribute('content', page.description)
    }
  }, [pathname])
}
