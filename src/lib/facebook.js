const HOTES = new Set(['www.facebook.com', 'facebook.com', 'm.facebook.com', 'web.facebook.com'])

/**
 * Vrai pour un lien https vers un contenu Facebook. Le lien est saisi dans
 * l'administration puis injecté dans une iframe : on refuse tout le reste
 * plutôt que d'afficher un lecteur vide ou un autre site.
 */
export function lienFacebookValide(lien) {
  if (typeof lien !== 'string') return false
  try {
    const u = new URL(lien.trim())
    return u.protocol === 'https:' && HOTES.has(u.hostname) && u.pathname.length > 1
  } catch {
    return false
  }
}

/**
 * URL de l'iframe du lecteur officiel « Embedded Post ». Facebook n'accepte
 * qu'une largeur entre 350 et 500 px : au-delà, elle est simplement bridée
 * plutôt que rejetée, pour que le lecteur reste lisible sur mobile comme sur
 * un conteneur plus large.
 */
export function urlLecteurFacebook(lien, largeur = 500) {
  const largeurBridee = Math.min(500, Math.max(350, Math.round(largeur)))
  const params = new URLSearchParams({ href: lien.trim(), show_text: 'true', width: String(largeurBridee) })
  return `https://www.facebook.com/plugins/post.php?${params}`
}
