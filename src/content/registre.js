import { TIMELINE, DIPLOMES, PADEL, HOMMAGES, TEMOIGNAGES } from './data/histoire'
import { STEPS, GALERIE } from './data/bilan'
import { MODALITES, REFERENCES } from './data/suivi'
import { COMPOSANTES, ATHLETES } from './data/projet'
import { FORMATS } from './data/entreprise'
import { TESTIMONIALS } from './data/temoignages'
import { HOURS } from './data/contact'
import { SECTIONS as ML_SECTIONS, PARAGRAPHES as ML_PARAS } from './data/mentions'

/* ── Fabriques ──────────────────────────────────────────────────────── */

const champ = (cle, libelle, defaut, multi = false) => ({ cle, libelle, defaut, multi })

/** Les paragraphes d'un bloc tiennent dans une seule zone de saisie,
 *  séparés par une ligne vide — bien plus maniable que N champs. */
export const PARA_SEP = '\n\n'
const paras = (liste) => liste.join(PARA_SEP)

/** Dérive les champs d'une liste de données : un groupe de champs par entrée. */
function depuisListe(liste, prefixe, colonnes) {
  return liste.flatMap((entree, i) =>
    colonnes
      .filter(([prop]) => entree[prop] !== undefined && entree[prop] !== null)
      .map(([prop, libelle, multi, transforme]) =>
        champ(
          `${prefixe}.${i}.${prop}`,
          `${i + 1}. ${libelle}`,
          transforme ? transforme(entree[prop]) : entree[prop],
          multi,
        ),
      ),
  )
}

/* ── Pages ──────────────────────────────────────────────────────────── */

export const PAGES = [
  {
    id: 'navigation', titre: 'Navigation', route: '/',
    groupes: [
      { id: 'menu', titre: 'Barre du haut', champs: [
        champ('nav.histoire',   'Lien 1', 'Histoire & formation'),
        champ('nav.bilan',      'Lien 2', 'Bilan ostéopathique'),
        champ('nav.suivi',      'Lien 3', 'Suivi haut niveau'),
        champ('nav.projet',     'Lien 4', 'Projet sportif'),
        champ('nav.remise',     'Lien 5', 'Remise en forme'),
        champ('nav.rdv',        'Bouton', 'Prendre rendez-vous'),
      ]},
    ],
  },
  {
    id: 'accueil', titre: 'Accueil', route: '/',
    groupes: [
      { id: 'hero', titre: 'Bandeau', champs: [
        champ('hero.citation', 'Phrase signature', "UN DES HOMMES DE L'OMBRE"),
        champ('hero.histoire', 'Lien sous l’arbre', 'HISTOIRE ET FORMATION'),
        champ('hero.nom',      'Nom',               'EMMANUEL KRIEGER'),
        champ('hero.fonction', 'Fonction et lieu',  'OSTÉOPATHE ET COACHING DU SPORT À FURDENHEIM'),
      ]},
      { id: 'balles', titre: 'Les quatre balles', champs: [
        champ('balle.suivi',  'Haut gauche', 'SUIVI DES\nSPORTIFS DE\nHAUT NIVEAU', true),
        champ('balle.projet', 'Haut droite', 'PROJET\nSPORTIF\nPERSONNALISÉ', true),
        champ('balle.bilan',  'Bas gauche',  'BILAN,\nTRAITEMENT\nET SOIN\nOSTÉOPATHIQUE\nEN CABINET', true),
        champ('balle.remise', 'Bas droite',  'PROGRAMME\nET SUIVI DE\nREMISE\nEN FORME', true),
      ]},
      { id: 'carrousel', titre: 'Le carrousel', champs: [
        champ('slide1.titre', '1. Titre',       'Ostéopathie\ndu sport', true),
        champ('slide1.texte', '1. Description', "Traitement des douleurs musculaires, articulaires et tendineuses liées à la pratique sportive. Une approche manuelle précise pour vous remettre en mouvement.", true),
        champ('slide1.cta',   '1. Bouton',      'Découvrir'),
        champ('slide2.titre', '2. Titre',       'Coaching\npersonnalisé', true),
        champ('slide2.texte', '2. Description', "Programmes d'entraînement sur mesure adaptés à vos objectifs, votre niveau et votre emploi du temps. Une méthode unique alliant performance et plaisir.", true),
        champ('slide2.cta',   '2. Bouton',      'Découvrir'),
        champ('slide3.titre', '3. Titre',       'Préparation\nphysique', true),
        champ('slide3.texte', '3. Description', "Renforcement musculaire, mobilité et travail de l'endurance pour repousser vos limites. Des protocoles adaptés à chaque discipline sportive.", true),
        champ('slide3.cta',   '3. Bouton',      'En savoir plus'),
        champ('slide4.titre', '4. Titre',       'Suivi de\nperformance', true),
        champ('slide4.texte', '4. Description', "Analyse régulière de vos progrès, ajustement continu des programmes et accompagnement sur le long terme pour atteindre votre meilleur niveau.", true),
        champ('slide4.cta',   '4. Bouton',      'En savoir plus'),
      ]},
      { id: 'apropos', titre: 'À propos', champs: [
        champ('apropos.surtitre', 'Pastille',            'À PROPOS'),
        champ('apropos.titre1',   'Titre, 1re ligne',    'Une approche globale'),
        champ('apropos.titre2',   'Titre, 2e ligne',     'de votre santé'),
        champ('apropos.texte1',   'Paragraphe 1',        "Diplômé en ostéopathie et certifié coach sportif, je vous accompagne avec une méthode unique qui combine traitement ostéopathique et coaching personnalisé pour optimiser votre performance et prévenir les blessures.", true),
        champ('apropos.texte2',   'Paragraphe 2',        "Que vous soyez athlète de haut niveau ou sportif amateur, mon approche s'adapte à vos besoins spécifiques.", true),
        champ('apropos.legende',  'Légende de la photo', 'Ostéopathe D.O. · Coach sportif'),
      ]},
      { id: 'temoins', titre: 'Témoignages', champs: [
        champ('temoins.surtitre', 'Pastille', 'TÉMOIGNAGES'),
        ...depuisListe(TESTIMONIALS, 'temoin', [
          ['text', 'Extrait', true], ['author', 'Nom'], ['role', 'Fonction'],
        ]),
        champ('temoins.amorce', 'Phrase avant les liens', "Des athlètes, des entraîneurs et des hommes qui ont compté m'ont adressé leurs mots.", true),
        champ('temoins.lien1',  'Bouton 1', 'Remerciements & témoignages →'),
        champ('temoins.lien2',  'Bouton 2', 'Hommages →'),
      ]},
      { id: 'contact', titre: 'Contact', champs: [
        champ('contact.surtitre',       'Pastille',          'CONTACT & HORAIRES'),
        champ('contact.titre',          'Titre',             'Prendre rendez-vous'),
        champ('contact.adresse.titre',  'Libellé adresse',   'Adresse'),
        champ('contact.adresse',        'Adresse',           '34 Rue de Strasbourg\n67117 Furdenheim', true),
        champ('contact.mail.titre',     'Libellé e-mail',    'E-mail'),
        champ('contact.mail',           'Adresse e-mail',    'krieger.manu@orange.fr'),
        champ('contact.bouton',         'Bouton',            'Réserver en ligne →'),
      ]},
      { id: 'horaires', titre: 'Horaires d’ouverture', champs: [
        champ('contact.horaires.titre', 'Titre du bloc', "Horaires d'ouverture"),
        ...depuisListe(HOURS, 'jour', [['day', 'Jour'], ['hours', 'Horaire']]),
      ]},
    ],
  },
  {
    id: 'histoire', titre: 'Histoire et formation', route: '/histoire',
    groupes: [
      { id: 'hero', titre: 'Bandeau', champs: [
        champ('histoire.surtitre', 'Pastille',         'HISTOIRE & FORMATION'),
        champ('histoire.titre1',   'Titre, 1re ligne', 'Histoire'),
        champ('histoire.titre2',   'Titre, 2e ligne',  '& formation'),
        champ('histoire.chapo',    'Introduction',     "De l'écurie alsacienne aux parquets de Pro A — le chemin d'un praticien formé par la passion du sport et du soin.", true),
      ]},
      { id: 'parcours', titre: 'Parcours', champs: depuisListe(TIMELINE, 'chapitre', [
        ['period', 'Titre'], ['years', 'Période'],
        ['paragraphs', 'Texte (une ligne vide entre les paragraphes)', true, paras],
      ])},
      { id: 'diplomes', titre: 'Formations & certifications', champs: [
        champ('diplomes.titre', 'Titre de la section', 'Formations & certifications'),
        ...DIPLOMES.map((d, i) => champ(`diplome.${i}`, `Ligne ${i + 1}`, d)),
      ]},
      { id: 'padel', titre: 'Galerie padel', champs: [
        champ('padel.surtitre', 'Pastille',         'PADEL'),
        champ('padel.titre1',   'Titre, 1re ligne', 'Le padel,'),
        champ('padel.titre2',   'Titre, 2e ligne',  'une nouvelle passion'),
        champ('padel.chapo',    'Introduction',     "Découvert en 2025 au Club Med Opio, le padel est devenu un terrain de jeu quotidien — et un nouveau champ d'accompagnement, du Grand Est au Maroc.", true),
        ...depuisListe(PADEL, 'padel', [['legende', 'Légende']]),
      ]},
      { id: 'hommages', titre: 'Hommages', champs: [
        champ('hommages.surtitre', 'Pastille',         'HOMMAGES'),
        champ('hommages.titre1',   'Titre, 1re ligne', "Ceux qui m'ont"),
        champ('hommages.titre2',   'Titre, 2e ligne',  'marqué'),
        ...depuisListe(HOMMAGES, 'hommage', [
          ['nom', 'Nom'], ['role', 'Fonction'], ['citation', 'Citation mise en avant', true],
          ['paragraphes', 'Texte (une ligne vide entre les paragraphes)', true, paras],
        ]),
      ]},
      { id: 'temoignages', titre: 'Remerciements & témoignages', champs: [
        champ('temoignages.surtitre', 'Pastille', 'TÉMOIGNAGES'),
        champ('temoignages.titre',    'Titre',    'Remerciements & témoignages'),
        ...depuisListe(TEMOIGNAGES, 'temoignage', [
          ['nom', 'Nom'], ['role', 'Fonction'], ['extrait', 'Extrait affiché', true],
          ['paragraphes', 'Texte complet (une ligne vide entre les paragraphes)', true, paras],
        ]),
      ]},
      { id: 'galerie', titre: 'Moments marquants', champs: [
        champ('galerie.surtitre', 'Pastille', 'GALERIE'),
        champ('galerie.titre',    'Titre',    'Moments marquants'),
      ]},
    ],
  },
  {
    id: 'bilan', titre: 'Bilan ostéopathique', route: '/bilan-osteopathique',
    groupes: [
      { id: 'hero', titre: 'Bandeau', champs: [
        champ('bilan.surtitre', 'Pastille',         'EN CABINET'),
        champ('bilan.titre1',   'Titre, 1re ligne', 'Bilan, traitement'),
        champ('bilan.titre2',   'Titre, 2e ligne',  '& soin ostéopathique'),
        champ('bilan.chapo',    'Introduction',     'Une approche globale et individualisée du soin ostéopathique — en cabinet, adaptée à chaque patient.', true),
      ]},
      { id: 'etapes', titre: 'Déroulement', champs: [
        champ('bilan.etapes.surtitre', 'Pastille', 'DÉROULEMENT'),
        champ('bilan.etapes.titre',    'Titre',    'Comment ça fonctionne'),
        ...depuisListe(STEPS, 'etape', [['title', 'Titre'], ['body', 'Texte', true]]),
      ]},
      { id: 'cta', titre: 'Prendre rendez-vous', champs: [
        champ('bilan.cta.titre', 'Titre',  'Prendre rendez-vous'),
        champ('bilan.cta.texte', 'Texte',  'Le premier rendez-vous est une séance ostéopathique complète. Aucun bilan préalable nécessaire.', true),
        champ('bilan.cta.bouton', 'Bouton', 'Prendre rendez-vous →'),
      ]},
    ],
  },
  {
    id: 'suivi', titre: 'Suivi des sportifs de haut niveau', route: '/suivi-sportif',
    groupes: [
      { id: 'hero', titre: 'Bandeau', champs: [
        champ('suivi.surtitre', 'Pastille',         'HAUT NIVEAU'),
        champ('suivi.titre1',   'Titre, 1re ligne', 'Suivi des sportifs'),
        champ('suivi.titre2',   'Titre, 2e ligne',  'de haut niveau'),
        champ('suivi.chapo',    'Introduction',     "L'ensemble des outils et techniques ostéopathiques disponibles est utilisé pour optimiser la performance, la récupération et la longévité sportive.", true),
      ]},
      { id: 'approche', titre: 'Approche', champs: [
        champ('suivi.approche.surtitre', 'Pastille',    'APPROCHE'),
        champ('suivi.approche.titre',    'Paragraphe 1', "Mise en place d'un suivi ostéopathique spécifique pour les sportifs de haut niveau.", true),
        champ('suivi.approche.texte',    'Paragraphe 2', "L'ensemble des outils et techniques ostéopathiques disponibles est utilisé pour optimiser la performance, la récupération et la longévité sportive.", true),
        ...depuisListe(MODALITES, 'modalite', [['title', 'Modalité']]),
      ]},
      { id: 'resultats', titre: 'Avant / après', champs: [
        champ('suivi.resultats.surtitre', 'Pastille', 'RÉSULTATS'),
        champ('suivi.resultats.titre',    'Titre',    'Avant & après'),
      ]},
      { id: 'references', titre: 'Clubs & athlètes', champs: [
        champ('suivi.refs.surtitre', 'Pastille',         'PARCOURS'),
        champ('suivi.refs.titre1',   'Titre, 1re ligne', 'Clubs & athlètes'),
        champ('suivi.refs.titre2',   'Titre, 2e ligne',  'accompagnés'),
        ...depuisListe(REFERENCES, 'reference', [['nom', 'Nom'], ['texte', 'Texte', true]]),
      ]},
    ],
  },
  {
    id: 'projet', titre: 'Projet sportif personnalisé', route: '/projet-sportif',
    groupes: [
      { id: 'hero', titre: 'Bandeau', champs: [
        champ('projet.surtitre', 'Pastille',         'SUR MESURE'),
        champ('projet.titre1',   'Titre, 1re ligne', 'Projet sportif'),
        champ('projet.titre2',   'Titre, 2e ligne',  'personnalisé'),
        champ('projet.chapo',    'Introduction',     'Vous avez un objectif sportif ? Après un bilan complet, nous définissons ensemble un projet cohérent, réaliste et totalement individualisé.', true),
        champ('projet.citation', 'Citation',         "Tout commence par un bilan ostéopathique complet et un rendez-vous de définition d'objectifs.", true),
      ]},
      { id: 'composantes', titre: 'Prise en charge', champs: [
        champ('projet.prise.surtitre', 'Pastille', 'PRISE EN CHARGE'),
        ...depuisListe(COMPOSANTES, 'composante', [['label', 'Titre'], ['desc', 'Texte', true]]),
      ]},
      { id: 'athletes', titre: 'Athlètes accompagnés', champs: [
        champ('projet.athletes.surtitre', 'Pastille', 'ATHLÈTES QUI NOUS ACCOMPAGNENT'),
        ...depuisListe(ATHLETES, 'athlete', [['nom', 'Nom'], ['detail', 'Détail']]),
      ]},
      { id: 'tarifs', titre: 'Tarifs et contact', champs: [
        champ('projet.tarifs', 'Mention tarifaire', "Les tarifs sont variables, définis en fonction du niveau d'accompagnement demandé et adaptés individuellement à chaque projet.", true),
        champ('projet.bouton', 'Bouton',            'Discutons de votre projet →'),
      ]},
    ],
  },
  {
    id: 'entreprise', titre: 'Intervention en entreprise', route: '/intervention-entreprise',
    groupes: [
      { id: 'hero', titre: 'Bandeau', champs: [
        champ('entreprise.surtitre', 'Pastille',         'ENTREPRISE'),
        champ('entreprise.titre1',   'Titre, 1re ligne', 'Intervention'),
        champ('entreprise.titre2',   'Titre, 2e ligne',  'en entreprise'),
        champ('entreprise.chapo',    'Introduction',     'Ostéopathie directement sur site — pour le bien-être de vos équipes, la prévention des TMS et des événements santé mémorables.', true),
      ]},
      { id: 'formats', titre: 'Formats', champs: [
        champ('entreprise.formats.surtitre', 'Pastille', 'FORMATS'),
        ...depuisListe(FORMATS, 'format', [['title', 'Titre'], ['desc', 'Texte', true]]),
      ]},
      { id: 'cta', titre: 'Contact', champs: [
        champ('entreprise.cta.texte',  'Texte',  'Les modalités sont définies lors d’un entretien préalable, selon vos besoins et votre contexte.', true),
        champ('entreprise.cta.bouton', 'Bouton', 'Nous contacter →'),
      ]},
    ],
  },
  {
    id: 'mentions', titre: 'Mentions légales', route: '/mentions-legales',
    groupes: [
      { id: 'entete', titre: 'En-tête', champs: [
        champ('ml.surtitre', 'Pastille', 'INFORMATIONS LÉGALES'),
        champ('ml.titre',    'Titre',    'Mentions légales'),
      ]},
      ...ML_SECTIONS.map(sec => ({
        id: sec.id, titre: sec.titre, champs: [
          champ(`ml.section.${sec.id}`, 'Titre de la section', sec.titre),
          ...sec.lignes.map(l => champ(l.cle, l.libelle, l.defaut, l.multi)),
        ],
      })),
      { id: 'textes', titre: 'Paragraphes', champs: ML_PARAS.flatMap(b => [
        champ(`${b.cle}.titre`, `${b.titre} — titre`, b.titre),
        champ(b.cle, `${b.titre} — texte`, b.defaut, true),
      ])},
      { id: 'pied', titre: 'Pied de page', champs: [
        champ('ml.maj', 'Mention de mise à jour', 'Dernière mise à jour : septembre 2026.'),
      ]},
    ],
  },
  {
    id: 'remise', titre: 'Programme de remise en forme', route: '/kinesport-furd',
    groupes: [
      { id: 'page', titre: 'Page', champs: [
        champ('remise.surtitre', 'Pastille',         'KINESPORT FURD'),
        champ('remise.titre1',   'Titre, 1re ligne', 'Programme & suivi'),
        champ('remise.titre2',   'Titre, 2e ligne',  'de remise en forme'),
        champ('remise.texte',    'Texte',            'Cette section est en cours de construction.', true),
      ]},
    ],
  },
]

/** { cle: valeur d'origine } */
export const DEFAUTS = Object.fromEntries(
  PAGES.flatMap(p => p.groupes.flatMap(g => g.champs.map(c => [c.cle, c.defaut])))
)

/** Découpe un champ multi-paragraphes en tableau. */
export const enParagraphes = (texte) =>
  String(texte ?? '').split(/\n\s*\n/).map(t => t.trim()).filter(Boolean)
