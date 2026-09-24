# Section Actualités — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter sur l'accueil, après le slider, une section « Actualités » : nuage des 5 dernières photos publiées par Manu (description au clic) et dernier post Facebook chargé au clic.

**Architecture:** Photos stockées dans Supabase (table `photos` + bucket Storage `photos`, RLS calquées sur `site_content`), gérées depuis un nouvel onglet de `/admin`. Le lien du post Facebook est une clé du registre de textes existant. Côté public, lecture par `fetch` direct (pas de SDK), et lecteur Facebook officiel en iframe derrière une façade « Afficher le post ».

**Tech Stack:** React 19, Vite 8, Tailwind 3, Framer Motion 12, Supabase (PostgREST + Storage), Vitest 4 + Testing Library (jsdom).

**Spec:** `docs/superpowers/specs/2026-09-24-section-actualites-design.md`

## Global Constraints

- Tous les textes d'interface, commentaires et messages de commit sont **en français**, dans le ton du code existant.
- Le site public ne dépend jamais de Supabase pour s'afficher : toute panne de lecture → `[]` / valeur par défaut, jamais d'exception.
- Le site public ne charge **pas** `@supabase/supabase-js` : lecture par `fetch` (modèle `lireContenus()` dans `src/lib/supabase.js`).
- Aucun contenu Facebook (iframe, script, image) n'est chargé avant le clic du visiteur.
- Liens Facebook acceptés : `https://` et hôte `www.facebook.com`, `facebook.com`, `m.facebook.com` ou `web.facebook.com`, chemin non vide.
- Nombre de photos affichées : **5**. Réduction avant upload : **1600 px** sur le plus grand côté, WebP qualité **0,82** (repli JPEG 0,85 si le navigateur n'encode pas le WebP).
- Point de rupture mobile : `desktop` = 850 px (classe Tailwind `desktop:`).
- Commits : message conventionnel en français (`feat(actualites): …`) terminé par la ligne
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Tests : `npx vitest run` doit rester entièrement vert (96 tests au départ).
- Dans les tests, `framer-motion` est remplacé par `__mocks__/framer-motion.jsx` (alias dans `vite.config.js`) : `AnimatePresence` rend ses enfants tels quels.

## Structure des fichiers

| Fichier | Rôle |
|---|---|
| `supabase/schema.sql` (modif.) | Section 5 : table `photos`, bucket `photos`, politiques RLS |
| `supabase/README.md` (modif.) | Mise en service et usage de l'onglet Photos |
| `src/lib/supabase.js` (modif.) | `urlPhoto(chemin)`, `lirePhotos(limite)` |
| `src/lib/supabase.test.js` (créé) | Tests de `lirePhotos` |
| `src/lib/facebook.js` (créé) | `lienFacebookValide(lien)`, `urlLecteurFacebook(lien)` |
| `src/lib/facebook.test.js` (créé) | |
| `src/lib/image.js` (créé) | `dimensionsReduites(l, h, max)`, `reduireImage(fichier)` |
| `src/lib/image.test.js` (créé) | |
| `src/content/registre.js` (modif.) | Groupe « Actualités » de la page Accueil |
| `src/content/data/mentions.js` (modif.) | Paragraphe `ml.facebook` |
| `src/sections/actualites/NuagePhotos.jsx` (créé) | Nuage + ouverture de la visionneuse |
| `src/sections/actualites/Visionneuse.jsx` (créé) | Photo agrandie + description |
| `src/sections/actualites/PostFacebook.jsx` (créé) | Façade + iframe |
| `src/sections/Actualites.jsx` (créé) | Chargement des données, mise en page, cas dégradés |
| `src/pages/Home.jsx` (modif.) | Insertion de la section |
| `src/pages/admin/Photos.jsx` (créé) | Onglet Photos de l'administration |
| `src/pages/Admin.jsx` (modif.) | Entrée « Photos » dans le sommaire |

---

### Task 1: Schéma Supabase (table, bucket, politiques)

**Files:**
- Modify: `supabase/schema.sql` (ajout en fin de fichier)
- Modify: `supabase/README.md`

**Interfaces:**
- Produces: table `public.photos (id uuid, chemin text, description text, cree_le timestamptz)`, bucket public `photos`. Tout le code suivant s'appuie sur ces noms exacts.

- [ ] **Step 1: Ajouter la section 5 à `supabase/schema.sql`**

À la fin du fichier, après la section 4 :

```sql
-- ── 5. Photos d'actualité ───────────────────────────────────────────────────
-- Les 5 plus récentes s'affichent en nuage sur l'accueil. Les fichiers vivent
-- dans le bucket Storage `photos`, la table ne garde que le chemin et la
-- description.

create table if not exists public.photos (
  id           uuid primary key default gen_random_uuid(),
  chemin       text not null unique,
  description  text not null default '',
  cree_le      timestamptz not null default now()
);

create index if not exists photos_cree_le_idx on public.photos (cree_le desc);

alter table public.photos enable row level security;

drop policy if exists "lecture publique" on public.photos;
create policy "lecture publique"
  on public.photos for select
  to anon, authenticated
  using (true);

drop policy if exists "ecriture admin" on public.photos;
create policy "ecriture admin"
  on public.photos for all
  to authenticated
  using (prive.est_admin())
  with check (prive.est_admin());

-- Bucket public : les images se lisent par URL directe, sans jeton.
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do update set public = true;

-- Écriture et suppression des fichiers réservées aux administrateurs. La
-- lecture n'a pas besoin de politique : un bucket public est servi par
-- /storage/v1/object/public/ sans passer par le RLS.
drop policy if exists "photos ajout admin" on storage.objects;
create policy "photos ajout admin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos' and prive.est_admin());

drop policy if exists "photos modification admin" on storage.objects;
create policy "photos modification admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'photos' and prive.est_admin());

drop policy if exists "photos suppression admin" on storage.objects;
create policy "photos suppression admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'photos' and prive.est_admin());

-- `remove()` du SDK lit l'objet avant de le supprimer : l'administrateur doit
-- pouvoir le sélectionner.
drop policy if exists "photos lecture admin" on storage.objects;
create policy "photos lecture admin"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'photos' and prive.est_admin());
```

- [ ] **Step 2: Documenter dans `supabase/README.md`**

Dans « Mise en service », ajouter après l'étape 1 une note :

```markdown
   Le script est rejouable : sur un projet déjà en service, le relancer
   ajoute simplement ce qui manque (section 5 : photos d'actualité).
```

Dans « Usage », ajouter à la fin :

```markdown
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
```

- [ ] **Step 3: Appliquer sur le projet Supabase — DEMANDER CONFIRMATION D'ABORD**

Le projet Supabase (`yhbuqlxboxvnzdnhsfqy`) est partagé par la démo et la production. Avant toute écriture, demander à l'utilisateur l'accord pour appliquer la section 5. Une fois l'accord obtenu : outil MCP `mcp__supabase__apply_migration` avec `name: "photos_actualite"` et le SQL de la section 5 seul. Puis vérifier :

```sql
select id, public from storage.buckets where id = 'photos';
select policyname from pg_policies where tablename in ('photos', 'objects') order by 1;
```

Attendu : une ligne `photos | true` ; les politiques `lecture publique`, `ecriture admin`, `photos ajout admin`, `photos lecture admin`, `photos modification admin`, `photos suppression admin` présentes. Lancer aussi `mcp__supabase__get_advisors` (type `security`) et signaler toute nouvelle alerte liée à `photos`.

Si l'accord n'est pas donné, passer à la suite : le code tolère l'absence de table (lecture → `[]`).

- [ ] **Step 4: Commit**

```bash
git add supabase/schema.sql supabase/README.md
git commit -m "feat(actualites): table et bucket Supabase pour les photos

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Lecture publique des photos (`lirePhotos`, `urlPhoto`)

**Files:**
- Modify: `src/lib/supabase.js` (ajout en fin de fichier)
- Create: `src/lib/supabase.test.js`

**Interfaces:**
- Produces:
  - `urlPhoto(chemin: string): string` → `${VITE_SUPABASE_URL}/storage/v1/object/public/photos/${chemin}`
  - `lirePhotos(limite = 5): Promise<Array<{ id: string, url: string, description: string }>>`, plus récentes d'abord ; `[]` sur toute panne ou si Supabase n'est pas configuré.

- [ ] **Step 1: Écrire les tests**

`src/lib/supabase.test.js` :

```js
// Variables fixées avant l'import : le module les lit au chargement, et le
// test ne doit pas dépendre du fichier .env local.
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test')
const { lirePhotos, urlPhoto } = await import('./supabase')

afterEach(() => { vi.unstubAllGlobals() })

test('construit l’URL publique d’une photo', () => {
  expect(urlPhoto('abc.webp')).toBe('https://test.supabase.co/storage/v1/object/public/photos/abc.webp')
})

test('lit les 5 dernières photos, plus récentes d’abord', async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => [
      { id: '1', chemin: 'a.webp', description: 'Stage padel' },
      { id: '2', chemin: 'b.webp', description: null },
    ],
  })
  vi.stubGlobal('fetch', fetchMock)

  const photos = await lirePhotos()

  const appel = fetchMock.mock.calls[0][0]
  expect(appel).toContain('/rest/v1/photos?')
  expect(appel).toContain('order=cree_le.desc')
  expect(appel).toContain('limit=5')
  expect(photos).toEqual([
    { id: '1', url: urlPhoto('a.webp'), description: 'Stage padel' },
    { id: '2', url: urlPhoto('b.webp'), description: '' },
  ])
})

test('renvoie une liste vide si la réponse est en erreur', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }))
  expect(await lirePhotos()).toEqual([])
})

test('renvoie une liste vide si le réseau tombe', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('hors ligne')))
  expect(await lirePhotos()).toEqual([])
})
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/lib/supabase.test.js`
Expected: FAIL — `urlPhoto is not a function` / `lirePhotos is not a function`.

- [ ] **Step 3: Implémenter**

À la fin de `src/lib/supabase.js` :

```js
/** URL publique d'une photo du bucket `photos`. */
export const urlPhoto = (chemin) => `${url}/storage/v1/object/public/photos/${chemin}`

/**
 * Les dernières photos d'actualité, plus récentes d'abord. Même principe que
 * `lireContenus()` : `fetch` direct, et toute panne renvoie une liste vide.
 */
export async function lirePhotos(limite = 5) {
  if (!supabaseConfigure) return []
  try {
    const reponse = await fetch(
      `${url}/rest/v1/photos?select=id,chemin,description&order=cree_le.desc&limit=${limite}`,
      { headers: { apikey: cle, Authorization: `Bearer ${cle}` } },
    )
    if (!reponse.ok) return []
    const lignes = await reponse.json()
    return lignes.map(({ id, chemin, description }) => ({
      id, url: urlPhoto(chemin), description: description ?? '',
    }))
  } catch {
    return []
  }
}
```

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/lib/supabase.test.js`
Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase.js src/lib/supabase.test.js
git commit -m "feat(actualites): lecture publique des dernières photos

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Liens Facebook (`lienFacebookValide`, `urlLecteurFacebook`)

**Files:**
- Create: `src/lib/facebook.js`
- Create: `src/lib/facebook.test.js`

**Interfaces:**
- Produces:
  - `lienFacebookValide(lien: string): boolean`
  - `urlLecteurFacebook(lien: string): string` — URL de l'iframe du lecteur officiel (lien supposé valide).

- [ ] **Step 1: Écrire les tests**

`src/lib/facebook.test.js` :

```js
import { lienFacebookValide, urlLecteurFacebook } from './facebook'

test.each([
  'https://www.facebook.com/osteo/posts/pfbid0abc',
  'https://facebook.com/osteo/posts/123',
  'https://m.facebook.com/story.php?story_fbid=1&id=2',
  'https://web.facebook.com/share/p/1AbCd/',
  '  https://www.facebook.com/osteo/posts/123  ',
])('accepte %s', (lien) => {
  expect(lienFacebookValide(lien)).toBe(true)
})

test.each([
  '',
  '   ',
  'pas un lien',
  'http://www.facebook.com/osteo/posts/123',
  'https://www.facebook.com/',
  'https://facebook.com.pirate.fr/posts/1',
  'https://www.instagram.com/p/abc/',
  'javascript:alert(1)',
  undefined,
  null,
])('refuse %s', (lien) => {
  expect(lienFacebookValide(lien)).toBe(false)
})

test('construit l’URL du lecteur officiel avec le lien encodé', () => {
  const lien = 'https://www.facebook.com/osteo/posts/123?x=1&y=2'
  const src = urlLecteurFacebook(lien)
  expect(src.startsWith('https://www.facebook.com/plugins/post.php?')).toBe(true)
  const params = new URL(src).searchParams
  expect(params.get('href')).toBe(lien)
  expect(params.get('show_text')).toBe('true')
  expect(params.get('width')).toBe('500')
})

test('retire les espaces autour du lien', () => {
  const src = urlLecteurFacebook('  https://facebook.com/osteo/posts/1 ')
  expect(new URL(src).searchParams.get('href')).toBe('https://facebook.com/osteo/posts/1')
})
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/lib/facebook.test.js`
Expected: FAIL — module `./facebook` introuvable.

- [ ] **Step 3: Implémenter**

`src/lib/facebook.js` :

```js
const HOTES = new Set(['www.facebook.com', 'facebook.com', 'm.facebook.com', 'web.facebook.com'])

/**
 * Vrai pour un lien https vers un contenu Facebook. Le lien est saisi dans
 * l'administration puis injecté dans une iframe : on refuse tout le reste
 * plutôt que d'afficher un lecteur vide ou un autre site.
 */
export function lienFacebookValide(lien) {
  if (typeof lien !== 'string') return false
  try {
    const u = new URL(lien.trim())
    return u.protocol === 'https:' && HOTES.has(u.hostname) && u.pathname.length > 1
  } catch {
    return false
  }
}

/** URL de l'iframe du lecteur officiel « Embedded Post ». */
export function urlLecteurFacebook(lien) {
  const params = new URLSearchParams({ href: lien.trim(), show_text: 'true', width: '500' })
  return `https://www.facebook.com/plugins/post.php?${params}`
}
```

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/lib/facebook.test.js`
Expected: tous PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/facebook.js src/lib/facebook.test.js
git commit -m "feat(actualites): validation des liens Facebook et URL du lecteur

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Textes éditables et mentions légales

**Files:**
- Modify: `src/content/registre.js` (page `accueil`, nouveau groupe après `carrousel`)
- Modify: `src/content/registre.test.js`
- Modify: `src/content/data/mentions.js` (nouvelle entrée de `PARAGRAPHES` juste après `ml.donnees`)

**Interfaces:**
- Produces: clés `actu.titre` (défaut `'Actualités'`), `actu.facebook.lien` (défaut `''`), `ml.facebook` et `ml.facebook.titre` (via le groupe « Paragraphes » existant).

- [ ] **Step 1: Écrire le test**

Ajouter à `src/content/registre.test.js` :

```js
test('la section Actualités est éditable depuis l’accueil', () => {
  const accueil = PAGES.find(p => p.id === 'accueil')
  const groupe = accueil.groupes.find(g => g.id === 'actualites')
  expect(groupe.champs.map(c => c.cle)).toEqual(['actu.titre', 'actu.facebook.lien'])
  expect(DEFAUTS['actu.titre']).toBe('Actualités')
  expect(DEFAUTS['actu.facebook.lien']).toBe('')
})

test('les mentions légales signalent le contenu Facebook chargé à la demande', () => {
  expect(DEFAUTS['ml.facebook']).toMatch(/Facebook/)
  expect(DEFAUTS['ml.facebook']).toMatch(/cookies/)
})
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/content/registre.test.js`
Expected: FAIL — `groupe` indéfini / `DEFAUTS['ml.facebook']` indéfini.

- [ ] **Step 3: Implémenter le groupe du registre**

Dans `src/content/registre.js`, page `accueil`, insérer juste après la fermeture du groupe `carrousel` (`]},` qui suit `slide4.cta`) :

```js
      { id: 'actualites', titre: 'Actualités', champs: [
        champ('actu.titre',         'Titre de la section', 'Actualités'),
        champ('actu.facebook.lien', 'Lien du dernier post Facebook (sur Facebook : ⋯ du post → Copier le lien)', ''),
      ]},
```

- [ ] **Step 4: Implémenter le paragraphe des mentions**

Dans `src/content/data/mentions.js`, dans `PARAGRAPHES`, insérer après l'objet `ml.donnees` :

```js
  {
    cle: 'ml.facebook',
    titre: 'Contenus Facebook',
    defaut:
      "La page d'accueil peut présenter la dernière publication de la page Facebook du cabinet. " +
      "Ce contenu n'est chargé que si vous cliquez sur « Afficher le post » : Facebook (Meta " +
      "Platforms Ireland Ltd.) peut alors déposer des cookies sur votre appareil, régis par sa " +
      "propre politique de confidentialité. Sans ce clic, aucune donnée n'est transmise à Facebook.",
  },
```

Note : `ml.donnees` n'est pas modifié — si Manu l'a déjà personnalisé en base, une modification du défaut ne serait pas visible ; un paragraphe distinct l'est toujours.

- [ ] **Step 5: Vérifier le succès**

Run: `npx vitest run src/content src/pages/MentionsLegales.test.jsx`
Expected: tous PASS (le test d'unicité des clés inclus).

- [ ] **Step 6: Commit**

```bash
git add src/content/registre.js src/content/registre.test.js src/content/data/mentions.js
git commit -m "feat(actualites): titre et lien Facebook éditables, mention légale

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Bloc Facebook avec chargement au clic (`PostFacebook`)

**Files:**
- Create: `src/sections/actualites/PostFacebook.jsx`
- Create: `src/sections/actualites/PostFacebook.test.jsx`

**Interfaces:**
- Consumes: `urlLecteurFacebook(lien)` (Task 3).
- Produces: `export default function PostFacebook({ lien })` — `lien` est supposé déjà validé par l'appelant.

- [ ] **Step 1: Écrire les tests**

`src/sections/actualites/PostFacebook.test.jsx` :

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostFacebook from './PostFacebook'

const LIEN = 'https://www.facebook.com/osteo/posts/123'

test('ne charge rien de Facebook avant le clic', () => {
  const { container } = render(<PostFacebook lien={LIEN} />)
  expect(container.querySelector('iframe')).toBeNull()
  expect(screen.getByText(/cookies/i)).toBeInTheDocument()
})

test('propose toujours d’ouvrir le post sur Facebook', () => {
  render(<PostFacebook lien={LIEN} />)
  const lien = screen.getByRole('link', { name: /voir sur facebook/i })
  expect(lien).toHaveAttribute('href', LIEN)
  expect(lien).toHaveAttribute('target', '_blank')
  expect(lien.getAttribute('rel')).toContain('noopener')
})

test('charge le lecteur officiel au clic', async () => {
  render(<PostFacebook lien={LIEN} />)
  await userEvent.click(screen.getByRole('button', { name: /afficher le post/i }))
  const iframe = screen.getByTitle(/publication facebook/i)
  expect(iframe.tagName).toBe('IFRAME')
  expect(iframe.getAttribute('src')).toContain('https://www.facebook.com/plugins/post.php?')
  expect(iframe.getAttribute('src')).toContain(encodeURIComponent(LIEN))
  expect(screen.queryByRole('button', { name: /afficher le post/i })).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/sections/actualites/PostFacebook.test.jsx`
Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter**

`src/sections/actualites/PostFacebook.jsx` :

```jsx
import { useState } from 'react'
import { urlLecteurFacebook } from '../../lib/facebook'

/**
 * Dernier post Facebook. Le lecteur officiel dépose des cookies dès qu'il se
 * charge : on affiche d'abord un encart aux couleurs du site, et l'iframe
 * n'est créée qu'à la demande du visiteur (recommandation CNIL).
 */
export default function PostFacebook({ lien }) {
  const [charge, setCharge] = useState(false)

  return (
    <div className="w-full max-w-[500px] mx-auto">
      {charge ? (
        <iframe
          src={urlLecteurFacebook(lien)}
          title="Dernière publication Facebook d’Emmanuel Krieger"
          width="100%" height="620"
          className="w-full rounded-2xl bg-white border-0"
          allow="encrypted-media; clipboard-write; picture-in-picture; web-share"
        />
      ) : (
        <div className="rounded-2xl bg-green-deep text-white p-8 md:p-10">
          <div className="font-inter text-white/60 text-xs tracking-widest uppercase mb-3">Facebook</div>
          <h3 className="font-poppins font-bold text-2xl leading-tight mb-4">
            Dernière actualité<br />sur Facebook
          </h3>
          <p className="font-inter text-white/70 text-sm leading-relaxed mb-8">
            Le post est hébergé par Facebook. En l’affichant, vous acceptez que Facebook
            dépose des cookies sur votre appareil.
          </p>
          <button
            type="button" onClick={() => setCharge(true)}
            className="px-7 py-3 rounded-full bg-green-accent text-white font-poppins font-bold text-sm
                       hover:bg-teal-accent transition-colors cursor-pointer"
          >
            Afficher le post
          </button>
        </div>
      )}
      <a
        href={lien} target="_blank" rel="noopener noreferrer"
        className="inline-block mt-4 font-inter text-sm text-green-accent hover:underline"
      >
        Voir sur Facebook ↗
      </a>
    </div>
  )
}
```

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/sections/actualites/PostFacebook.test.jsx`
Expected: 3 PASS.

- [ ] **Step 5: Commit**

```bash
git add src/sections/actualites/PostFacebook.jsx src/sections/actualites/PostFacebook.test.jsx
git commit -m "feat(actualites): post Facebook chargé à la demande

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Nuage de photos et visionneuse

**Files:**
- Create: `src/sections/actualites/Visionneuse.jsx`
- Create: `src/sections/actualites/NuagePhotos.jsx`
- Create: `src/sections/actualites/NuagePhotos.test.jsx`

**Interfaces:**
- Consumes: la forme renvoyée par `lirePhotos()` (Task 2) : `{ id, url, description }`.
- Produces:
  - `export default function NuagePhotos({ photos })` — `photos` : 1 à 5 éléments.
  - `export default function Visionneuse({ photos, index, onChange, onClose })` — `index` : entier, `onChange(nouvelIndex)`, `onClose()`.
  - `export const texteAlternatif = (photo, rang) => string` (exporté depuis `NuagePhotos.jsx`).

- [ ] **Step 1: Écrire les tests**

`src/sections/actualites/NuagePhotos.test.jsx` :

```jsx
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NuagePhotos, { texteAlternatif } from './NuagePhotos'

const PHOTOS = [
  { id: '1', url: 'https://x/1.webp', description: 'Stage padel avec l’équipe de France' },
  { id: '2', url: 'https://x/2.webp', description: 'Match de Pro A' },
  { id: '3', url: 'https://x/3.webp', description: '' },
]

test('affiche une vignette cliquable par photo', () => {
  render(<NuagePhotos photos={PHOTOS} />)
  expect(screen.getAllByRole('button', { name: /agrandir/i })).toHaveLength(3)
  expect(screen.getByAltText(/stage padel/i)).toHaveAttribute('src', 'https://x/1.webp')
})

test('texte alternatif : début de la description, ou rang à défaut', () => {
  expect(texteAlternatif({ description: 'a'.repeat(200) }, 0)).toHaveLength(81)
  expect(texteAlternatif({ description: '' }, 2)).toBe('Photo d’actualité 3')
})

test('ouvre la visionneuse avec la description au clic', async () => {
  render(<NuagePhotos photos={PHOTOS} />)
  await userEvent.click(screen.getAllByRole('button', { name: /agrandir/i })[1])
  const dialogue = screen.getByRole('dialog')
  expect(within(dialogue).getByText('Match de Pro A')).toBeInTheDocument()
  expect(within(dialogue).getByText('2 / 3')).toBeInTheDocument()
})

test('navigue avec les flèches et boucle', async () => {
  render(<NuagePhotos photos={PHOTOS} />)
  await userEvent.click(screen.getAllByRole('button', { name: /agrandir/i })[0])
  await userEvent.keyboard('{ArrowRight}')
  expect(within(screen.getByRole('dialog')).getByText('Match de Pro A')).toBeInTheDocument()
  await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
  expect(within(screen.getByRole('dialog')).getByText('3 / 3')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /photo suivante/i }))
  expect(within(screen.getByRole('dialog')).getByText('1 / 3')).toBeInTheDocument()
})

test('se ferme avec Échap et rend le focus à la vignette', async () => {
  render(<NuagePhotos photos={PHOTOS} />)
  const vignette = screen.getAllByRole('button', { name: /agrandir/i })[2]
  await userEvent.click(vignette)
  await userEvent.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(vignette).toHaveFocus()
})

test('se ferme avec le bouton ×', async () => {
  render(<NuagePhotos photos={PHOTOS} />)
  await userEvent.click(screen.getAllByRole('button', { name: /agrandir/i })[0])
  await userEvent.click(screen.getByRole('button', { name: /fermer/i }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('garde le focus dans la visionneuse', async () => {
  render(<NuagePhotos photos={PHOTOS} />)
  await userEvent.click(screen.getAllByRole('button', { name: /agrandir/i })[0])
  const dialogue = screen.getByRole('dialog')
  for (let i = 0; i < 5; i++) {
    await userEvent.tab()
    expect(dialogue.contains(document.activeElement)).toBe(true)
  }
})
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/sections/actualites/NuagePhotos.test.jsx`
Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter la visionneuse**

`src/sections/actualites/Visionneuse.jsx` :

```jsx
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'

const BOUTON = 'w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl ' +
               'flex items-center justify-center transition-colors cursor-pointer'

/**
 * Photo agrandie et sa description. Rendue dans <body> : la section parente
 * est animée par Framer Motion, et un `transform` sur un ancêtre ferait d'un
 * `position: fixed` un simple `absolute`.
 */
export default function Visionneuse({ photos, index, onChange, onClose }) {
  const dialogue = useRef(null)
  const fermer = useRef(null)
  const photo = photos[index]
  const n = photos.length
  const aller = (pas) => onChange((index + pas + n) % n)

  useEffect(() => {
    fermer.current?.focus()
    const debordement = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = debordement }
  }, [])

  function touche(e) {
    if (e.key === 'Escape') { e.preventDefault(); onClose() }
    else if (e.key === 'ArrowRight' && n > 1) aller(1)
    else if (e.key === 'ArrowLeft' && n > 1) aller(-1)
    else if (e.key === 'Tab') {
      const focusables = [...dialogue.current.querySelectorAll('button')]
      const premier = focusables[0]
      const dernier = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus() }
      else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus() }
    }
  }

  return createPortal(
    <motion.div
      ref={dialogue}
      role="dialog" aria-modal="true" aria-label={`Photo ${index + 1} sur ${n}`}
      onKeyDown={touche}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      className="fixed inset-0 z-[100] bg-green-deep/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <button ref={fermer} type="button" onClick={onClose} aria-label="Fermer"
              className={BOUTON + ' absolute top-4 right-4'}>
        ×
      </button>

      {n > 1 && (
        <button type="button" onClick={() => aller(-1)} aria-label="Photo précédente"
                className={BOUTON + ' absolute left-2 md:left-6 top-1/2 -translate-y-1/2'}>
          ‹
        </button>
      )}

      <motion.figure
        key={photo.id}
        className="bg-white p-3 pb-5 rounded-sm shadow-2xl max-w-3xl w-full max-h-full flex flex-col"
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <img src={photo.url} alt="" className="w-full max-h-[65vh] object-contain bg-black/5" />
        <figcaption className="pt-4 px-1 flex items-start justify-between gap-4">
          <p className="font-inter text-text-primary leading-relaxed whitespace-pre-line">
            {photo.description}
          </p>
          <span className="font-inter text-text-secondary/60 text-sm shrink-0">{index + 1} / {n}</span>
        </figcaption>
      </motion.figure>

      {n > 1 && (
        <button type="button" onClick={() => aller(1)} aria-label="Photo suivante"
                className={BOUTON + ' absolute right-2 md:right-6 top-1/2 -translate-y-1/2'}>
          ›
        </button>
      )}
    </motion.div>,
    document.body,
  )
}
```

- [ ] **Step 4: Implémenter le nuage**

`src/sections/actualites/NuagePhotos.jsx` :

```jsx
import { useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Visionneuse from './Visionneuse'

/**
 * Emplacements fixes des tirages, du plus récent au plus ancien, en % du
 * conteneur (rapport 5:4). Fixes plutôt qu'aléatoires : la mise en page reste
 * identique d'une visite à l'autre et aucune photo n'est entièrement masquée.
 */
const EMPLACEMENTS = [
  { left: 30, top: 20, width: 40, rotate: -3, z: 5 },
  { left: 2,  top: 2,  width: 34, rotate: -8, z: 3 },
  { left: 64, top: 4,  width: 33, rotate: 7,  z: 2 },
  { left: 6,  top: 52, width: 32, rotate: 6,  z: 4 },
  { left: 60, top: 50, width: 34, rotate: -5, z: 1 },
]

export const texteAlternatif = (photo, rang) =>
  photo.description?.trim()
    ? (photo.description.length > 80 ? photo.description.slice(0, 80) + '…' : photo.description)
    : `Photo d’actualité ${rang + 1}`

export default function NuagePhotos({ photos }) {
  const [ouverte, setOuverte] = useState(null)
  const vignettes = useRef([])

  function fermer() {
    const rang = ouverte
    setOuverte(null)
    vignettes.current[rang]?.focus()
  }

  return (
    <>
      <div className="relative w-full aspect-[5/4]">
        {photos.slice(0, EMPLACEMENTS.length).map((photo, i) => {
          const e = EMPLACEMENTS[i]
          return (
            <button
              key={photo.id}
              ref={el => { vignettes.current[i] = el }}
              type="button"
              onClick={() => setOuverte(i)}
              aria-label={`Agrandir : ${texteAlternatif(photo, i)}`}
              style={{ left: `${e.left}%`, top: `${e.top}%`, width: `${e.width}%`,
                       zIndex: e.z, '--rot': `${e.rotate}deg` }}
              className="absolute bg-white p-[3%] pb-[12%] shadow-xl rounded-sm cursor-pointer
                         [transform:rotate(var(--rot))] transition-transform duration-300
                         hover:[transform:rotate(0deg)_scale(1.06)] hover:!z-10
                         focus-visible:[transform:rotate(0deg)_scale(1.06)] focus-visible:!z-10
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-accent"
            >
              <img src={photo.url} alt={texteAlternatif(photo, i)} loading="lazy"
                   className="w-full aspect-square object-cover bg-black/5" />
            </button>
          )
        })}
      </div>

      <AnimatePresence>
        {ouverte !== null && (
          <Visionneuse photos={photos.slice(0, EMPLACEMENTS.length)} index={ouverte}
                       onChange={setOuverte} onClose={fermer} />
        )}
      </AnimatePresence>
    </>
  )
}
```

Note : le `aria-label` du bouton contient le texte alternatif ; le test `getByAltText(/stage padel/i)` cible bien l'`<img>`.

- [ ] **Step 5: Vérifier le succès**

Run: `npx vitest run src/sections/actualites/NuagePhotos.test.jsx`
Expected: 7 PASS. Si le test « rend le focus » échoue parce que `fermer()` refocalise avant le démontage, remplacer `vignettes.current[rang]?.focus()` par `requestAnimationFrame(() => vignettes.current[rang]?.focus())` et utiliser `await waitFor(() => expect(vignette).toHaveFocus())` dans le test.

- [ ] **Step 6: Commit**

```bash
git add src/sections/actualites/NuagePhotos.jsx src/sections/actualites/Visionneuse.jsx src/sections/actualites/NuagePhotos.test.jsx
git commit -m "feat(actualites): nuage de photos et visionneuse

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Section `Actualites` et insertion sur l'accueil

**Files:**
- Create: `src/sections/Actualites.jsx`
- Create: `src/sections/Actualites.test.jsx`
- Modify: `src/pages/Home.jsx`

**Interfaces:**
- Consumes: `lirePhotos()` (Task 2), `lienFacebookValide()` (Task 3), clés `actu.titre` / `actu.facebook.lien` (Task 4), `PostFacebook` (Task 5), `NuagePhotos` (Task 6), `useTextes()` de `src/content/ContenuProvider.jsx`.
- Produces: `export default function Actualites()`.

- [ ] **Step 1: Écrire les tests**

`src/sections/Actualites.test.jsx` :

```jsx
import { render, screen, waitFor } from '@testing-library/react'
import Actualites from './Actualites'
import { lirePhotos } from '../lib/supabase'
import { DEFAUTS } from '../content/registre'

const etat = vi.hoisted(() => ({ textes: {} }))

vi.mock('../lib/supabase', () => ({ lirePhotos: vi.fn() }))
vi.mock('../content/ContenuProvider', () => ({ useTextes: () => etat.textes }))

const LIEN = 'https://www.facebook.com/osteo/posts/123'
const PHOTOS = [{ id: '1', url: 'https://x/1.webp', description: 'Stage padel' }]

function avecLien(lien) {
  etat.textes = { ...DEFAUTS, 'actu.facebook.lien': lien }
}

beforeEach(() => { lirePhotos.mockReset() })

test('photos et Facebook : deux colonnes', async () => {
  avecLien(LIEN)
  lirePhotos.mockResolvedValue(PHOTOS)
  render(<Actualites />)
  expect(await screen.findByAltText(/stage padel/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /afficher le post/i })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Actualités' })).toBeInTheDocument()
  expect(screen.getByTestId('actualites-grille')).toHaveClass('desktop:grid-cols-2')
})

test('sans photo : Facebook seul, pleine largeur', async () => {
  avecLien(LIEN)
  lirePhotos.mockResolvedValue([])
  render(<Actualites />)
  await waitFor(() => expect(lirePhotos).toHaveBeenCalled())
  await waitFor(() =>
    expect(screen.getByTestId('actualites-grille')).not.toHaveClass('desktop:grid-cols-2'))
  expect(screen.queryByRole('button', { name: /agrandir/i })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: /afficher le post/i })).toBeInTheDocument()
})

test('lien absent : nuage seul', async () => {
  avecLien('')
  lirePhotos.mockResolvedValue(PHOTOS)
  render(<Actualites />)
  expect(await screen.findByAltText(/stage padel/i)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /afficher le post/i })).not.toBeInTheDocument()
  expect(screen.getByTestId('actualites-grille')).not.toHaveClass('desktop:grid-cols-2')
})

test('lien non Facebook : ignoré', async () => {
  avecLien('https://www.instagram.com/p/abc/')
  lirePhotos.mockResolvedValue(PHOTOS)
  render(<Actualites />)
  await screen.findByAltText(/stage padel/i)
  expect(screen.queryByRole('button', { name: /afficher le post/i })).not.toBeInTheDocument()
})

test('ni photo ni lien : rien n’est rendu', async () => {
  avecLien('')
  lirePhotos.mockResolvedValue([])
  const { container } = render(<Actualites />)
  await waitFor(() => expect(lirePhotos).toHaveBeenCalled())
  await waitFor(() => expect(container).toBeEmptyDOMElement())
})
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/sections/Actualites.test.jsx`
Expected: FAIL — module `./Actualites` introuvable.

- [ ] **Step 3: Implémenter la section**

`src/sections/Actualites.jsx` :

```jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTextes } from '../content/ContenuProvider'
import { lirePhotos } from '../lib/supabase'
import { lienFacebookValide } from '../lib/facebook'
import NuagePhotos from './actualites/NuagePhotos'
import PostFacebook from './actualites/PostFacebook'

const apparition = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
}

/**
 * Photos publiées par Manu et dernier post Facebook. Chaque bloc disparaît
 * s'il n'a rien à montrer ; sans aucun des deux, la section n'est pas rendue.
 */
export default function Actualites() {
  const textes = useTextes()
  const [photos, setPhotos] = useState(null)   // null = lecture en cours

  useEffect(() => {
    let vivant = true
    lirePhotos().then(p => { if (vivant) setPhotos(p) })
    return () => { vivant = false }
  }, [])

  const lien = textes['actu.facebook.lien']?.trim()
  const aFacebook = lienFacebookValide(lien)
  // Pendant la lecture, on réserve la place du nuage pour éviter un saut de mise en page.
  const aPhotos = photos === null || photos.length > 0

  if (!aFacebook && !aPhotos) return null
  if (!aFacebook && photos === null) return null   // rien de sûr à montrer avant la réponse

  const deuxColonnes = aPhotos && aFacebook

  return (
    <section id="actualites" className="py-24 md:py-32 px-6 bg-site-bg overflow-x-clip">
      <div className="max-w-[1360px] mx-auto">
        <h2 className="font-poppins font-bold text-4xl md:text-5xl text-text-primary leading-tight mb-14">
          {textes['actu.titre']}
        </h2>
        <motion.div
          data-testid="actualites-grille"
          className={`grid grid-cols-1 gap-16 items-center ${deuxColonnes ? 'desktop:grid-cols-2' : ''}`}
          variants={apparition} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
        >
          {aPhotos && (
            <div className={deuxColonnes ? '' : 'max-w-3xl w-full mx-auto'}>
              {photos
                ? <NuagePhotos photos={photos} />
                : <div className="w-full aspect-[5/4]" aria-hidden="true" />}
            </div>
          )}
          {aFacebook && <PostFacebook lien={lien} />}
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/sections/Actualites.test.jsx`
Expected: 5 PASS.

- [ ] **Step 5: Insérer dans l'accueil**

`src/pages/Home.jsx` — ajouter l'import et la section entre `SliderActions` et `About` :

```jsx
import Hero from '../sections/Hero'
import SliderActions from '../sections/SliderActions'
import Actualites from '../sections/Actualites'
import About from '../sections/About'
import Testimonials from '../sections/Testimonials'
import Contact from '../sections/Contact'

export default function Home() {
  return (
    <main>
      <Hero />
      <SliderActions />
      <Actualites />
      <About />
      <Testimonials />
      <Contact />
    </main>
  )
}
```

- [ ] **Step 6: Suite complète + build**

Run: `npx vitest run && npm run build`
Expected: tous les tests PASS ; build et prérendu sans erreur.

- [ ] **Step 7: Commit**

```bash
git add src/sections/Actualites.jsx src/sections/Actualites.test.jsx src/pages/Home.jsx
git commit -m "feat(actualites): section Actualités sur l'accueil, après le slider

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Réduction des images avant envoi (`image.js`)

**Files:**
- Create: `src/lib/image.js`
- Create: `src/lib/image.test.js`

**Interfaces:**
- Produces:
  - `dimensionsReduites(largeur: number, hauteur: number, max = 1600): { largeur: number, hauteur: number }` — entiers, ratio conservé, jamais agrandi.
  - `reduireImage(fichier: File | Blob): Promise<{ blob: Blob, extension: 'webp' | 'jpg', type: string }>` — rejette avec `Error('Image illisible')` si le fichier ne se décode pas.

- [ ] **Step 1: Écrire les tests**

`src/lib/image.test.js` (jsdom n'a pas de canvas : seule la fonction pure est testée ; `reduireImage` est vérifiée à la main en Task 10) :

```js
import { dimensionsReduites } from './image'

test('réduit le plus grand côté à 1600 px en gardant les proportions', () => {
  expect(dimensionsReduites(4032, 3024)).toEqual({ largeur: 1600, hauteur: 1200 })
  expect(dimensionsReduites(3024, 4032)).toEqual({ largeur: 1200, hauteur: 1600 })
})

test('n’agrandit jamais une petite image', () => {
  expect(dimensionsReduites(800, 600)).toEqual({ largeur: 800, hauteur: 600 })
})

test('arrondit au pixel', () => {
  expect(dimensionsReduites(3000, 1999)).toEqual({ largeur: 1600, hauteur: 1066 })
})

test('accepte une autre limite', () => {
  expect(dimensionsReduites(1000, 500, 400)).toEqual({ largeur: 400, hauteur: 200 })
})
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/lib/image.test.js`
Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter**

`src/lib/image.js` :

```js
/** Dimensions après réduction : le plus grand côté ramené à `max`, jamais agrandi. */
export function dimensionsReduites(largeur, hauteur, max = 1600) {
  const ratio = Math.min(1, max / Math.max(largeur, hauteur))
  return { largeur: Math.round(largeur * ratio), hauteur: Math.round(hauteur * ratio) }
}

const versBlob = (canvas, type, qualite) =>
  new Promise(resolve => canvas.toBlob(resolve, type, qualite))

/**
 * Réduit une photo avant l'envoi : une photo de téléphone pèse 5 à 10 Mo,
 * la version réduite 200 à 400 ko. WebP si le navigateur sait l'encoder —
 * Safari renvoie sinon un PNG, bien plus lourd que l'original : on passe
 * alors en JPEG.
 */
export async function reduireImage(fichier) {
  let bitmap
  try {
    bitmap = await createImageBitmap(fichier, { imageOrientation: 'from-image' })
  } catch {
    throw new Error('Image illisible')
  }
  const { largeur, hauteur } = dimensionsReduites(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = largeur
  canvas.height = hauteur
  canvas.getContext('2d').drawImage(bitmap, 0, 0, largeur, hauteur)
  bitmap.close?.()

  const webp = await versBlob(canvas, 'image/webp', 0.82)
  if (webp?.type === 'image/webp') return { blob: webp, extension: 'webp', type: 'image/webp' }
  const jpeg = await versBlob(canvas, 'image/jpeg', 0.85)
  if (!jpeg) throw new Error('Image illisible')
  return { blob: jpeg, extension: 'jpg', type: 'image/jpeg' }
}
```

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/lib/image.test.js`
Expected: 4 PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/image.js src/lib/image.test.js
git commit -m "feat(actualites): réduction des photos dans le navigateur avant envoi

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Onglet « Photos » de l'administration

**Files:**
- Create: `src/pages/admin/Photos.jsx`
- Create: `src/pages/admin/Photos.test.jsx`
- Modify: `src/pages/Admin.jsx` (sommaire, sélecteur mobile, zone principale, barre d'enregistrement)

**Interfaces:**
- Consumes: `reduireImage(fichier)` (Task 8) ; client Supabase (`client.from('photos')`, `client.storage.from('photos')`) ; schéma de la Task 1.
- Produces: `export default function Photos({ client })` ; `export const EN_LIGNE = 5`.

Appels Supabase utilisés (supabase-js v2) :
- liste : `client.from('photos').select('id, chemin, description, cree_le').order('cree_le', { ascending: false })`
- ajout : `client.storage.from('photos').upload(chemin, blob, { contentType, upsert: false })` puis `client.from('photos').insert({ chemin, description })`
- description : `client.from('photos').update({ description }).eq('id', id)`
- suppression : `client.from('photos').delete().eq('id', id)` puis `client.storage.from('photos').remove([chemin])`
- vignette : `client.storage.from('photos').getPublicUrl(chemin).data.publicUrl`

- [ ] **Step 1: Écrire les tests**

`src/pages/admin/Photos.test.jsx` :

```jsx
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Photos from './Photos'

vi.mock('../../lib/image', () => ({
  reduireImage: vi.fn(async () => ({
    blob: new Blob(['x'], { type: 'image/webp' }), extension: 'webp', type: 'image/webp',
  })),
}))

/** Faux client Supabase : juste ce que l'onglet appelle, avec des espions. */
function fauxClient(lignes = []) {
  const donnees = [...lignes]
  const espions = {
    upload: vi.fn(async () => ({ error: null })),
    remove: vi.fn(async () => ({ error: null })),
    insert: vi.fn(async (ligne) => {
      donnees.unshift({ id: 'nouveau', cree_le: '2026-09-24', ...ligne })
      return { error: null }
    }),
    update: vi.fn(),
    delete: vi.fn(),
  }
  const client = {
    from: () => ({
      select: () => ({ order: async () => ({ data: [...donnees], error: null }) }),
      insert: espions.insert,
      update: (valeurs) => ({ eq: async (_c, id) => { espions.update(id, valeurs); return { error: null } } }),
      delete: () => ({ eq: async (_c, id) => {
        espions.delete(id)
        donnees.splice(donnees.findIndex(l => l.id === id), 1)
        return { error: null }
      } }),
    }),
    storage: {
      from: () => ({
        upload: espions.upload,
        remove: espions.remove,
        getPublicUrl: (chemin) => ({ data: { publicUrl: `https://cdn/${chemin}` } }),
      }),
    },
  }
  return { client, espions }
}

const ligne = (i) => ({ id: `id${i}`, chemin: `p${i}.webp`, description: `Photo ${i}`, cree_le: `2026-09-${10 + i}` })

test('liste les photos et marque les 5 premières en ligne', async () => {
  const { client } = fauxClient([1, 2, 3, 4, 5, 6].map(ligne))
  render(<Photos client={client} />)
  const items = await screen.findAllByRole('listitem')
  expect(items).toHaveLength(6)
  expect(within(items[0]).getByText(/en ligne/i)).toBeInTheDocument()
  expect(within(items[4]).getByText(/en ligne/i)).toBeInTheDocument()
  expect(within(items[5]).queryByText(/en ligne/i)).not.toBeInTheDocument()
  // alt="" : l'image est décorative, elle n'a pas le rôle img.
  expect(items[0].querySelector('img')).toHaveAttribute('src', 'https://cdn/p1.webp')
})

test('publie une photo réduite avec sa description', async () => {
  const { client, espions } = fauxClient()
  render(<Photos client={client} />)
  const fichier = new File(['img'], 'padel.jpg', { type: 'image/jpeg' })
  await userEvent.upload(await screen.findByLabelText(/^photo$/i), fichier)
  await userEvent.type(screen.getByLabelText(/^description$/i), 'Stage padel')
  await userEvent.click(screen.getByRole('button', { name: /publier/i }))

  await waitFor(() => expect(espions.insert).toHaveBeenCalled())
  const [chemin, blob, options] = espions.upload.mock.calls[0]
  expect(chemin).toMatch(/^[0-9a-f-]{36}\.webp$/)
  expect(blob.type).toBe('image/webp')
  expect(options.contentType).toBe('image/webp')
  expect(espions.insert).toHaveBeenCalledWith({ chemin, description: 'Stage padel' })
  expect(await screen.findByText(/photo publiée/i)).toBeInTheDocument()
  expect(await screen.findAllByRole('listitem')).toHaveLength(1)
})

test('supprime le fichier envoyé si l’enregistrement échoue', async () => {
  const { client, espions } = fauxClient()
  espions.insert.mockResolvedValueOnce({ error: { message: 'refusé' } })
  render(<Photos client={client} />)
  await userEvent.upload(await screen.findByLabelText(/^photo$/i),
                         new File(['img'], 'a.jpg', { type: 'image/jpeg' }))
  await userEvent.click(screen.getByRole('button', { name: /publier/i }))
  expect(await screen.findByText(/refusé/)).toBeInTheDocument()
  const chemin = espions.upload.mock.calls[0][0]
  expect(espions.remove).toHaveBeenCalledWith([chemin])
})

test('modifie une description', async () => {
  const { client, espions } = fauxClient([ligne(1)])
  render(<Photos client={client} />)
  const champ = await screen.findByDisplayValue('Photo 1')
  await userEvent.clear(champ)
  await userEvent.type(champ, 'Nouvelle légende')
  await userEvent.click(screen.getByRole('button', { name: /enregistrer la description/i }))
  await waitFor(() => expect(espions.update).toHaveBeenCalledWith('id1', { description: 'Nouvelle légende' }))
})

test('supprime une photo après confirmation', async () => {
  const { client, espions } = fauxClient([ligne(1), ligne(2)])
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  render(<Photos client={client} />)
  const items = await screen.findAllByRole('listitem')
  await userEvent.click(within(items[0]).getByRole('button', { name: /supprimer/i }))
  await waitFor(() => expect(espions.delete).toHaveBeenCalledWith('id1'))
  expect(espions.remove).toHaveBeenCalledWith(['p1.webp'])
  await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(1))
})

test('ne supprime rien si l’on annule', async () => {
  const { client, espions } = fauxClient([ligne(1)])
  vi.spyOn(window, 'confirm').mockReturnValue(false)
  render(<Photos client={client} />)
  await userEvent.click(await screen.findByRole('button', { name: /supprimer/i }))
  expect(espions.delete).not.toHaveBeenCalled()
})
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/pages/admin/Photos.test.jsx`
Expected: FAIL — module `./Photos` introuvable.

- [ ] **Step 3: Implémenter l'onglet**

`src/pages/admin/Photos.jsx` :

```jsx
import { useCallback, useEffect, useState } from 'react'
import { reduireImage } from '../../lib/image'

/** Nombre de photos affichées sur l'accueil (cf. `lirePhotos()`). */
export const EN_LIGNE = 5

const CHAMP = 'w-full rounded-lg border border-black/15 bg-white px-4 py-3 font-inter text-text-primary ' +
              'outline-none focus:border-green-accent focus:ring-2 focus:ring-green-accent/25 transition'
const BOUTON = 'px-6 py-2.5 rounded-full bg-green-accent text-white font-poppins font-bold text-sm ' +
               'hover:bg-teal-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer'

/* ── Formulaire d'ajout ─────────────────────────────────────────────── */

function Ajout({ client, onPubliee }) {
  const [fichier, setFichier] = useState(null)
  const [description, setDescription] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [message, setMessage] = useState(null)
  const [cleChamp, setCleChamp] = useState(0)   // réinitialise l'<input type=file>

  async function publier(e) {
    e.preventDefault()
    if (!fichier) return
    setEnvoi(true)
    setMessage(null)
    try {
      const { blob, extension, type } = await reduireImage(fichier)
      const chemin = `${crypto.randomUUID()}.${extension}`
      const stockage = client.storage.from('photos')
      const envoiFichier = await stockage.upload(chemin, blob, { contentType: type, upsert: false })
      if (envoiFichier.error) throw new Error(`Envoi refusé : ${envoiFichier.error.message}`)
      const { error } = await client.from('photos').insert({ chemin, description: description.trim() })
      if (error) {
        // Pas de fichier orphelin dans le stockage.
        await stockage.remove([chemin])
        throw new Error(`Enregistrement refusé : ${error.message}`)
      }
      setFichier(null)
      setDescription('')
      setCleChamp(k => k + 1)
      setMessage({ type: 'succes', texte: 'Photo publiée.' })
      onPubliee()
    } catch (err) {
      setMessage({ type: 'erreur', texte: err.message })
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <form onSubmit={publier} className="bg-white rounded-2xl border border-black/10 p-6 mb-12 space-y-5">
      <h3 className="font-poppins font-bold text-text-primary text-base">Ajouter une photo</h3>
      <div>
        <label htmlFor="photo-fichier" className="block font-inter text-text-primary text-sm font-medium mb-2">Photo</label>
        <input key={cleChamp} id="photo-fichier" type="file" accept="image/*" required
               onChange={e => setFichier(e.target.files?.[0] ?? null)}
               className="block font-inter text-sm text-text-secondary" />
      </div>
      <div>
        <label htmlFor="photo-description" className="block font-inter text-text-primary text-sm font-medium mb-2">Description</label>
        <textarea id="photo-description" rows={3} value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Affichée quand le visiteur clique sur la photo."
                  className={CHAMP + ' resize-y leading-relaxed'} />
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={!fichier || envoi} className={BOUTON}>
          {envoi ? 'Publication…' : 'Publier'}
        </button>
        {message && (
          <span role={message.type === 'erreur' ? 'alert' : 'status'}
                className={`font-inter text-sm ${message.type === 'erreur' ? 'text-red-600' : 'text-green-accent'}`}>
            {message.texte}
          </span>
        )}
      </div>
    </form>
  )
}

/* ── Une photo de la liste ──────────────────────────────────────────── */

function Ligne({ client, photo, enLigne, onChange }) {
  const [description, setDescription] = useState(photo.description)
  const [occupe, setOccupe] = useState(false)
  const [erreur, setErreur] = useState(null)
  const url = client.storage.from('photos').getPublicUrl(photo.chemin).data.publicUrl

  async function enregistrer() {
    setOccupe(true)
    setErreur(null)
    const { error } = await client.from('photos').update({ description: description.trim() }).eq('id', photo.id)
    setOccupe(false)
    if (error) setErreur(`Enregistrement refusé : ${error.message}`)
    else onChange()
  }

  async function supprimer() {
    if (!window.confirm('Supprimer définitivement cette photo ?')) return
    setOccupe(true)
    setErreur(null)
    const { error } = await client.from('photos').delete().eq('id', photo.id)
    if (error) {
      setOccupe(false)
      setErreur(`Suppression refusée : ${error.message}`)
      return
    }
    await client.storage.from('photos').remove([photo.chemin])
    onChange()
  }

  return (
    <li className="flex gap-5 items-start bg-white rounded-2xl border border-black/10 p-4">
      <img src={url} alt="" className="w-28 h-28 object-cover rounded-lg bg-black/5 shrink-0" />
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center gap-3 font-inter text-xs text-text-secondary/70">
          {enLigne && <span className="px-2 py-0.5 rounded-full bg-green-accent/10 text-green-accent font-medium">En ligne</span>}
          <span>{new Date(photo.cree_le).toLocaleDateString('fr-FR')}</span>
        </div>
        <textarea rows={2} value={description} aria-label="Description de la photo"
                  onChange={e => setDescription(e.target.value)}
                  className={CHAMP + ' resize-y leading-relaxed text-sm'} />
        <div className="flex items-center gap-4">
          <button type="button" onClick={enregistrer}
                  disabled={occupe || description.trim() === photo.description}
                  className="font-inter text-sm text-green-accent hover:underline disabled:opacity-40 disabled:no-underline cursor-pointer"
                  aria-label="Enregistrer la description">
            Enregistrer
          </button>
          <button type="button" onClick={supprimer} disabled={occupe}
                  className="font-inter text-sm text-red-600 hover:underline disabled:opacity-40 cursor-pointer">
            Supprimer
          </button>
          {erreur && <span role="alert" className="font-inter text-sm text-red-600">{erreur}</span>}
        </div>
      </div>
    </li>
  )
}

/* ── Onglet ─────────────────────────────────────────────────────────── */

export default function Photos({ client }) {
  const [photos, setPhotos] = useState(null)
  const [erreur, setErreur] = useState(null)

  const charger = useCallback(async () => {
    const { data, error } = await client.from('photos')
      .select('id, chemin, description, cree_le')
      .order('cree_le', { ascending: false })
    if (error) { setErreur(`Lecture impossible : ${error.message}`); setPhotos([]); return }
    setErreur(null)
    setPhotos(data ?? [])
  }, [client])

  useEffect(() => { charger() }, [charger])

  return (
    <>
      <div className="mb-8">
        <h2 className="font-poppins font-bold text-text-primary text-2xl">Photos d’actualité</h2>
        <p className="font-inter text-sm text-text-secondary mt-1">
          Les {EN_LIGNE} plus récentes s’affichent en nuage sur l’accueil, juste après le carrousel.
        </p>
      </div>

      <Ajout client={client} onPubliee={charger} />

      {erreur && <p role="alert" className="font-inter text-red-600 text-sm mb-6">{erreur}</p>}
      {photos === null
        ? <p className="font-inter text-text-secondary">Chargement des photos…</p>
        : photos.length === 0
          ? <p className="font-inter text-text-secondary">Aucune photo publiée pour l’instant.</p>
          : (
            <ul className="space-y-4">
              {photos.map((p, i) => (
                <Ligne key={`${p.id}-${p.description}`} client={client} photo={p}
                       enLigne={i < EN_LIGNE} onChange={charger} />
              ))}
            </ul>
          )}
    </>
  )
}
```

Note : la `key` inclut la description pour que la zone de saisie reprenne la valeur en base après rechargement.

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/pages/admin/Photos.test.jsx`
Expected: 6 PASS. En cas d'échec sur `findByLabelText(/^photo$/i)`, vérifier que le `<label>` contient exactement « Photo ».

- [ ] **Step 5: Brancher l'onglet dans `src/pages/Admin.jsx`**

1. Imports, en tête de fichier :

```jsx
import Photos from './admin/Photos'
```

et, juste sous la constante `CHAMP` :

```jsx
/** Entrée du sommaire qui n'est pas une page de textes. */
const ONGLET_PHOTOS = 'photos'
```

2. Sommaire desktop — après la `</ul>` de la liste des pages (dans `<nav>`), ajouter :

```jsx
          <div className="mt-5 pt-5 border-t border-black/10">
            <button
              onClick={() => { setPageActive(ONGLET_PHOTOS); setFiltre('') }}
              className={`w-full text-left px-3 py-2 rounded-lg font-inter text-sm transition-colors cursor-pointer
                ${pageActive === ONGLET_PHOTOS && !filtre
                  ? 'bg-green-accent text-white'
                  : 'text-text-secondary hover:bg-black/5'}`}
            >
              Photos d’actualité
            </button>
          </div>
```

3. Sélecteur mobile — après `{PAGES.map(p => <option …>)}` :

```jsx
            <option value={ONGLET_PHOTOS}>Photos d’actualité</option>
```

4. Zone principale — remplacer la ligne `{filtre` … `: (() => {` par une branche supplémentaire :

```jsx
          {filtre
            ? <Resultats filtre={filtre} valeurs={valeurs} initial={initial} onChange={majChamp} onReset={reinitialiser} />
            : pageActive === ONGLET_PHOTOS
              ? <Photos client={client} />
              : (() => {
```

(le reste du bloc `(() => { const page = PAGES.find(…) … })()}` est inchangé).

5. Barre d'enregistrement des textes — l'envelopper pour la masquer sur l'onglet Photos quand aucun texte n'attend :

```jsx
      {!(pageActive === ONGLET_PHOTOS && !modifiees.length) && (
        <div className="fixed bottom-0 inset-x-0 z-20 bg-white border-t border-black/10 px-6 py-4">
          …contenu actuel inchangé…
        </div>
      )}
```

- [ ] **Step 6: Suite complète**

Run: `npx vitest run`
Expected: tous PASS, dont `src/pages/Admin.test.jsx` inchangé.

- [ ] **Step 7: Commit**

```bash
git add src/pages/admin/Photos.jsx src/pages/admin/Photos.test.jsx src/pages/Admin.jsx
git commit -m "feat(admin): onglet Photos d'actualité (ajout, description, suppression)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Vérification dans le navigateur

**Files:** aucun (sauf correctifs éventuels, commités séparément).

- [ ] **Step 1: Lancer le site**

Run (en arrière-plan) : `npm run dev`
Ouvrir `http://localhost:5173/`.

- [ ] **Step 2: Vérifier la section publique**

- Sans photo en base et sans lien : aucune section entre le carrousel et « À propos ».
- Après l'ajout d'un lien Facebook dans `/admin` (Accueil → Actualités) : l'encart apparaît ; **l'onglet Réseau ne montre aucune requête vers `facebook.com` / `fbcdn.net` avant le clic** ; au clic, le post s'affiche. Tester un lien « Copier le lien » récent (`/share/p/…`) : s'il ne s'affiche pas dans le lecteur, le signaler à l'utilisateur (Manu devra alors utiliser le lien horodaté du post — clic sur la date du post → copier l'URL) et ajuster le libellé du champ dans `registre.js`.
- Nuage : 1, 3 puis 6 photos → au plus 5 affichées, aucune entièrement masquée, rotation au survol, clic → visionneuse, ← → Échap, focus rendu. Largeur 375 px : pas de défilement horizontal.

- [ ] **Step 3: Vérifier l'administration**

- Publier une photo de téléphone (> 4 Mo) : le fichier stocké (Supabase → Storage → `photos`) pèse < 600 ko, en `.webp` (ou `.jpg` sous Safari).
- Modifier une description, supprimer une photo : le fichier disparaît du bucket.
- Hors connexion admin, un `POST` direct sur `/rest/v1/photos` avec la clé publique est refusé (RLS).

- [ ] **Step 4: Build de production**

Run: `npm run build`
Expected: succès, `dist/index.html` généré.

- [ ] **Step 5: Rapport**

Résumer à l'utilisateur ce qui a été vérifié, ce qui ne l'a pas été (par ex. affichage sur un vrai iPhone), et rappeler la mise en service Supabase si la Task 1 Step 3 n'a pas été appliquée.
