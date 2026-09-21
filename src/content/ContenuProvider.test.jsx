import { render, screen } from '@testing-library/react'
import { ContenuProvider, useTexte } from './ContenuProvider'
import { DEFAUTS } from './defaults'

function Sonde({ cle }) {
  return <span>{useTexte(cle)}</span>
}

test('affiche la valeur d’origine sans provider', () => {
  render(<Sonde cle="hero.nom" />)
  expect(screen.getByText(DEFAUTS['hero.nom'])).toBeInTheDocument()
})

test('affiche la valeur d’origine quand Supabase ne répond pas', () => {
  render(<ContenuProvider><Sonde cle="hero.citation" /></ContenuProvider>)
  expect(screen.getByText(DEFAUTS['hero.citation'])).toBeInTheDocument()
})

test('renvoie une chaîne vide pour une clé inconnue', () => {
  const { container } = render(<Sonde cle="cle.inexistante" />)
  expect(container.textContent).toBe('')
})
