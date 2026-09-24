# Design Spec — Hommages et témoignages gérés depuis l'administration

**Date :** 2026-09-24
**Projet :** Site Ostéo et Coaching du Sport — Emmanuel Krieger
**Statut :** Approuvé

---

## Contexte

Les hommages (Fred Forte, Thierry Rupert) et les témoignages (Matthieu
Lorentz, Richard Billant, Paris McCurdy) sont aujourd'hui des tableaux en dur
(`src/content/data/histoire.js`) affichés sur la page Histoire. Leurs textes
sont éditables depuis `/admin` via le registre (`hommage.<i>.*`,
`temoignage.<i>.*`), mais Manu ne peut ni ajouter, ni supprimer une fiche, ni
changer ses images. L'accueil a en outre sa propre liste d'extraits
(`src/content/data/temoignages.js`, clés `temoin.<i>.*`).

Manu veut gérer lui-même ces fiches — images, nom, fonction/métier, titre,
texte — et les rendre accessibles depuis la hero : « Hommages » en haut à
gauche, « Témoignages » en haut à droite, sans surcharger la photo.

La section Actualités (spec du même jour) a posé les briques réutilisées ici :
admin Supabase, `prive.est_admin()`, bucket public avec RLS admin,
`reduireImage()`, lecture publique par `fetch`.

---

## Décisions

| Sujet | Choix |
|---|---|
| Emplacement | Les fiches restent sur la page **Histoire** (`#hommages`, `#temoignages`) |
| Stockage | **Une table `fiches`** commune aux deux types |
| Images | **0 à 4 images par fiche**, chacune avec une légende facultative |
| « Titre » | La **phrase mise en avant** : citation des hommages, accroche des témoignages (remplace l'extrait) |
| Ordre | **Choisi par Manu** (boutons ↑ ↓) ; une nouvelle fiche arrive en dernier |
| Accueil | La section Témoignages affiche les **3 premiers témoignages** de la base |
| Hero | **Texte espacé** dans le style de « HISTOIRE ET FORMATION », plus petit |
| Admin | **Deux onglets** « Hommages » et « Témoignages », à côté d'« Actualités » |

---

## 1. Données

### Table `public.fiches`

| Colonne | Type | Note |
|---|---|---|
| `id` | `uuid` PK, `default gen_random_uuid()` | |
| `type` | `text not null`, `check (type in ('hommage','temoignage'))` | |
| `nom` | `text not null` | |
| `fonction` | `text not null default ''` | fonction ou métier |
| `titre` | `text not null default ''` | phrase mise en avant |
| `texte` | `text not null default ''` | paragraphes séparés par une ligne vide |
| `images` | `jsonb not null default '[]'` | `[{ "chemin": text, "legende": text }]`, 4 au plus (`check`) |
| `ordre` | `integer not null default 0` | tri croissant par type |
| `cree_le` | `timestamptz not null default now()` | départage à ordre égal |

Index `(type, ordre)`. RLS calquée sur `photos` : `select` pour `anon,
authenticated` ; `all` pour `authenticated` sous `prive.est_admin()`.

### Chemin d'une image

- commence par `/` → image livrée avec le site (`/images/fred-forte.jpg`),
  utilisée telle quelle ;
- sinon → objet du bucket `fiches`, URL
  `${VITE_SUPABASE_URL}/storage/v1/object/public/fiches/<chemin>`.

Ainsi les images actuelles restent en place, sans recopie.

### Bucket `fiches`

Public, `file_size_limit` 5 242 880, `allowed_mime_types` `{image/webp,image/jpeg}`.
Politiques `storage.objects` identiques à celles du bucket `photos`
(insert/update/delete/select pour l'admin, `bucket_id = 'fiches'`).

### Reprise de l'existant

La migration insère les 5 fiches actuelles, dans l'ordre actuel :

- hommages : `titre` = `citation`, `texte` = paragraphes joints par une ligne
  vide, `images` = `images[]` (`src` → `chemin`, `legende` conservée) ;
- témoignages : `titre` = `extrait`, `texte` = paragraphes, `images` =
  `[{ chemin: img, legende: imgAlt }]` si `img` ; la mention « Témoignage en
  anglais » de McCurdy est ajoutée à sa `fonction`
  (« Ancien basketteur professionnel · témoignage en anglais »).

Avant d'insérer, vérifier que `site_content` ne contient aucune clé
`hommage.%` / `temoignage.%` / `temoin.%` ; s'il y en a, les reprendre à la
place des valeurs du code.

### Repli sans base

`lireFiches()` (dans `src/lib/supabase.js`, `fetch` direct) renvoie la liste
des fiches triées, ou **`null` en cas de panne** (réseau, HTTP, Supabase non
configuré). Sur `null`, le site affiche les fiches d'origine
(`FICHES_ORIGINE`, dérivées des tableaux actuels, même forme que la base).
Une liste **vide** est respectée : la section correspondante n'affiche aucune
fiche.

---

## 2. Administration

Deux entrées de sommaire sous « Actualités » : **Hommages** et
**Témoignages**. Un même composant `src/pages/admin/Fiches.jsx` sert aux deux,
paramétré par `type`.

- **Liste** des fiches du type, dans l'ordre d'affichage : première image en
  vignette, nom, fonction, titre ; boutons **↑ / ↓** (échangent `ordre` avec
  la voisine), **Modifier**, **Supprimer** (après confirmation).
- **« Ajouter une fiche »** ouvre le même formulaire vide.
- **Formulaire** : nom (obligatoire), fonction ou métier, titre (« Phrase mise
  en avant »), texte (zone multi-lignes), images — pour chacune : vignette,
  légende, « Retirer » ; « Ajouter une image » tant qu'il y en a moins de 4.
  Les nouvelles images sont réduites par `reduireImage()` et envoyées au
  bucket `fiches` à l'enregistrement. **« Enregistrer la fiche »** / « Annuler ».
- Nouvelle fiche : `ordre` = max du type + 1.
- **Nettoyage du stockage** : à l'enregistrement, les images retirées qui
  vivent dans le bucket sont supprimées ; à la suppression d'une fiche, toutes
  ses images du bucket le sont. Les chemins commençant par `/` ne sont jamais
  supprimés. Un échec de suppression de fichier est signalé sans bloquer.
- Si l'enregistrement de la ligne échoue après l'envoi de nouvelles images,
  ces images sont supprimées (pas d'orphelins).
- Messages d'erreur en français, `role="alert"`.

### Registre

- Retirés : les champs dérivés `hommage.<i>.*`, `temoignage.<i>.*`,
  `temoin.<i>.*` et les imports de données correspondants.
- Conservés : `hommages.surtitre/titre1/titre2`,
  `temoignages.surtitre/titre`, `temoins.surtitre/amorce/lien1/lien2`.
- Ajoutés dans le groupe **Bandeau** de l'Accueil : `hero.hommages`
  (défaut « HOMMAGES ») et `hero.temoignages` (défaut « TÉMOIGNAGES »).

---

## 3. Affichage

### Page Histoire

Même rendu qu'aujourd'hui, alimenté par les fiches :

- **Hommage** : images légendées à gauche (légende sous chaque image), puis
  nom, fonction, titre en grande citation « … » (si non vide), paragraphes.
- **Témoignage** : carte avec la première image en tête (`alt` = sa légende,
  sinon le nom), guillemet, titre en accroche ; « Lire le témoignage → »
  déplie les paragraphes ; pied : nom, fonction.
- Aucun hommage → la section `#hommages` n'affiche que son en-tête et rien
  d'autre ; de même pour les témoignages.
- Chargement : les fiches d'origine ne sont **pas** affichées pendant la
  lecture (évite qu'une fiche supprimée réapparaisse un instant) ; la liste
  apparaît à la réponse.

### Accueil — section Témoignages

Les 3 premiers témoignages : guillemet, **titre** (tronqué à ~220 caractères),
pastille aux initiales du nom (dégradé tournant parmi les trois actuels), nom,
fonction. En-tête, amorce et deux boutons inchangés. Aucun témoignage →
les cartes disparaissent, amorce et boutons restent.

### Hero

- « HOMMAGES » en haut à gauche → `/histoire#hommages` ;
  « TÉMOIGNAGES » en haut à droite → `/histoire#temoignages`.
- Style : `font-poppins font-extrabold uppercase`, espacement ~0.15em, ombre
  portée de `OVER_PHOTO_STYLE`, taille `clamp(0.7rem, 1.1vw, 1rem)` ; soulignement
  fin au survol, couleur `cyan-accent` au survol comme « HISTOIRE ET FORMATION ».
- Position : sous la barre de navigation (≈ `top: 96px` desktop, `84px`
  mobile), à `24px` (mobile) / `48px` (desktop) des bords, dans le ciel.
- Tous formats. Sur mobile, taille minimale 0.7rem.

---

## 4. Tests

- `lireFiches()` : tri, mapping des chemins (site vs bucket), `null` sur
  panne, `[]` respecté.
- `FICHES_ORIGINE` : 2 hommages + 3 témoignages, contenu repris à l'identique.
- Histoire : rendu des deux types depuis la base, repli sur `null`, liste
  vide, pas de fiches d'origine pendant le chargement, dépliage d'un
  témoignage.
- Accueil : 3 premiers témoignages, titre tronqué, initiales.
- Hero : deux liens, cibles, libellés du registre.
- Admin `Fiches` : liste ordonnée, ajout avec images (upload + insert),
  modification, retrait d'image (suppression du fichier bucket, pas des `/…`),
  ↑ ↓, suppression avec confirmation, rollback des images si l'insert échoue.
- Registre : clés retirées/ajoutées, unicité.
- Vérification Chrome : hero desktop/mobile, page Histoire, accueil, admin.

## Hors périmètre

- Pages dédiées `/hommages`, `/temoignages`.
- Glisser-déposer pour l'ordre, recadrage d'image.
- Champ « langue » séparé.
