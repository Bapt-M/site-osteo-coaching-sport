// Données éditoriales — slides. Extraites du composant pour servir
// à la fois au rendu et à l'administration.

export const SLIDES = [
  {
    num: '01', cleTitre: 'slide1.titre', cleTexte: 'slide1.texte',
    cta: 'Découvrir',
    href: '/bilan-osteopathique',
    bg: '/images/slider-osteo.jpg',
    accent: 'from-[var(--c-accent-hex)] to-[var(--c-accent-dark-hex)]',
    dot: 'var(--c-accent-hex)',
  },
  {
    num: '02', cleTitre: 'slide2.titre', cleTexte: 'slide2.texte',
    cta: 'Découvrir',
    href: '/projet-sportif',
    bg: '/images/slider-coaching.jpg',
    // En portrait, on cadre sur les deux joueurs de gauche.
    bgMobile: '/images/slider-coaching-mobile.jpg',
    accent: 'from-[var(--c-accent-light-hex)] to-[var(--c-accent-hex)]',
    dot: 'var(--c-accent-light-hex)',
  },
  {
    num: '03', cleTitre: 'slide3.titre', cleTexte: 'slide3.texte',
    cta: 'En savoir plus',
    href: '/projet-sportif',
    bg: '/images/slider-prepa.jpg',
    // Le montage deux panneaux n'a pas de sens en portrait : sur mobile on
    // affiche la photo entière.
    bgMobile: '/images/slider-prepa-mobile.jpg',
    accent: 'from-[var(--c-accent-lighter-hex)] to-[var(--c-accent-light-hex)]',
    dot: 'var(--c-accent-lighter-hex)',
  },
  {
    num: '04', cleTitre: 'slide4.titre', cleTexte: 'slide4.texte',
    cta: 'En savoir plus',
    href: '/suivi-sportif',
    bg: '/images/slider-suivi.jpg',
    bgMobile: '/images/slider-suivi-mobile.jpg',
    accent: 'from-[var(--c-accent-dark-hex)] to-[var(--c-deep-hex)]',
    dot: 'var(--c-accent-dark-hex)',
  },
]
