const GESTES = ['wheel', 'touchstart', 'keydown']
const DELAI_DE_GARDE = 30000

/**
 * Amène la section `id` en haut de l'écran et l'y maintient pendant que les
 * images situées au-dessus finissent de charger. Sans cela, sur un vrai
 * réseau, chaque photo qui arrive après le défilement repousse la section
 * vers le bas et le visiteur atterrit au milieu de la section précédente.
 *
 * On revise aussi à chaque changement de hauteur de la page (polices,
 * images chargées au fil du défilement…), que les seuls événements `load`
 * ne voient pas. On lâche prise dès que le visiteur fait défiler lui-même,
 * sinon au bout de 30 s — sur une connexion lente, les photos arrivent tard.
 * Renvoie la fonction qui arrête la surveillance.
 */
export function garderAncre(id) {
  const cible = document.getElementById(id)
  if (!cible) return () => {}

  const viser = () => cible.scrollIntoView({ block: 'start' })
  viser()

  const enAttente = [...document.images].filter(img =>
    !img.complete && (img.compareDocumentPosition(cible) & Node.DOCUMENT_POSITION_FOLLOWING))

  let fini = false
  const surChargement = () => { if (!fini) viser() }
  const arreter = () => {
    if (fini) return
    fini = true
    window.clearTimeout(delai)
    for (const img of enAttente) {
      img.removeEventListener('load', surChargement)
      img.removeEventListener('error', surChargement)
    }
    for (const geste of GESTES) window.removeEventListener(geste, arreter)
    observateur?.disconnect()
  }

  for (const img of enAttente) {
    img.addEventListener('load', surChargement)
    img.addEventListener('error', surChargement)
  }
  for (const geste of GESTES) window.addEventListener(geste, arreter, { passive: true })
  const observateur = typeof ResizeObserver === 'function' ? new ResizeObserver(surChargement) : null
  observateur?.observe(document.body)
  const delai = window.setTimeout(arreter, DELAI_DE_GARDE)

  return arreter
}
