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

/** URL de l'iframe du lecteur officiel « Embedded Post ». */
export function urlLecteurFacebook(lien) {
  const params = new URLSearchParams({ href: lien.trim(), show_text: 'true', width: '500' })
  return `https://www.facebook.com/plugins/post.php?${params}`
}
