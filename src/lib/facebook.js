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
 * Lit ce que Manu a collé dans l'administration : un simple lien de post, ou
 * le code « Intégrer » que Facebook fournit (⋯ du post → Intégrer). Ce code
 * contient le lien permanent du post, le seul que le lecteur accepte à coup
 * sûr — les liens courts de « Copier le lien » (/share/p/…) n'y passent pas
 * toujours.
 *
 * Le code collé n'est jamais injecté tel quel : on n'en garde que le lien du
 * post (paramètre `href`) et la hauteur, et l'iframe est reconstruite par
 * `urlLecteurFacebook()`. Renvoie `{ lien, hauteur }`, ou `null` si la saisie
 * ne mène pas à un post Facebook.
 */
export function lireSaisieFacebook(saisie) {
  if (typeof saisie !== 'string') return null
  const texte = saisie.trim().replaceAll('&amp;', '&')
  const src = texte.match(/\bsrc="([^"]+)"/)?.[1] ?? texte

  let lien = src
  try {
    const u = new URL(src)
    if (u.pathname.startsWith('/plugins/')) {
      if (u.protocol !== 'https:' || !HOTES.has(u.hostname)) return null
      lien = u.searchParams.get('href') ?? ''
    }
  } catch {
    return null
  }
  if (!lienFacebookValide(lien)) return null

  const hauteur = Number(texte.match(/\bheight="(\d+)"/)?.[1])
  return {
    lien: lien.trim(),
    hauteur: hauteur ? Math.min(1500, Math.max(200, hauteur)) : null,
  }
}

/**
 * Hauteur du lecteur pour une largeur donnée. Le code d'intégration indique
 * la hauteur à 500 px de large ; plus étroit, le post raccourcit. En-tête et
 * boutons (~150 px) ne bougent pas, la photo suit la largeur : sans cette
 * correction, un grand vide blanc resterait sous le post sur mobile.
 */
export function hauteurLecteur(hauteur, largeur) {
  const FIXE = 150
  return Math.round(FIXE + (hauteur - FIXE) * largeur / 500)
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
