// Métadonnées de référencement, par page.
//
// Source unique : scripts/prerender.mjs y puise les balises écrites dans le
// HTML livré, et src/hooks/useSeo.js les réapplique côté navigateur lors des
// changements de page. Les deux doivent concorder — un titre au premier
// passage d'un robot et un autre après exécution du JavaScript brouille
// l'indexation.
//
// Les titres visent 60 caractères : au-delà, Google tronque.

export const SITE = 'https://osteo-et-coaching-du-sport.com'
export const NOM = 'Ostéo et Coaching du Sport'
export const TITRE_DEFAUT = `${NOM} — Emmanuel Krieger`

/**
 * `indexable: false` retire la page du sitemap et lui ajoute un noindex :
 * elle reste accessible aux visiteurs, mais Google l'ignore.
 */
export const PAGES = [
  {
    chemin: '/',
    titre: `Ostéopathe à Furdenheim — ${NOM}`,
    description: "Ostéopathe à Furdenheim (67), Emmanuel Krieger allie ostéopathie, coaching et suivi du sportif de haut niveau. Prise de rendez-vous en ligne.",
    priorite: '1.0',
  },
  {
    chemin: '/bilan-osteopathique',
    titre: 'Bilan et soin ostéopathique — Furdenheim',
    description: "Une approche globale et individualisée du soin ostéopathique, en cabinet à Furdenheim, adaptée à chaque patient. Rendez-vous en ligne.",
  },
  {
    chemin: '/suivi-sportif',
    titre: 'Suivi des sportifs de haut niveau — Ostéopathie',
    description: "Les techniques ostéopathiques mises au service de la performance, de la récupération et de la longévité sportive des athlètes de haut niveau.",
  },
  {
    chemin: '/projet-sportif',
    titre: 'Projet sportif personnalisé — Coaching sportif',
    description: "Vous avez un objectif sportif ? Après un bilan complet, nous définissons ensemble un projet cohérent, réaliste et totalement individualisé.",
  },
  {
    chemin: '/intervention-entreprise',
    titre: 'Ostéopathie en entreprise — Prévention des TMS',
    description: "Ostéopathie directement sur site : bien-être des équipes, prévention des troubles musculo-squelettiques et événements santé en entreprise.",
  },
  {
    chemin: '/histoire',
    titre: 'Histoire et formation — Emmanuel Krieger',
    description: "De l'écurie alsacienne aux parquets de Pro A : le parcours d'Emmanuel Krieger, praticien formé par la passion du sport et du soin.",
  },
  {
    chemin: '/kinesport-furd',
    titre: 'Programme de remise en forme — Kinesport Furd',
    description: "Programme et suivi de remise en forme — Kinesport Furd.",
    // Page encore à l'état d'ébauche : « cette section est en cours de
    // construction ». L'indexer exposerait une page vide, ce que Google
    // sanctionne. À repasser en indexable une fois le contenu rédigé.
    indexable: false,
  },
  {
    chemin: '/mentions-legales',
    titre: `Mentions légales — ${NOM}`,
    description: "Mentions légales du site : éditeur, directeur de publication, hébergeur, propriété intellectuelle et données personnelles.",
    priorite: '0.3',
  },
]

/** Métadonnées d'un chemin, ou `null` s'il n'est pas référencé (ex. /admin). */
export function pagePour(chemin) {
  return PAGES.find((p) => p.chemin === chemin) ?? null
}
