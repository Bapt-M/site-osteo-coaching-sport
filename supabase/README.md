# Administration du site

## Mise en service (une seule fois)

1. **Créer les tables** — Supabase → *SQL Editor* → coller `schema.sql` → *Run*.

   Le script est rejouable : sur un projet déjà en service, le relancer
   ajoute simplement ce qui manque (section 5 : photos d'actualité).

2. **Créer le compte administrateur** — Supabase → *Authentication* → *Users* →
   *Add user* → renseigner une adresse et un mot de passe, et cocher
   *Auto Confirm User*.

3. **Autoriser ce compte à écrire** — dans le *SQL Editor* :

   ```sql
   insert into public.admins (email) values ('adresse-du-compte@exemple.fr');
   ```

   Sans cette ligne, la connexion fonctionne mais l'enregistrement est refusé.

4. **Fermer les inscriptions** — Supabase → *Authentication* → *Sign In / Providers*
   → désactiver *Allow new users to sign up*. Recommandé : personne ne doit
   pouvoir se créer un compte depuis l'extérieur.

5. **Variables d'environnement sur Netlify** — *Site configuration* →
   *Environment variables* :

   | Nom | Valeur |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://yhbuqlxboxvnzdnhsfqy.supabase.co` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | la clé `sb_publishable_…` |

   Ces deux valeurs sont publiques par nature : elles sont embarquées dans le
   code envoyé au navigateur. La sécurité repose entièrement sur les règles
   RLS définies dans `schema.sql`.

## Usage

`https://<le-site>/admin` → connexion → modification des textes → *Enregistrer*.

Les textes non modifiés ne sont pas stockés en base : le site retombe sur les
valeurs d'origine inscrites dans `src/content/defaults.js`. Le bouton
« rétablir l'original » sur chaque champ remet la valeur d'origine.

Si Supabase est injoignable, le site public affiche les textes d'origine — il
ne dépend jamais de la base pour fonctionner.

### Photos d'actualité

Onglet **Photos** de l'administration : choisir une image, écrire sa
description, *Publier*. L'image est réduite dans le navigateur (1600 px,
WebP) avant l'envoi. Les 5 plus récentes s'affichent en nuage sur l'accueil ;
les plus anciennes restent listées et peuvent être supprimées.

### Dernier post Facebook

Page **Accueil** → groupe **Actualités** → coller le lien du post (sur
Facebook : ⋯ du post → *Copier le lien*), puis *Enregistrer*. Seuls les
posts publics d'une page Facebook s'affichent. Laisser le champ vide
masque le bloc.

## Ajouter un texte éditable

Ajouter une entrée dans `src/content/defaults.js`, puis remplacer le texte en
dur du composant par `textes['ma.cle']` (via `useTextes()`).
