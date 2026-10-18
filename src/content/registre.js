import { TIMELINE, DIPLOMES, PADEL } from './data/histoire'
import { STEPS, GALERIE } from './data/bilan'
import { MODALITES, REFERENCES } from './data/suivi'
import { COMPOSANTES, ATHLETES } from './data/projet'
import { FORMATS } from './data/entreprise'
import { PUBLICS, ETAPES as ETAPES_REMISE, ESPACES } from './data/remise'
import { HOURS, LIEN_RDV } from './data/contact'
import { SLIDES } from './data/slides'
import { SECTIONS as ML_SECTIONS, PARAGRAPHES as ML_PARAS } from './data/mentions'

/*
 * Registre de tout le contenu modifiable depuis /admin. Chaque champ a une
 * clé (ligne de la table `site_content`), un libellé et une valeur d'origine,
 * affichée tant que Manu ne l'a pas changée. Quatre types :
 *
 * - texte : une ligne, ou plusieurs (`multi`) ;
 * - image : chemin d'une image du site (« /images/… ») ou du bucket `medias` ;
 * - lien  : page du site (« /histoire », « /#contact »), adresse web, mailto: ;
 * - liste : éléments qu'on ajoute, retire et réordonne, enregistrés en JSON.
 *   Chaque élément a les colonnes décrites par `colonnes`.
 *
 * La mise en page, les couleurs et les polices restent dans le code.
 */

/* ── Fabriques ──────────────────────────────────────────────────────── */

const champ = (cle, libelle, defaut, multi = false) => ({ type: 'texte', cle, libelle, defaut, multi })
const image = (cle, libelle, defaut, aide) => ({ type: 'image', cle, libelle, defaut, aide })
const lien = (cle, libelle, defaut) => ({ type: 'lien', cle, libelle, defaut })

/** `element` : nom d'un élément (« une étape »), pour les boutons de l'admin. */
const liste = (cle, libelle, element, colonnes, elements, aide) => ({
  type: 'liste', cle, libelle, element, colonnes, aide, defaut: JSON.stringify(elements),
})
const col = (prop, libelle, type = 'texte') => ({ prop, libelle, type })

/** Les paragraphes d'un bloc tiennent dans une seule zone de saisie,
 *  séparés par une ligne vide — bien plus maniable que N champs. */
export const PARA_SEP = '\n\n'
const paras = (liste) => liste.join(PARA_SEP)

/** Colonnes d'une galerie : une photo et sa légende. */
const PHOTO = [col('image', 'Photo', 'image'), col('legende', 'Légende')]

/* ── Actualités ─────────────────────────────────────────────────────── */

/** Textes de la section Actualités. Hors de `PAGES` : ils s'éditent dans
 *  l'onglet Actualités de l'administration, à côté des photos. */
export const ACTUALITES = {
  id: 'actualites', titre: 'Actualités', route: '/#actualites',
  champs: [
    champ('actu.titre',         'Titre de la section', 'Actualités'),
    champ('actu.facebook.lien', 'Code d’intégration du post (sur Facebook : ⋯ du post → Intégrer → Copier le code) ou lien du post', '', true),
  ],
}

/* ── Pages ──────────────────────────────────────────────────────────── */

export const PAGES = [
  {
    id: 'navigation', titre: 'Navigation et pied de page', route: '/',
    groupes: [
      { id: 'marque', titre: 'Nom du cabinet (logo texte)', champs: [
        champ('marque.ligne1', 'Ligne 1', 'OSTÉO'),
        champ('marque.ligne2', 'Ligne 2', 'ET COACHING'),
        champ('marque.ligne3', 'Ligne 3', 'DU SPORT'),
      ]},
      { id: 'menu', titre: 'Barre du haut', champs: [
        liste('nav.liens', 'Liens du menu', 'un lien', [col('label', 'Texte'), col('lien', 'Lien', 'lien')], [
          { label: 'Histoire & formation', lien: '/histoire' },
          { label: 'Bilan ostéopathique',  lien: '/bilan-osteopathique' },
          { label: 'Suivi haut niveau',    lien: '/suivi-sportif' },
          { label: 'Projet sportif',       lien: '/projet-sportif' },
          { label: 'Remise en forme',      lien: '/kinesport-furd' },
        ]),
        champ('nav.rdv', 'Bouton', 'Prendre rendez-vous'),
      ]},
      { id: 'rdv', titre: 'Prise de rendez-vous', champs: [
        lien('lien.rdv', 'Lien de tous les boutons « Prendre rendez-vous » du site', LIEN_RDV),
      ]},
      { id: 'pied', titre: 'Pied de page', champs: [
        champ('pied.adresse',  'Adresse',               '34 Rue de Strasbourg\n67117 Furdenheim', true),
        champ('pied.identite', 'Nom et fonction',       'Emmanuel Krieger\nOstéopathe & Coach sportif', true),
        champ('pied.pages.titre', 'Titre de la colonne des pages', 'Pages'),
        liste('pied.pages', 'Liens vers les pages', 'un lien', [col('label', 'Texte'), col('lien', 'Lien', 'lien')], [
          { label: 'Histoire et formation',                   lien: '/histoire' },
          { label: 'Bilan, traitement et soin ostéopathique', lien: '/bilan-osteopathique' },
          { label: 'Suivi des sportifs de haut niveau',       lien: '/suivi-sportif' },
          { label: 'Projet sportif personnalisé',             lien: '/projet-sportif' },
          { label: 'Programme et suivi de remise en forme',   lien: '/kinesport-furd' },
        ]),
        champ('pied.contact.titre', 'Titre de la colonne contact', 'Contact'),
        champ('pied.rdv',           'Lien de rendez-vous',         'Prendre rendez-vous'),
        champ('pied.legal.titre',   'Titre des liens légaux',      'Légal'),
        liste('pied.legal', 'Liens légaux', 'un lien', [col('label', 'Texte'), col('lien', 'Lien', 'lien')], [
          { label: 'Mentions légales', lien: '/mentions-legales' },
        ]),
        champ('pied.copyright', 'Mention de droits ({annee} = année en cours)', '© {annee} Emmanuel Krieger. Tous droits réservés.'),
        champ('pied.lieu',      'Lieu',                                       'Furdenheim, Alsace'),
      ]},
    ],
  },
  {
    id: 'accueil', titre: 'Accueil', route: '/',
    groupes: [
      { id: 'hero', titre: 'Bandeau', champs: [
        image('hero.image', 'Photo de fond', '/images/hero-padel.jpg',
              'Le logo est posé sur la raquette : une autre photo doit garder le même cadrage.'),
        champ('hero.citation', 'Phrase signature', "UN DES HOMMES DE L'OMBRE"),
        champ('hero.histoire', 'Lien sous l’arbre', 'HISTOIRE ET FORMATION'),
        lien('hero.histoire.lien', 'Lien sous l’arbre — destination', '/histoire'),
        champ('hero.nom',      'Nom',               'EMMANUEL KRIEGER'),
        champ('hero.fonction', 'Fonction et lieu',  'OSTÉOPATHE ET COACHING DU SPORT À FURDENHEIM'),
        champ('hero.hommages',    'Lien en haut à gauche', 'HOMMAGES'),
        lien('hero.hommages.lien', 'Lien en haut à gauche — destination', '/histoire#hommages'),
        champ('hero.temoignages', 'Lien en haut à droite', 'TÉMOIGNAGES'),
        lien('hero.temoignages.lien', 'Lien en haut à droite — destination', '/histoire#temoignages'),
      ]},
      { id: 'balles', titre: 'Les quatre balles', champs: [
        champ('balle.suivi',  'Haut gauche', 'SUIVI DES\nSPORTIFS DE\nHAUT NIVEAU', true),
        lien('balle.suivi.lien', 'Haut gauche — destination', '/suivi-sportif'),
        champ('balle.projet', 'Haut droite', 'PROJET\nSPORTIF\nPERSONNALISÉ', true),
        lien('balle.projet.lien', 'Haut droite — destination', '/projet-sportif'),
        champ('balle.bilan',  'Bas gauche',  'BILAN,\nTRAITEMENT\nET SOIN\nOSTÉOPATHIQUE\nEN CABINET', true),
        lien('balle.bilan.lien', 'Bas gauche — destination', '/bilan-osteopathique'),
        champ('balle.remise', 'Bas droite',  'PROGRAMME\nET SUIVI DE\nREMISE\nEN FORME', true),
        lien('balle.remise.lien', 'Bas droite — destination', '/kinesport-furd'),
      ]},
      { id: 'carrousel', titre: 'Le carrousel', champs: [
        liste('carrousel', 'Diapositives', 'une diapositive', [
          col('titre', 'Titre', 'multi'), col('texte', 'Description', 'multi'),
          col('cta', 'Bouton'), col('lien', 'Destination du bouton', 'lien'),
          col('image', 'Photo de fond', 'image'), col('imageMobile', 'Photo sur téléphone (facultative)', 'image'),
        ], SLIDES.map(s => ({ titre: s.titre, texte: s.texte, cta: s.cta, lien: s.href, image: s.bg, imageMobile: s.bgMobile ?? '' }))),
      ]},
      { id: 'apropos', titre: 'À propos', champs: [
        image('apropos.image',    'Photo',               '/images/manu-padel-square.jpg'),
        champ('apropos.nom',      'Nom sur la photo',    'Emmanuel Krieger'),
        champ('apropos.legende',  'Légende de la photo', 'Ostéopathe D.O. · Coach sportif'),
        champ('apropos.surtitre', 'Pastille',            'À PROPOS'),
        champ('apropos.titre1',   'Titre, 1re ligne',    'Une approche globale'),
        champ('apropos.titre2',   'Titre, 2e ligne',     'de votre santé'),
        champ('apropos.texte1',   'Paragraphe 1',        "Diplômé en ostéopathie et certifié coach sportif, je vous accompagne avec une méthode unique qui combine traitement ostéopathique et coaching personnalisé pour optimiser votre performance et prévenir les blessures.", true),
        champ('apropos.texte2',   'Paragraphe 2',        "Que vous soyez athlète de haut niveau ou sportif amateur, mon approche s'adapte à vos besoins spécifiques.", true),
        champ('apropos.bouton',   'Lien',                'En savoir plus →'),
        lien('apropos.bouton.lien', 'Lien — destination', '/histoire'),
      ]},
      { id: 'temoins', titre: 'Témoignages', champs: [
        champ('temoins.surtitre', 'Pastille', 'TÉMOIGNAGES'),
        champ('temoins.amorce', 'Phrase avant les liens', "Des athlètes, des entraîneurs et des hommes qui ont compté m'ont adressé leurs mots.", true),
        champ('temoins.lien1',  'Bouton 1', 'Remerciements & témoignages →'),
        lien('temoins.lien1.lien', 'Bouton 1 — destination', '/histoire#temoignages'),
        champ('temoins.lien2',  'Bouton 2', 'Hommages →'),
        lien('temoins.lien2.lien', 'Bouton 2 — destination', '/histoire#hommages'),
      ]},
      { id: 'contact', titre: 'Contact', champs: [
        image('contact.image',          'Photo',             '/images/bureau.jpg'),
        champ('contact.surtitre',       'Pastille',          'CONTACT & HORAIRES'),
        champ('contact.titre',          'Titre',             'Prendre rendez-vous'),
        champ('contact.adresse.titre',  'Libellé adresse',   'Adresse'),
        champ('contact.adresse',        'Adresse',           '34 Rue de Strasbourg\n67117 Furdenheim', true),
        champ('contact.mail.titre',     'Libellé e-mail',    'E-mail'),
        champ('contact.mail',           'Adresse e-mail',    'krieger.manu@orange.fr'),
        champ('contact.bouton',         'Bouton (mène au lien de rendez-vous)', 'Réserver en ligne →'),
      ]},
      { id: 'horaires', titre: 'Horaires d’ouverture', champs: [
        champ('contact.horaires.titre', 'Titre du bloc', "Horaires d'ouverture"),
        liste('contact.horaires', 'Horaires', 'un jour', [col('jour', 'Jour'), col('horaire', 'Horaire')],
              HOURS.map(h => ({ jour: h.day, horaire: h.hours }))),
      ]},
    ],
  },
  {
    id: 'histoire', titre: 'Histoire et formation', route: '/histoire',
    groupes: [
      { id: 'hero', titre: 'Bandeau', champs: [
        image('histoire.image',    'Photo de fond',    '/images/insep.jpg'),
        champ('histoire.surtitre', 'Pastille',         'HISTOIRE & FORMATION'),
        champ('histoire.titre1',   'Titre, 1re ligne', 'Histoire'),
        champ('histoire.titre2',   'Titre, 2e ligne',  '& formation'),
        champ('histoire.chapo',    'Introduction',     "De l'écurie alsacienne aux parquets de Pro A — le chemin d'un praticien formé par la passion du sport et du soin.", true),
      ]},
      { id: 'parcours', titre: 'Parcours', champs: [
        liste('histoire.chapitres', 'Chapitres', 'un chapitre', [
          col('titre', 'Titre'), col('periode', 'Période'), col('image', 'Photo', 'image'),
          col('texte', 'Texte (une ligne vide entre les paragraphes)', 'multi'),
        ], TIMELINE.map(t => ({ titre: t.period, periode: t.years, image: t.img ?? '', texte: paras(t.paragraphs) }))),
      ]},
      { id: 'video', titre: 'Vidéo', champs: [
        champ('video.surtitre', 'Pastille', 'MÉDIAS'),
        champ('video.titre',    'Titre',    'Passage sur FR3'),
        champ('video.texte',    'Texte',    "Reportage France 3 Alsace sur le parcours et la pratique d'Emmanuel Krieger, ostéopathe et coach sportif.", true),
      ]},
      { id: 'diplomes', titre: 'Formations & certifications', champs: [
        champ('diplomes.surtitre', 'Pastille', 'DIPLÔMES'),
        champ('diplomes.titre', 'Titre de la section', 'Formations & certifications'),
        liste('histoire.diplomes', 'Diplômes', 'un diplôme', [col('texte', 'Diplôme')], DIPLOMES.map(texte => ({ texte }))),
      ]},
      { id: 'padel', titre: 'Galerie padel', champs: [
        champ('padel.surtitre', 'Pastille',         'PADEL'),
        champ('padel.titre1',   'Titre, 1re ligne', 'Le padel,'),
        champ('padel.titre2',   'Titre, 2e ligne',  'une nouvelle passion'),
        champ('padel.chapo',    'Introduction',     "Découvert en 2025 au Club Med Opio, le padel est devenu un terrain de jeu quotidien — et un nouveau champ d'accompagnement, du Grand Est au Maroc.", true),
        liste('histoire.padel', 'Photos', 'une photo', PHOTO, PADEL.map(p => ({ image: p.src, legende: p.legende }))),
      ]},
      { id: 'hommages', titre: 'Hommages', fiches: 'hommage', champs: [
        champ('hommages.surtitre', 'Pastille',         'HOMMAGES'),
        champ('hommages.titre1',   'Titre, 1re ligne', "Ceux qui m'ont"),
        champ('hommages.titre2',   'Titre, 2e ligne',  'marqué'),
      ]},
      { id: 'temoignages', titre: 'Remerciements & témoignages', fiches: 'temoignage', champs: [
        champ('temoignages.surtitre', 'Pastille', 'TÉMOIGNAGES'),
        champ('temoignages.titre',    'Titre',    'Remerciements & témoignages'),
      ]},
      { id: 'galerie', titre: 'Moments marquants', champs: [
        champ('galerie.surtitre', 'Pastille', 'GALERIE'),
        champ('galerie.titre',    'Titre',    'Moments marquants'),
        liste('histoire.galerie', 'Photos', 'une photo', PHOTO, [
          { image: '/images/sig-vestiaire.jpg',     legende: 'Vestiaire SIG Basket' },
          { image: '/images/equipe-france-u21.jpg', legende: 'Équipe de France U21 — Vittel' },
          { image: '/images/insep.jpg',             legende: 'INSEP' },
          { image: '/images/malaga.jpg',            legende: 'Malaga' },
          { image: '/images/nissim-manu.jpg',       legende: 'Avec Nissim' },
          { image: '/images/temps-mort-sig.jpg',    legende: 'Temps mort SIG' },
        ], 'La légende décrit la photo pour les lecteurs d’écran ; elle ne s’affiche pas.'),
      ]},
    ],
  },
  {
    id: 'bilan', titre: 'Bilan ostéopathique', route: '/bilan-osteopathique',
    groupes: [
      { id: 'hero', titre: 'Bandeau', champs: [
        image('bilan.image',    'Photo de fond',    '/images/cabinet-1.jpg'),
        champ('bilan.surtitre', 'Pastille',         'EN CABINET'),
        champ('bilan.titre1',   'Titre, 1re ligne', 'Bilan, traitement'),
        champ('bilan.titre2',   'Titre, 2e ligne',  '& soin ostéopathique'),
        champ('bilan.chapo',    'Introduction',     'Une approche globale et individualisée du soin ostéopathique — en cabinet, adaptée à chaque patient.', true),
      ]},
      // `fiches` : le groupe affiche aussi, sous ses champs, la gestion des fiches de ce type.
      { id: 'equipe', titre: 'Les ostéopathes du cabinet', fiches: 'osteopathe', champs: [
        champ('bilan.equipe.surtitre', 'Pastille',         'LE CABINET'),
        champ('bilan.equipe.titre1',   'Titre, 1re ligne', 'Deux ostéopathes,'),
        champ('bilan.equipe.titre2',   'Titre, 2e ligne',  'une même exigence'),
      ]},
      { id: 'etapes', titre: 'Déroulement', champs: [
        champ('bilan.etapes.surtitre', 'Pastille', 'DÉROULEMENT'),
        champ('bilan.etapes.titre',    'Titre',    'Comment ça fonctionne'),
        liste('bilan.etapes', 'Étapes (numérotées automatiquement)', 'une étape',
              [col('titre', 'Titre'), col('texte', 'Texte', 'multi')],
              STEPS.map(s => ({ titre: s.title, texte: s.body }))),
      ]},
      { id: 'galerie', titre: 'Galerie du cabinet', champs: [
        liste('bilan.galerie', 'Photos', 'une photo', PHOTO, GALERIE.map(g => ({ image: g.src, legende: g.alt })),
              'La légende décrit la photo pour les lecteurs d’écran ; elle ne s’affiche pas.'),
      ]},
      { id: 'cta', titre: 'Prendre rendez-vous', champs: [
        champ('bilan.cta.titre', 'Titre',  'Prendre rendez-vous'),
        champ('bilan.cta.texte', 'Texte',  'Le premier rendez-vous est une séance ostéopathique complète. Aucun bilan préalable nécessaire.', true),
        champ('bilan.cta.bouton', 'Bouton (mène au lien de rendez-vous)', 'Prendre rendez-vous →'),
      ]},
    ],
  },
  {
    id: 'suivi', titre: 'Suivi des sportifs de haut niveau', route: '/suivi-sportif',
    groupes: [
      { id: 'hero', titre: 'Bandeau', champs: [
        image('suivi.image',    'Photo de fond',    '/images/action-1.jpg'),
        champ('suivi.surtitre', 'Pastille',         'HAUT NIVEAU'),
        champ('suivi.titre1',   'Titre, 1re ligne', 'Suivi des sportifs'),
        champ('suivi.titre2',   'Titre, 2e ligne',  'de haut niveau'),
        champ('suivi.chapo',    'Introduction',     "L'ensemble des outils et techniques ostéopathiques disponibles est utilisé pour optimiser la performance, la récupération et la longévité sportive.", true),
      ]},
      { id: 'approche', titre: 'Approche', champs: [
        champ('suivi.approche.surtitre', 'Pastille',    'APPROCHE'),
        champ('suivi.approche.h2',       'Titre',       'Un suivi ostéopathique\nspécifique', true),
        champ('suivi.approche.titre',    'Paragraphe 1', "Mise en place d'un suivi ostéopathique spécifique pour les sportifs de haut niveau.", true),
        champ('suivi.approche.texte',    'Paragraphe 2', "L'ensemble des outils et techniques ostéopathiques disponibles est utilisé pour optimiser la performance, la récupération et la longévité sportive.", true),
        liste('suivi.modalites', 'Modalités', 'une modalité', [col('icone', 'Icône (emoji)'), col('titre', 'Modalité')],
              MODALITES.map(m => ({ icone: m.icon, titre: m.title }))),
      ]},
      { id: 'partenaires', titre: 'Partenaires santé', fiches: 'partenaire', champs: [
        champ('suivi.partenaires.surtitre', 'Pastille',     'RÉSEAU'),
        champ('suivi.partenaires.titre1',   'Titre, 1re ligne', 'Les professionnels'),
        champ('suivi.partenaires.titre2',   'Titre, 2e ligne',  'avec qui je travaille'),
        champ('suivi.partenaires.texte',    'Introduction', 'Professionnels de santé et spécialistes avec lesquels je collabore pour un suivi complet du sportif.', true),
      ]},
      { id: 'resultats', titre: 'Avant / après', champs: [
        champ('suivi.resultats.surtitre', 'Pastille', 'RÉSULTATS'),
        champ('suivi.resultats.titre',    'Titre',    'Avant & après'),
        liste('suivi.resultats', 'Photos', 'une photo', [col('image', 'Photo', 'image'), col('label', 'Étiquette')], [
          { image: '/images/avant01.jpg', label: 'Avant' },
          { image: '/images/apres01.jpg', label: 'Après' },
        ]),
      ]},
      { id: 'references', titre: 'Clubs & athlètes', champs: [
        champ('suivi.refs.surtitre', 'Pastille',         'PARCOURS'),
        champ('suivi.refs.titre1',   'Titre, 1re ligne', 'Clubs & athlètes'),
        champ('suivi.refs.titre2',   'Titre, 2e ligne',  'accompagnés'),
        liste('suivi.references', 'Références', 'une référence',
              [col('nom', 'Nom'), col('image', 'Photo', 'image'), col('texte', 'Texte', 'multi')],
              REFERENCES.map(r => ({ nom: r.nom, image: r.img, texte: r.texte }))),
      ]},
    ],
  },
  {
    id: 'projet', titre: 'Projet sportif personnalisé', route: '/projet-sportif',
    groupes: [
      { id: 'hero', titre: 'Bandeau', champs: [
        image('projet.image',    'Photo de fond',    '/images/julien-motz.jpg'),
        champ('projet.surtitre', 'Pastille',         'SUR MESURE'),
        champ('projet.titre1',   'Titre, 1re ligne', 'Projet sportif'),
        champ('projet.titre2',   'Titre, 2e ligne',  'personnalisé'),
        champ('projet.chapo',    'Introduction',     'Vous avez un objectif sportif ? Après un bilan complet, nous définissons ensemble un projet cohérent, réaliste et totalement individualisé.', true),
      ]},
      { id: 'citation', titre: 'Citation', champs: [
        champ('projet.citation', 'Citation', '"Ne dit-on pas que qui peut le plus peut le moins…"', true),
      ]},
      { id: 'composantes', titre: 'Prise en charge', champs: [
        champ('projet.prise.surtitre', 'Pastille', 'PRISE EN CHARGE'),
        champ('projet.prise.titre',    'Titre',    'Une approche\nglobale et individualisée', true),
        liste('projet.composantes', 'Composantes (numérotées automatiquement)', 'une composante',
              [col('titre', 'Titre'), col('texte', 'Texte', 'multi')],
              COMPOSANTES.map(c => ({ titre: c.label, texte: c.desc }))),
      ]},
      { id: 'athletes', titre: 'Athlètes accompagnés', champs: [
        champ('projet.athletes.surtitre', 'Pastille', 'ATHLÈTES QUI NOUS ACCOMPAGNENT'),
        champ('projet.athletes.titre1',   'Titre, 1re ligne', 'Julien Motz, Samir Baala,'),
        champ('projet.athletes.titre2',   'Titre, 2e ligne',  "et bien d'autres…"),
        liste('projet.athletes', 'Athlètes', 'un athlète',
              [col('nom', 'Nom'), col('detail', 'Détail'), col('image', 'Photo', 'image')],
              ATHLETES.map(a => ({ nom: a.nom, detail: a.detail, image: a.img ?? '' }))),
        champ('projet.tarifs', 'Mention tarifaire', "Les tarifs sont variables, définis en fonction du niveau d'accompagnement demandé et adaptés individuellement à chaque projet.", true),
      ]},
      { id: 'cta', titre: 'Contact', champs: [
        champ('projet.cta.titre', 'Titre',  'Vous avez un projet ?'),
        champ('projet.cta.texte', 'Texte',  "Tout commence par un bilan ostéopathique complet et un rendez-vous de définition d'objectifs.", true),
        champ('projet.bouton',    'Bouton', 'Discutons de votre projet →'),
        lien('projet.bouton.lien', 'Bouton — destination', '/#contact'),
      ]},
    ],
  },
  {
    id: 'entreprise', titre: 'Intervention en entreprise', route: '/intervention-entreprise',
    groupes: [
      { id: 'hero', titre: 'Bandeau', champs: [
        image('entreprise.image',    'Photo de fond',    '/images/terrain-1.jpg'),
        champ('entreprise.surtitre', 'Pastille',         'ENTREPRISE'),
        champ('entreprise.titre1',   'Titre, 1re ligne', 'Intervention'),
        champ('entreprise.titre2',   'Titre, 2e ligne',  'en entreprise'),
        champ('entreprise.chapo',    'Introduction',     'Ostéopathie directement sur site — pour le bien-être de vos équipes, la prévention des TMS et des événements santé mémorables.', true),
      ]},
      { id: 'formats', titre: 'Formats', champs: [
        champ('entreprise.formats.surtitre', 'Pastille', 'FORMATS'),
        champ('entreprise.formats.titre',    'Titre',    "Trois façons d'intervenir"),
        liste('entreprise.formats', 'Formats', 'un format', [
          col('titre', 'Titre'), col('tags', 'Étiquettes (séparées par des virgules)'),
          col('texte', 'Texte', 'multi'), col('image', 'Photo', 'image'),
        ], FORMATS.map(f => ({ titre: f.title, tags: f.tags.join(', '), texte: f.desc, image: f.img }))),
      ]},
      { id: 'cta', titre: 'Contact', champs: [
        champ('entreprise.cta.titre',  'Titre',  'Un projet en entreprise ?'),
        champ('entreprise.cta.texte',  'Texte',  "Les modalités sont définies lors d'un entretien préalable, selon vos besoins et votre contexte.", true),
        champ('entreprise.cta.bouton', 'Bouton', 'Nous contacter →'),
        lien('entreprise.cta.lien',    'Bouton — destination', '/#contact'),
      ]},
    ],
  },
  {
    id: 'remise', titre: 'Programme de remise en forme', route: '/kinesport-furd',
    groupes: [
      { id: 'hero', titre: 'Bandeau', champs: [
        image('remise.image',    'Photo de fond',    '/images/remise-rameur.jpg'),
        champ('remise.surtitre', 'Pastille',         'KINESPORT FURD'),
        champ('remise.titre1',   'Titre, 1re ligne', 'Programme & suivi'),
        champ('remise.titre2',   'Titre, 2e ligne',  'de remise en forme'),
        champ('remise.texte',    'Introduction',     'Selon votre projet et suite à un bilan approfondi, il vous sera proposé un programme adapté, réaliste et évolutif.', true),
      ]},
      { id: 'public', titre: 'Pour qui', champs: [
        champ('remise.public.surtitre', 'Pastille', 'POUR QUI'),
        champ('remise.public.titre1',   'Titre, 1re ligne', 'Un programme'),
        champ('remise.public.titre2',   'Titre, 2e ligne',  'pour chacun'),
        champ('remise.public.texte',    'Texte', "Quel que soit votre point de départ, l'objectif est le même : retrouver le plaisir de bouger, durablement et sans vous blesser. Le double regard d'ostéopathe et de coach sportif permet d'adapter chaque exercice à votre corps.", true),
        liste('remise.publics', 'Profils', 'un profil', [col('titre', 'Profil')], PUBLICS.map(p => ({ titre: p.title }))),
      ]},
      { id: 'etapes', titre: 'Déroulement', champs: [
        champ('remise.etapes.surtitre', 'Pastille', 'DÉROULEMENT'),
        champ('remise.etapes.titre',    'Titre',    'Comment ça se passe'),
        liste('remise.etapes', 'Étapes (numérotées automatiquement)', 'une étape',
              [col('titre', 'Titre'), col('texte', 'Texte', 'multi')],
              ETAPES_REMISE.map(e => ({ titre: e.title, texte: e.body }))),
      ]},
      { id: 'salle', titre: 'La salle', champs: [
        champ('remise.salle.surtitre', 'Pastille', 'LA SALLE'),
        champ('remise.salle.titre1',   'Titre, 1re ligne', 'Un espace équipé'),
        champ('remise.salle.titre2',   'Titre, 2e ligne',  'pour tous les objectifs'),
        liste('remise.espaces', 'Espaces', 'un espace', [
          col('titre', 'Espace'), col('texte', 'Texte', 'multi'), col('photos', 'Photos (en portrait)', 'images'),
        ], ESPACES.map(e => ({ titre: e.title, texte: e.body, photos: e.photos.map(p => ({ image: p.src, legende: p.alt })) }))),
      ]},
      { id: 'cta', titre: 'Contact', champs: [
        champ('remise.cta.titre',  'Titre',  'Envie de vous y mettre ?'),
        champ('remise.cta.texte',  'Texte',  'Parlons de votre projet : un premier échange suffit pour fixer le bilan de départ.', true),
        champ('remise.cta.bouton', 'Bouton', 'Me contacter →'),
        lien('remise.cta.lien',    'Bouton — destination', `mailto:krieger.manu@orange.fr?subject=${encodeURIComponent('Programme de remise en forme')}`),
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
          liste(`ml.${sec.id}.lignes`, 'Lignes', 'une ligne', [col('libelle', 'Libellé'), col('valeur', 'Valeur', 'multi')],
                sec.lignes.map(l => ({ libelle: l.libelle, valeur: l.defaut }))),
        ],
      })),
      { id: 'textes', titre: 'Paragraphes', champs: [
        liste('ml.paragraphes', 'Paragraphes', 'un paragraphe', [col('titre', 'Titre'), col('texte', 'Texte', 'multi')],
              ML_PARAS.map(b => ({ titre: b.titre, texte: b.defaut }))),
      ]},
      { id: 'pied', titre: 'Pied de page', champs: [
        champ('ml.maj', 'Mention de mise à jour', 'Dernière mise à jour : septembre 2026.'),
      ]},
    ],
  },
]

/** Tous les champs du registre, Actualités comprises. */
export const CHAMPS = [...PAGES.flatMap(p => p.groupes.flatMap(g => g.champs)), ...ACTUALITES.champs]

/** { cle: valeur d'origine } — les listes y sont en JSON. */
export const DEFAUTS = Object.fromEntries(CHAMPS.map(c => [c.cle, c.defaut]))

/** { cle: champ } */
export const PAR_CLE = Object.fromEntries(CHAMPS.map(c => [c.cle, c]))

/** Découpe un champ multi-paragraphes en tableau. */
export const enParagraphes = (texte) =>
  String(texte ?? '').split(/\n\s*\n/).map(t => t.trim()).filter(Boolean)

/**
 * Éléments d'une liste. Une valeur illisible (JSON abîmé, autre chose qu'un
 * tableau) ne doit jamais casser le site : on retombe sur la liste d'origine.
 */
export function lireListe(valeur, cle) {
  for (const v of [valeur, DEFAUTS[cle]]) {
    try {
      const l = JSON.parse(v)
      if (Array.isArray(l)) return l.filter(e => e && typeof e === 'object')
    } catch { /* valeur suivante */ }
  }
  return []
}
