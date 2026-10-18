import { Link } from 'react-router-dom'

/** Vrai pour un lien vers une page du site (« /histoire », « /#contact »). */
export const estInterne = (href) => /^\/(?!\/)/.test(href ?? '')

/**
 * Lien saisi dans l'administration : une page du site passe par le routeur,
 * une adresse web s'ouvre dans un nouvel onglet, mailto: et tel: restent tels
 * quels. Sans destination, le contenu s'affiche sans lien.
 */
export default function Lien({ href, children, ...props }) {
  if (!href) return <span {...props}>{children}</span>
  if (estInterne(href)) return <Link to={href} {...props}>{children}</Link>
  const externe = /^https?:\/\//.test(href)
  return (
    <a href={href} {...(externe ? { target: '_blank', rel: 'noreferrer' } : {})} {...props}>
      {children}
    </a>
  )
}
