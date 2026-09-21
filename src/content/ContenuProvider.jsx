import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { lireContenus } from '../lib/supabase'
import { DEFAUTS } from './defaults'

const ContenuContexte = createContext(DEFAUTS)

/**
 * Charge une fois les textes personnalisés depuis Supabase et les superpose
 * aux valeurs d'origine. Toute panne (Supabase absent, réseau, RLS) laisse le
 * site sur ses textes d'origine — il ne dépend jamais de la base pour s'afficher.
 */
export function ContenuProvider({ children }) {
  const [surcharges, setSurcharges] = useState({})

  useEffect(() => {
    let vivant = true
    lireContenus().then(surcharges => {
      if (vivant) setSurcharges(surcharges)
    })
    return () => { vivant = false }
  }, [])

  const valeur = useMemo(() => ({ ...DEFAUTS, ...surcharges }), [surcharges])
  return <ContenuContexte.Provider value={valeur}>{children}</ContenuContexte.Provider>
}

/** Texte courant pour une clé du registre. */
export function useTexte(cle) {
  const textes = useContext(ContenuContexte)
  return textes[cle] ?? DEFAUTS[cle] ?? ''
}

/** Tous les textes courants (utilisé par les composants qui en lisent plusieurs). */
export function useTextes() {
  return useContext(ContenuContexte)
}
