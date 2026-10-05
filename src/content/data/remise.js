// Données éditoriales — programme de remise en forme (Kinesport Furd).
// Extraites du composant pour servir à la fois au rendu et à l'administration.

export const PUBLICS = [
  { title: 'Reprendre après une pause ou une blessure' },
  { title: 'Se remettre en mouvement quand on est sédentaire' },
  { title: 'Progresser dans sa pratique sportive' },
  { title: 'Garder force, souplesse et équilibre avec l’âge' },
]

export const ETAPES = [
  {
    num: '01',
    title: 'Bilan approfondi',
    body: "Condition physique, antécédents, douleurs éventuelles et objectifs : le regard d'ostéopathe permet de repérer ce qui doit être ménagé et ce qui peut être renforcé.",
  },
  {
    num: '02',
    title: 'Programme sur mesure',
    body: 'Exercices, charges et fréquence sont choisis en fonction de vos objectifs, de votre emploi du temps et de votre condition du moment.',
  },
  {
    num: '03',
    title: 'Séances encadrées',
    body: 'Les séances ont lieu dans la salle du cabinet, avec un accompagnement à chaque exercice pour un geste juste et sans risque.',
  },
  {
    num: '04',
    title: 'Suivi et réajustements',
    body: 'Des points réguliers mesurent vos progrès ; le programme évolue avec vous.',
  },
]

/** Les espaces de la salle, chacun illustré par ses photos (toutes en portrait). */
export const ESPACES = [
  {
    title: 'Cardio',
    body: "Vélo, tapis, elliptique et rameur pour travailler l'endurance et le souffle, à votre rythme.",
    photos: [
      { src: '/images/remise-velo.jpg', alt: 'Échauffement sur le vélo' },
      { src: '/images/remise-tapis.jpg', alt: 'Course sur le tapis' },
      { src: '/images/remise-elliptique.jpg', alt: 'Séance sur le vélo elliptique' },
    ],
  },
  {
    title: 'Renforcement musculaire',
    body: 'Cage à squat, presse et poulie : gagner en force en toute sécurité, avec des charges adaptées à chacun.',
    photos: [
      { src: '/images/remise-developpe-couche.jpg', alt: 'Développé couché à la cage guidée' },
      { src: '/images/remise-presse.jpg', alt: 'Travail des jambes à la presse' },
      { src: '/images/remise-poulie.jpg', alt: 'Tirage à la poulie' },
    ],
  },
  {
    title: 'Équilibre & fonctionnel',
    body: 'Demi-ballon, sangles de suspension, box : proprioception, gainage et mouvements utiles au quotidien.',
    photos: [
      { src: '/images/remise-equilibre.jpg', alt: 'Exercice d’équilibre sur demi-ballon' },
      { src: '/images/remise-trx.jpg', alt: 'Squat avec sangles de suspension' },
    ],
  },
  {
    title: 'Boxe',
    body: 'Le sac de frappe pour la coordination, le cardio… et se défouler.',
    photos: [
      { src: '/images/remise-boxe.jpg', alt: 'Frappe au sac' },
      { src: '/images/remise-boxe-salle.jpg', alt: 'L’espace boxe' },
    ],
  },
]
