import { useEffect, useState } from 'react'
import { lireFiches, versFiche } from '../lib/supabase'
import { FICHES_ORIGINE } from './data/fiches'

/**
 * Hommages et témoignages à afficher. `null` pendant la lecture : on
 * n'affiche pas les fiches d'origine en attendant, sinon une fiche retirée
 * par Manu réapparaîtrait un instant. Si la base ne répond pas, on retombe
 * sur les fiches d'origine — le site ne dépend jamais de Supabase.
 */
export function useFiches() {
  const [fiches, setFiches] = useState(null)
  useEffect(() => {
    let vivant = true
    lireFiches().then(lues => {
      if (vivant) setFiches(lues ?? FICHES_ORIGINE.map(versFiche))
    })
    return () => { vivant = false }
  }, [])
  return fiches
}
