import { useEffect } from 'react'

const SUFFIXE = 'Ostéo et Coaching du Sport — Emmanuel Krieger'

/** Renseigne le titre de l'onglet pour la page courante. */
export default function usePageTitle(titre) {
  useEffect(() => {
    document.title = titre ? `${titre} — ${SUFFIXE}` : SUFFIXE
    return () => { document.title = SUFFIXE }
  }, [titre])
}
