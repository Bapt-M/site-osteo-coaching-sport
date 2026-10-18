// Diapositives d'origine du carrousel de l'accueil. Elles servent de valeur
// d'origine à la liste `carrousel` du registre, modifiable depuis /admin.

export const SLIDES = [
  {
    titre: 'Ostéopathie\ndu sport',
    texte: "Traitement des douleurs musculaires, articulaires et tendineuses liées à la pratique sportive. Une approche manuelle précise pour vous remettre en mouvement.",
    cta: 'Découvrir',
    href: '/bilan-osteopathique',
    bg: '/images/slider-osteo.jpg',
  },
  {
    titre: 'Coaching\npersonnalisé',
    texte: "Programmes d'entraînement sur mesure adaptés à vos objectifs, votre niveau et votre emploi du temps. Une méthode unique alliant performance et plaisir.",
    cta: 'Découvrir',
    href: '/projet-sportif',
    bg: '/images/slider-coaching.jpg',
    // En portrait, on cadre sur les deux joueurs de gauche.
    bgMobile: '/images/slider-coaching-mobile.jpg',
  },
  {
    titre: 'Préparation\nphysique',
    texte: "Renforcement musculaire, mobilité et travail de l'endurance pour repousser vos limites. Des protocoles adaptés à chaque discipline sportive.",
    cta: 'En savoir plus',
    href: '/projet-sportif',
    bg: '/images/slider-prepa.jpg',
    // Le montage deux panneaux n'a pas de sens en portrait : sur mobile on
    // affiche la photo entière.
    bgMobile: '/images/slider-prepa-mobile.jpg',
  },
  {
    titre: 'Suivi de\nperformance',
    texte: "Analyse régulière de vos progrès, ajustement continu des programmes et accompagnement sur le long terme pour atteindre votre meilleur niveau.",
    cta: 'En savoir plus',
    href: '/suivi-sportif',
    bg: '/images/slider-suivi.jpg',
    bgMobile: '/images/slider-suivi-mobile.jpg',
  },
]

/** Couleurs des diapositives, reprises en boucle : le style reste dans le code. */
export const TEINTES = [
  { accent: 'from-[var(--c-accent-hex)] to-[var(--c-accent-dark-hex)]',         dot: 'var(--c-accent-hex)' },
  { accent: 'from-[var(--c-accent-light-hex)] to-[var(--c-accent-hex)]',        dot: 'var(--c-accent-light-hex)' },
  { accent: 'from-[var(--c-accent-lighter-hex)] to-[var(--c-accent-light-hex)]', dot: 'var(--c-accent-lighter-hex)' },
  { accent: 'from-[var(--c-accent-dark-hex)] to-[var(--c-deep-hex)]',            dot: 'var(--c-accent-dark-hex)' },
]
