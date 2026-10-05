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

6. **Liens de réinitialisation du mot de passe** — Supabase → *Authentication* :

   - *URL Configuration* : *Site URL* = `https://osteo-et-coaching-du-sport.com` ;
     *Redirect URLs* : ajouter `https://osteo-et-coaching-du-sport.com/admin` et
     `https://demonstration.osteo-et-coaching-du-sport.com/admin`. Une adresse
     absente de cette liste fait retomber le lien sur la *Site URL*.
   - *SMTP Settings* : le service d'envoi intégré à Supabase n'écrit qu'aux
     membres de l'organisation Supabase. Pour joindre l'administrateur, on passe
     par sa boîte Orange :

     | Champ | Valeur |
     |---|---|
     | Sender email | `krieger.manu@orange.fr` |
     | Sender name | `Ostéo et Coaching du Sport` |
     | Host | `smtp.orange.fr` |
     | Port | `465` |
     | Username | `krieger.manu@orange.fr` |
     | Password | le mot de passe de la messagerie Orange |

     Puis *Rate Limits* → *Rate limit for sending emails* : quelques envois
     par heure suffisent.
   - *Emails* → *Reset Password* : modèle du message, à traduire en français.

## Usage

### Mot de passe

- **Oublié** : écran de connexion → *Mot de passe oublié ?* → un e-mail
  arrive avec un lien qui ramène sur `/admin`, où l'on choisit le nouveau
  mot de passe. Le lien ne sert qu'une fois et expire au bout d'une heure.
- **Connecté** : bouton *Mot de passe* dans l'en-tête de l'administration.
- **Depuis Supabase** : *Authentication* → *Users* → le compte →
  *Send password recovery* envoie le même lien.

`https://<le-site>/admin` → connexion → modification des textes → *Enregistrer*.

Les textes non modifiés ne sont pas stockés en base : le site retombe sur les
valeurs d'origine inscrites dans `src/content/defaults.js`. Le bouton
« rétablir l'original » sur chaque champ remet la valeur d'origine.

Si Supabase est injoignable, le site public affiche les textes d'origine — il
ne dépend jamais de la base pour fonctionner.

### Section Actualités

Tout se règle dans l'onglet **Actualités** de l'administration (en bas du
sommaire) : titre de la section, photos et dernier post Facebook.

#### Photos

Choisir une image, écrire sa description, *Publier*. L'image est réduite
dans le navigateur (1600 px, WebP) avant l'envoi. Les 5 plus récentes s'affichent en nuage sur l'accueil ;
les plus anciennes restent listées et peuvent être supprimées.

#### Dernier post Facebook

Coller le code d'intégration du post (sur Facebook : ⋯ du post →
*Intégrer* → *Copier le code*), puis *Enregistrer* en bas de page. Un simple lien de post est aussi accepté, mais les liens
courts de *Copier le lien* (`/share/p/…`) ne s'affichent pas toujours dans
le lecteur : le code d'intégration contient le lien permanent, plus sûr.

Le code collé n'est jamais inséré tel quel dans la page : le site n'en garde
que le lien du post et la hauteur, et reconstruit lui-même le lecteur.
Seuls les posts publics d'une page Facebook s'affichent. Laisser le champ
vide masque le bloc.

### Hommages et témoignages

Onglets **Hommages** et **Témoignages** de l'administration (en bas du
sommaire). Chaque fiche : nom, fonction ou métier, phrase mise en avant,
texte (une ligne vide entre les paragraphes) et jusqu'à 4 images légendées.
Les flèches ↑ ↓ règlent l'ordre d'affichage sur la page Histoire ; les 3
premiers témoignages apparaissent aussi sur l'accueil.

Les en-têtes de ces sections (pastille, titre) restent dans la page
**Histoire et formation** de l'administration ; les liens de la hero dans
**Accueil → Bandeau**.

## Ajouter un texte éditable

Ajouter une entrée dans `src/content/defaults.js`, puis remplacer le texte en
dur du composant par `textes['ma.cle']` (via `useTextes()`).
