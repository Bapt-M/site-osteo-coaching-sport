# Design Spec — Section « Actualités » (nuage de photos + dernier post Facebook)

**Date :** 2026-09-24
**Projet :** Site Ostéo et Coaching du Sport — Emmanuel Krieger
**Statut :** Approuvé

---

## Contexte

Manu veut, sur la page d'accueil juste après le slider, une section d'actualité
qu'il alimente lui-même :

- d'un côté, les **5 dernières photos** qu'il a publiées, présentées en
  « nuage » ; un clic sur une photo affiche la description qu'il a saisie ;
- de l'autre, son **dernier post Facebook**, qui renvoie vers le post.

Le site dispose déjà d'une administration (`/admin`) adossée à Supabase :
connexion par e-mail et mot de passe, liste blanche `public.admins`, fonction
`prive.est_admin()` utilisée par les politiques RLS, textes éditables dans
`site_content` via le registre `src/content/registre.js`. La fonctionnalité
s'appuie sur ces briques.

---

## Décisions

| Sujet | Choix | Raison |
|---|---|---|
| Facebook | Lecteur officiel « Embedded Post » (iframe `facebook.com/plugins/post.php`) à partir d'un lien collé par Manu | Pas d'app Meta ni de jeton à entretenir ; les aperçus par lien seul sont bloqués par Facebook |
| Cookies Facebook | Chargement **au clic** (façade), pas de bandeau global | Les mentions légales promettent aucun cookie ; recommandation CNIL pour les contenus tiers |
| Clic sur une photo | Visionneuse : photo agrandie + description, navigation ‹ › | Place pour une description longue, accessible au clavier |
| Champs d'une photo | Fichier + description (date d'ajout automatique) | Minimum demandé |

---

## 1. Données et stockage

### Table `public.photos`

| Colonne | Type | Note |
|---|---|---|
| `id` | `uuid` PK, `default gen_random_uuid()` | |
| `chemin` | `text not null` | chemin de l'objet dans le bucket `photos` |
| `description` | `text not null default ''` | |
| `cree_le` | `timestamptz not null default now()` | tri, la plus récente d'abord |

RLS : `select` pour `anon, authenticated` ; `insert/update/delete` pour
`authenticated` sous condition `prive.est_admin()` — calqué sur `site_content`.

### Bucket Storage `photos`

Public en lecture (URL `…/storage/v1/object/public/photos/<chemin>`).
Politiques sur `storage.objects` limitées à `bucket_id = 'photos'` :
écriture et suppression pour `authenticated` avec `prive.est_admin()`.

Le SQL est ajouté à `supabase/schema.sql` (section 5), et la mise en service
documentée dans `supabase/README.md`.

### Lien Facebook

Nouvelle clé du registre de textes, dans un groupe « Actualités » de la page
Accueil :

- `actu.titre` — titre de la section (défaut : « Actualités ») ;
- `actu.facebook.lien` — URL du post (défaut : vide).

Aucune nouvelle table : l'onglet de textes existant sert à le modifier. Le
libellé du champ rappelle la marche à suivre : « Sur Facebook : ⋯ du post →
Copier le lien ».

---

## 2. Administration — onglet « Photos »

Ajouté à `src/pages/Admin.jsx` à côté des pages de textes ; la logique vit
dans un composant dédié `src/pages/admin/Photos.jsx` pour ne pas alourdir
`Admin.jsx`.

- **Ajout** : sélection d'un fichier image, zone de description, bouton
  « Publier ». Avant l'envoi, l'image est **réduite dans le navigateur**
  (canvas → WebP, 1600 px sur le plus grand côté, qualité ~0,82), dans un
  module pur `src/lib/image.js`. Nom de fichier : `<uuid>.webp`.
  Ordre : upload Storage, puis insertion de la ligne ; si l'insertion échoue,
  l'objet envoyé est supprimé.
- **Liste** : toutes les photos, plus récentes d'abord, vignette + description
  éditable + bouton « Supprimer » (avec confirmation). Les 5 premières portent
  un badge « En ligne ». La suppression retire la ligne puis l'objet Storage.
- Messages d'erreur en français, comme l'écran de textes.

---

## 3. Affichage — section `Actualites`

`src/sections/Actualites.jsx`, insérée dans `Home.jsx` entre `SliderActions`
et `About`.

### Mise en page

- Desktop : deux colonnes, nuage à gauche, bloc Facebook à droite.
- Mobile (< 850 px) : empilées, nuage au-dessus.

### Nuage de photos (`NuagePhotos`)

- Lecture des 5 dernières photos via `fetch` direct sur PostgREST
  (`/rest/v1/photos?select=…&order=cree_le.desc&limit=5`), fonction
  `lirePhotos()` dans `src/lib/supabase.js`, sur le modèle de
  `lireContenus()` : toute panne renvoie `[]`.
- Tirages à bord blanc, ombre douce, positions et rotations **fixes** par
  rang (tableau de 5 emplacements) : légers chevauchements, aucune photo
  entièrement masquée. Survol/focus : la photo se redresse et passe devant.
- Chaque photo est un `<button>` avec `alt` = début de la description.
- `loading="lazy"` sur les images.

### Visionneuse (`Visionneuse`)

- Fond sombre plein écran, photo agrandie, description dessous.
- Fermeture : ×, Échap, clic sur le fond. Flèches ‹ › et touches ← → pour
  naviguer parmi les 5. Focus piégé dans la visionneuse, rendu au bouton
  d'origine à la fermeture. Animation Framer Motion (`AnimatePresence`).

### Bloc Facebook (`PostFacebook`)

- État initial (façade) : encart aux couleurs du site — « Dernière actualité
  sur Facebook », bouton « Afficher le post », mention « En l'affichant, vous
  acceptez que Facebook dépose des cookies. » et lien « Voir sur Facebook »
  (nouvel onglet, `rel="noopener"`).
- Après clic : iframe
  `https://www.facebook.com/plugins/post.php?href=<lien encodé>&show_text=true&width=500`,
  largeur fluide, `title` renseigné.
- Le lien n'est accepté que s'il commence par `https://www.facebook.com/` ou
  `https://facebook.com/` (ou `https://m.facebook.com/`) ; sinon le bloc est traité
  comme absent.

### Cas dégradés

| Photos | Lien FB | Rendu |
|---|---|---|
| ≥ 1 | valide | deux colonnes |
| 0 | valide | bloc Facebook seul, pleine largeur |
| ≥ 1 | absent/invalide | nuage seul, pleine largeur |
| 0 | absent/invalide | section non rendue |

Moins de 5 photos : le nuage utilise les premiers emplacements.

### Prérendu

La section dépend de données chargées côté client : le HTML prérendu ne
contient pas les photos, seulement ce qui s'affiche sans elles. Pas de
changement à `scripts/prerender.mjs`.

---

## 4. Mentions légales

Ajout d'un paragraphe dans `src/content/data/mentions.js` : le post Facebook
de la page d'accueil n'est chargé qu'à la demande du visiteur ; Facebook peut
alors déposer des cookies, régis par sa propre politique.

---

## 5. Tests (Vitest + Testing Library)

- `Actualites.test.jsx` : rendu des 5 photos, ouverture/fermeture de la
  visionneuse (clic, Échap), navigation ← →, iframe absente avant clic et
  présente après, les quatre cas dégradés, rejet d'un lien non Facebook.
- `supabase` : `lirePhotos()` renvoie `[]` en cas d'erreur réseau ou HTTP.
- `admin/Photos.test.jsx` : ajout (client Supabase simulé), suppression,
  modification de description, badge « En ligne » sur les 5 premières.
- `image.js` : calcul des dimensions de réduction (fonction pure).

---

## Hors périmètre

- Récupération automatique du dernier post (API Graph).
- Bandeau de consentement global.
- Réordonnancement manuel des photos, albums, légendes visibles dans le nuage.

## Limite connue

Le lecteur Facebook n'affiche que les posts **publics** d'une **page**
Facebook, pas ceux d'un profil personnel.
