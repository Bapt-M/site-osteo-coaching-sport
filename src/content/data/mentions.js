// Mentions légales.
//
// Les valeurs marquées « À COMPLÉTER » sont des identifiants légaux que je ne
// peux pas deviner : ils engagent juridiquement l'éditeur et doivent être
// saisis depuis /admin avant toute mise en ligne publique.
export const A_COMPLETER = 'À COMPLÉTER'

export const SECTIONS = [
  {
    id: 'editeur',
    titre: 'Éditeur du site',
    lignes: [
      { cle: 'ml.editeur.nom',      libelle: 'Nom',                defaut: 'Emmanuel Krieger' },
      { cle: 'ml.editeur.qualite',  libelle: 'Qualité',            defaut: 'Ostéopathe D.O. — Masseur-kinésithérapeute D.E.' },
      { cle: 'ml.editeur.statut',   libelle: 'Statut juridique',   defaut: A_COMPLETER },
      { cle: 'ml.editeur.adresse',  libelle: 'Adresse',            defaut: '34 rue de Strasbourg\n67117 Furdenheim', multi: true },
      { cle: 'ml.editeur.mail',     libelle: 'Adresse e-mail',     defaut: 'krieger.manu@orange.fr' },
      { cle: 'ml.editeur.siret',    libelle: 'SIRET',              defaut: A_COMPLETER },
      { cle: 'ml.editeur.tva',      libelle: 'TVA intracommunautaire', defaut: A_COMPLETER },
      { cle: 'ml.editeur.adeli',    libelle: 'Numéro ADELI / RPPS', defaut: A_COMPLETER },
    ],
  },
  {
    id: 'publication',
    titre: 'Directeur de la publication',
    lignes: [
      { cle: 'ml.publication.nom', libelle: 'Responsable', defaut: 'Emmanuel Krieger' },
    ],
  },
  {
    id: 'hebergeur',
    titre: 'Hébergeur',
    lignes: [
      { cle: 'ml.hebergeur.nom',     libelle: 'Raison sociale', defaut: 'Netlify, Inc.' },
      { cle: 'ml.hebergeur.adresse', libelle: 'Adresse',        defaut: '512 2nd Street, Suite 200\nSan Francisco, CA 94107\nÉtats-Unis', multi: true },
      { cle: 'ml.hebergeur.site',    libelle: 'Site',           defaut: 'www.netlify.com' },
    ],
  },
]

export const PARAGRAPHES = [
  {
    cle: 'ml.profession',
    titre: 'Profession réglementée',
    defaut:
      "L'exercice de l'ostéopathie en France est encadré par la loi n° 2002-303 du 4 mars 2002 " +
      "et par les décrets n° 2007-435 du 25 mars 2007 et n° 2014-1043 du 12 septembre 2014. " +
      "L'usage professionnel du titre d'ostéopathe est réservé aux personnes titulaires d'un " +
      "diplôme reconnu par le ministère chargé de la santé.\n\n" +
      "L'ostéopathie ne se substitue pas à un avis, un diagnostic ou un traitement médical. " +
      "En cas de doute sur votre état de santé, consultez un médecin.",
  },
  {
    cle: 'ml.propriete',
    titre: 'Propriété intellectuelle',
    defaut:
      "L'ensemble des contenus de ce site — textes, photographies, logotype, mise en page — est " +
      "protégé par le droit d'auteur. Toute reproduction, représentation ou diffusion, totale ou " +
      "partielle, sans autorisation écrite préalable est interdite.\n\n" +
      "Les photographies représentant des sportifs sont publiées avec leur accord. Les marques et " +
      "logotypes de tiers apparaissant sur les photographies restent la propriété de leurs titulaires.",
  },
  {
    cle: 'ml.donnees',
    titre: 'Données personnelles',
    defaut:
      "Ce site ne comporte aucun formulaire de collecte et ne dépose aucun cookie de mesure " +
      "d'audience ou de publicité. Aucune donnée personnelle n'est collectée à votre insu lors " +
      "de la simple consultation des pages.\n\n" +
      "Si vous écrivez à l'adresse e-mail indiquée ci-dessus, les informations transmises servent " +
      "uniquement à répondre à votre demande et ne sont ni cédées ni utilisées à d'autres fins.\n\n" +
      "Les données recueillies dans le cadre d'une prise en charge relèvent du secret professionnel " +
      "et sont conservées conformément aux obligations applicables aux professionnels de santé.\n\n" +
      "Conformément au règlement (UE) 2016/679 et à la loi « Informatique et Libertés », vous " +
      "disposez d'un droit d'accès, de rectification, d'effacement, de limitation et d'opposition " +
      "sur les données vous concernant. Pour l'exercer, écrivez à l'adresse e-mail indiquée " +
      "ci-dessus. Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).",
  },
  {
    cle: 'ml.rdv',
    titre: 'Prise de rendez-vous',
    defaut:
      "La prise de rendez-vous en ligne est assurée par Doctolib, dont les conditions d'utilisation " +
      "et la politique de confidentialité lui sont propres. En cliquant sur un bouton de prise de " +
      "rendez-vous, vous quittez ce site pour la plateforme Doctolib.",
  },
  {
    cle: 'ml.responsabilite',
    titre: 'Responsabilité',
    defaut:
      "Les informations publiées sur ce site sont données à titre indicatif et peuvent être " +
      "modifiées à tout moment. L'éditeur met tout en œuvre pour en assurer l'exactitude, sans " +
      "pouvoir garantir qu'elles soient exemptes d'erreur ou d'omission.\n\n" +
      "Les liens vers des sites tiers sont fournis pour votre commodité ; leur contenu n'engage " +
      "que leurs éditeurs respectifs.",
  },
]
