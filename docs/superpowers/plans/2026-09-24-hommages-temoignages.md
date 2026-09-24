# Hommages et témoignages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre les hommages et témoignages gérables depuis `/admin` (ajout, modification, suppression, ordre, images) et les annoncer sur la hero.

**Architecture:** Une table Supabase `fiches` (type `hommage` | `temoignage`) + bucket `fiches`. Le site public lit par `fetch` direct (`lireFiches()`), avec repli sur les fiches d'origine du code en cas de panne. La page Histoire et la section Témoignages de l'accueil sont alimentées par un hook `useFiches()`. L'admin gagne deux onglets servis par un composant `Fiches` paramétré par type.

**Tech Stack:** React 19, Vite 8, Tailwind 3, Framer Motion 12, Supabase (PostgREST + Storage), Vitest 4 + Testing Library + user-event 14 (jsdom).

**Spec:** `docs/superpowers/specs/2026-09-24-hommages-temoignages-design.md`

## Global Constraints

- Tout en **français** avec accents et apostrophes typographiques (’) : UI, commentaires, noms de tests, messages de commit. Ne jamais retirer les diacritiques.
- Commits conventionnels en français, terminés par une ligne vide puis exactement `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Ne stager que ses propres fichiers ; jamais d'amend ni de rebase.
- Le site public ne charge **pas** `@supabase/supabase-js` : lecture par `fetch` (modèle `lirePhotos()` dans `src/lib/supabase.js`).
- Le site public ne dépend jamais de Supabase : `lireFiches()` renvoie `null` sur toute panne → fiches d'origine ; une liste vide `[]` est respectée.
- Chemin d'image : commence par `/` → image du site, utilisée telle quelle, **jamais supprimée** ; sinon → objet du bucket `fiches`.
- 4 images au plus par fiche. Réduction via `reduireImage()` (`src/lib/image.js`) avant envoi. Nom d'objet `<uuid>.<extension>`.
- Types : exactement `'hommage'` et `'temoignage'`.
- Point de rupture desktop : 850 px (`desktop:`).
- Dans les tests, `framer-motion` est remplacé par `__mocks__/framer-motion.jsx`. Tout composant qui lit des fiches doit mocker `lireFiches` (sinon un vrai `fetch` part vers Supabase, `.env` étant présent).
- `npx vitest run` entièrement vert et sans bruit (171 tests au départ) ; `npm run build` sans erreur.

## Structure des fichiers

| Fichier | Rôle |
|---|---|
| `supabase/schema.sql` (modif.) | Section 6 : table `fiches`, bucket `fiches`, politiques |
| `supabase/README.md` (modif.) | Usage des onglets Hommages / Témoignages |
| `src/lib/supabase.js` (modif.) | `urlFiche(chemin)`, `versFiche(ligne)`, `lireFiches()` |
| `src/lib/fiches.test.js` (créé) | Tests des trois fonctions ci-dessus |
| `src/content/data/fiches.js` (créé) | `FICHES_ORIGINE` (lignes au format base) |
| `src/content/data/fiches.test.js` (créé) | |
| `src/content/useFiches.js` (créé) | Hook : fiches lues ou d'origine, `null` pendant la lecture |
| `src/content/useFiches.test.jsx` (créé) | |
| `src/pages/Histoire.jsx` (modif.) | Sections hommages / témoignages alimentées par `useFiches` |
| `src/sections/Testimonials.jsx` (modif.) | 3 premiers témoignages |
| `src/content/registre.js` (modif.) | Retrait des champs dérivés ; `hero.hommages`, `hero.temoignages` |
| `src/content/data/temoignages.js` (supprimé) | Plus utilisé |
| `src/sections/Hero.jsx` (modif.) | Liens haut gauche / haut droite |
| `src/pages/admin/Fiches.jsx` (créé) | Onglet : liste, ordre, suppression |
| `src/pages/admin/FicheFormulaire.jsx` (créé) | Formulaire d'une fiche avec images |
| `src/pages/Admin.jsx` (modif.) | Deux entrées de sommaire |

---

### Task 1: Schéma Supabase

**Files:** Modify `supabase/schema.sql` (fin de fichier), `supabase/README.md`.

**Interfaces — Produces:** table `public.fiches (id uuid, type text, nom text, fonction text, titre text, texte text, images jsonb, ordre int, cree_le timestamptz)`, bucket public `fiches`.

- [ ] **Step 1: Ajouter la section 6 à `supabase/schema.sql`**

```sql
-- ── 6. Hommages et témoignages ──────────────────────────────────────────────
-- Fiches affichées sur la page Histoire (et les 3 premiers témoignages sur
-- l'accueil). `images` : [{ "chemin": "...", "legende": "..." }] — un chemin
-- commençant par « / » désigne une image livrée avec le site, sinon un objet
-- du bucket `fiches`.

create table if not exists public.fiches (
  id        uuid primary key default gen_random_uuid(),
  type      text not null check (type in ('hommage', 'temoignage')),
  nom       text not null,
  fonction  text not null default '',
  titre     text not null default '',
  texte     text not null default '',
  images    jsonb not null default '[]'::jsonb
            check (jsonb_typeof(images) = 'array' and jsonb_array_length(images) <= 4),
  ordre     integer not null default 0,
  cree_le   timestamptz not null default now()
);

create index if not exists fiches_type_ordre_idx on public.fiches (type, ordre);

alter table public.fiches enable row level security;

drop policy if exists "lecture publique" on public.fiches;
create policy "lecture publique"
  on public.fiches for select
  to anon, authenticated
  using (true);

drop policy if exists "ecriture admin" on public.fiches;
create policy "ecriture admin"
  on public.fiches for all
  to authenticated
  using (prive.est_admin())
  with check (prive.est_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fiches', 'fiches', true, 5242880, '{image/webp,image/jpeg}')
on conflict (id) do update
  set public = true, file_size_limit = 5242880, allowed_mime_types = '{image/webp,image/jpeg}';

drop policy if exists "fiches ajout admin" on storage.objects;
create policy "fiches ajout admin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'fiches' and prive.est_admin());

drop policy if exists "fiches modification admin" on storage.objects;
create policy "fiches modification admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'fiches' and prive.est_admin());

drop policy if exists "fiches suppression admin" on storage.objects;
create policy "fiches suppression admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'fiches' and prive.est_admin());

drop policy if exists "fiches lecture admin" on storage.objects;
create policy "fiches lecture admin"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'fiches' and prive.est_admin());

-- La reprise des fiches d'origine (données) n'est pas dans ce script : elle
-- a été faite une fois, à la mise en service, depuis FICHES_ORIGINE.
```

- [ ] **Step 2: README** — dans `supabase/README.md`, après la sous-section « Section Actualités » (avant `## Ajouter un texte éditable`) :

```markdown
### Hommages et témoignages

Onglets **Hommages** et **Témoignages** de l'administration (en bas du
sommaire). Chaque fiche : nom, fonction ou métier, phrase mise en avant,
texte (une ligne vide entre les paragraphes) et jusqu'à 4 images légendées.
Les flèches ↑ ↓ règlent l'ordre d'affichage sur la page Histoire ; les 3
premiers témoignages apparaissent aussi sur l'accueil.

Les en-têtes de ces sections (pastille, titre) restent dans la page
**Histoire et formation** de l'administration ; les liens de la hero dans
**Accueil → Bandeau**.
```

- [ ] **Step 3: Commit** — `feat(fiches): table et bucket Supabase des hommages et témoignages`. **Ne pas appliquer sur Supabase** (fait par le contrôleur en fin de plan).

---

### Task 2: Lecture publique et fiches d'origine

**Files:** Modify `src/lib/supabase.js` ; Create `src/lib/fiches.test.js`, `src/content/data/fiches.js`, `src/content/data/fiches.test.js`, `src/content/useFiches.js`, `src/content/useFiches.test.jsx`.

**Interfaces — Produces:**
- `urlFiche(chemin: string): string` — `chemin` si commence par `/`, sinon `${url}/storage/v1/object/public/fiches/${chemin}`.
- `versFiche(ligne) → { id, type, nom, fonction, titre, texte, images: [{ url, legende }] }` (champs absents → `''` / `[]`).
- `lireFiches(): Promise<Fiche[] | null>` — triées par `ordre` puis `cree_le` ; `null` sur panne ou si Supabase n'est pas configuré.
- `FICHES_ORIGINE: Array<ligne>` (format base : `images: [{ chemin, legende }]`, `ordre`), 2 hommages puis 3 témoignages.
- `useFiches(): Fiche[] | null` — `null` pendant la lecture ; sinon la liste lue, ou `FICHES_ORIGINE.map(versFiche)` si `lireFiches()` a renvoyé `null`.

- [ ] **Step 1: Tests de `src/lib/fiches.test.js`**

```js
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test')
const { lireFiches, urlFiche, versFiche } = await import('./supabase')

afterEach(() => { vi.unstubAllGlobals() })

test('une image du site garde son chemin, une image du bucket prend l’URL publique', () => {
  expect(urlFiche('/images/fred-forte.jpg')).toBe('/images/fred-forte.jpg')
  expect(urlFiche('abc.webp')).toBe('https://test.supabase.co/storage/v1/object/public/fiches/abc.webp')
})

test('met une ligne au format d’affichage', () => {
  expect(versFiche({
    id: '1', type: 'hommage', nom: 'Fred FORTE', fonction: null, titre: 'Voilà', texte: 'a\n\nb',
    images: [{ chemin: '/images/x.jpg', legende: 'X' }, { chemin: 'y.webp' }], ordre: 0,
  })).toEqual({
    id: '1', type: 'hommage', nom: 'Fred FORTE', fonction: '', titre: 'Voilà', texte: 'a\n\nb',
    images: [
      { url: '/images/x.jpg', legende: 'X' },
      { url: 'https://test.supabase.co/storage/v1/object/public/fiches/y.webp', legende: '' },
    ],
  })
})

test('lit les fiches dans l’ordre choisi', async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true, json: async () => [{ id: '1', type: 'temoignage', nom: 'A', images: [] }],
  })
  vi.stubGlobal('fetch', fetchMock)
  const fiches = await lireFiches()
  const appel = fetchMock.mock.calls[0][0]
  expect(appel).toContain('/rest/v1/fiches?')
  expect(appel).toContain('order=ordre.asc,cree_le.asc')
  expect(fiches).toEqual([{ id: '1', type: 'temoignage', nom: 'A', fonction: '', titre: '', texte: '', images: [] }])
})

test('une liste vide est respectée', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }))
  expect(await lireFiches()).toEqual([])
})

test('renvoie null en cas d’erreur HTTP ou réseau', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }))
  expect(await lireFiches()).toBeNull()
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('hors ligne')))
  expect(await lireFiches()).toBeNull()
})
```

- [ ] **Step 2: RED** — `npx vitest run src/lib/fiches.test.js` → échec (`lireFiches is not a function`).

- [ ] **Step 3: Implémenter** — à la fin de `src/lib/supabase.js` :

```js
/**
 * URL d'une image de fiche. Un chemin qui commence par « / » désigne une
 * image livrée avec le site (les fiches d'origine) ; sinon, un objet du
 * bucket `fiches`.
 */
export const urlFiche = (chemin) =>
  chemin.startsWith('/') ? chemin : `${url}/storage/v1/object/public/fiches/${chemin}`

/** Ligne de la table `fiches` → fiche prête à afficher. */
export function versFiche(ligne) {
  return {
    id: ligne.id,
    type: ligne.type,
    nom: ligne.nom ?? '',
    fonction: ligne.fonction ?? '',
    titre: ligne.titre ?? '',
    texte: ligne.texte ?? '',
    images: (ligne.images ?? []).map(i => ({ url: urlFiche(i.chemin), legende: i.legende ?? '' })),
  }
}

/**
 * Hommages et témoignages, dans l'ordre choisi par Manu. Renvoie `null` sur
 * toute panne — l'appelant retombe alors sur les fiches d'origine — mais une
 * liste vide telle quelle : Manu a pu tout retirer.
 */
export async function lireFiches() {
  if (!supabaseConfigure) return null
  try {
    const reponse = await fetch(
      `${url}/rest/v1/fiches?select=id,type,nom,fonction,titre,texte,images&order=ordre.asc,cree_le.asc`,
      { headers: { apikey: cle, Authorization: `Bearer ${cle}` } },
    )
    if (!reponse.ok) return null
    return (await reponse.json()).map(versFiche)
  } catch {
    return null
  }
}
```

- [ ] **Step 4: GREEN** — même commande → 5 PASS.

- [ ] **Step 5: `src/content/data/fiches.test.js`**

```js
import { FICHES_ORIGINE } from './fiches'
import { HOMMAGES, TEMOIGNAGES } from './histoire'

test('reprend les 2 hommages puis les 3 témoignages, dans l’ordre', () => {
  expect(FICHES_ORIGINE.map(f => [f.type, f.nom, f.ordre])).toEqual([
    ['hommage', 'Fred FORTE', 0],
    ['hommage', 'Thierry RUPERT', 1],
    ['temoignage', 'Matthieu LORENTZ', 0],
    ['temoignage', 'Richard BILLANT', 1],
    ['temoignage', 'Paris McCURDY', 2],
  ])
})

test('hommage : citation en titre, paragraphes en texte, images légendées', () => {
  const fred = FICHES_ORIGINE[0]
  expect(fred.titre).toBe(HOMMAGES[0].citation)
  expect(fred.texte).toBe(HOMMAGES[0].paragraphes.join('\n\n'))
  expect(fred.images).toEqual(HOMMAGES[0].images.map(i => ({ chemin: i.src, legende: i.legende })))
})

test('témoignage : extrait en titre, image avec sa description, langue dans la fonction', () => {
  const [lorentz, billant, paris] = FICHES_ORIGINE.slice(2)
  expect(lorentz.titre).toBe(TEMOIGNAGES[0].extrait)
  expect(lorentz.images).toEqual([])
  expect(billant.images).toEqual([{ chemin: TEMOIGNAGES[1].img, legende: TEMOIGNAGES[1].imgAlt }])
  expect(paris.fonction).toBe('Ancien basketteur professionnel · témoignage en anglais')
})

test('chaque fiche a un identifiant stable', () => {
  expect(new Set(FICHES_ORIGINE.map(f => f.id)).size).toBe(5)
})
```

- [ ] **Step 6: RED puis implémenter `src/content/data/fiches.js`**

```js
// Fiches d'origine, au format de la table `fiches`. Elles ont servi à la
// reprise en base et restent le repli du site quand Supabase est injoignable.
import { HOMMAGES, TEMOIGNAGES } from './histoire'

const hommages = HOMMAGES.map((h, i) => ({
  id: `origine-hommage-${i}`,
  type: 'hommage',
  nom: h.nom,
  fonction: h.role,
  titre: h.citation ?? '',
  texte: h.paragraphes.join('\n\n'),
  images: (h.images ?? []).map(({ src, legende }) => ({ chemin: src, legende: legende ?? '' })),
  ordre: i,
}))

const temoignages = TEMOIGNAGES.map((t, i) => ({
  id: `origine-temoignage-${i}`,
  type: 'temoignage',
  nom: t.nom,
  fonction: t.langue ? `${t.role} · ${t.langue.replace(/^Témoignage/, 'témoignage')}` : t.role,
  titre: t.extrait ?? '',
  texte: t.paragraphes.join('\n\n'),
  images: t.img ? [{ chemin: t.img, legende: t.imgAlt ?? '' }] : [],
  ordre: i,
}))

export const FICHES_ORIGINE = [...hommages, ...temoignages]
```

GREEN : `npx vitest run src/content/data/fiches.test.js` → 4 PASS.

- [ ] **Step 7: `src/content/useFiches.test.jsx`**

```jsx
import { renderHook, waitFor } from '@testing-library/react'
import { useFiches } from './useFiches'
import { lireFiches } from '../lib/supabase'

vi.mock('../lib/supabase', async (importOriginal) => ({
  ...(await importOriginal()),
  lireFiches: vi.fn(),
}))

test('null pendant la lecture, puis les fiches lues', async () => {
  const fiches = [{ id: '1', type: 'hommage', nom: 'A', fonction: '', titre: '', texte: '', images: [] }]
  lireFiches.mockResolvedValue(fiches)
  const { result } = renderHook(() => useFiches())
  expect(result.current).toBeNull()
  await waitFor(() => expect(result.current).toEqual(fiches))
})

test('repli sur les fiches d’origine si la base ne répond pas', async () => {
  lireFiches.mockResolvedValue(null)
  const { result } = renderHook(() => useFiches())
  await waitFor(() => expect(result.current).not.toBeNull())
  expect(result.current.map(f => f.nom)).toContain('Fred FORTE')
  expect(result.current[0].images[0].url).toBe('/images/fred-forte.jpg')
})

test('une base vide reste vide', async () => {
  lireFiches.mockResolvedValue([])
  const { result } = renderHook(() => useFiches())
  await waitFor(() => expect(result.current).toEqual([]))
})
```

- [ ] **Step 8: Implémenter `src/content/useFiches.js`**

```js
import { useEffect, useState } from 'react'
import { lireFiches, versFiche } from '../lib/supabase'
import { FICHES_ORIGINE } from './data/fiches'

/**
 * Hommages et témoignages à afficher. `null` pendant la lecture : on
 * n'affiche pas les fiches d'origine en attendant, sinon une fiche retirée
 * par Manu réapparaîtrait un instant. Si la base ne répond pas, on retombe
 * sur les fiches d'origine — le site ne dépend jamais de Supabase.
 */
export function useFiches() {
  const [fiches, setFiches] = useState(null)
  useEffect(() => {
    let vivant = true
    lireFiches().then(lues => {
      if (vivant) setFiches(lues ?? FICHES_ORIGINE.map(versFiche))
    })
    return () => { vivant = false }
  }, [])
  return fiches
}
```

GREEN : `npx vitest run src/lib/fiches.test.js src/content` → tout PASS ; puis suite complète.

- [ ] **Step 9: Commit** — `feat(fiches): lecture publique des fiches, avec repli sur les fiches d’origine` (fichiers : `src/lib/supabase.js`, `src/lib/fiches.test.js`, `src/content/data/fiches.js`, `src/content/data/fiches.test.js`, `src/content/useFiches.js`, `src/content/useFiches.test.jsx`).

---

### Task 3: Page Histoire alimentée par les fiches

**Files:** Modify `src/pages/Histoire.jsx`, `src/pages/Histoire.test.jsx`.

**Interfaces — Consumes:** `useFiches()` (Task 2), `enParagraphes` (`src/content/registre.js`). Les clés `hommage.<i>.*` / `temoignage.<i>.*` ne doivent plus être lues (elles disparaissent en Task 5). En-têtes `hommages.*`, `temoignages.*` inchangés.

- [ ] **Step 1: Tests** — en tête de `src/pages/Histoire.test.jsx`, ajouter le mock (toutes les autres sections de la page restent testées telles quelles) :

```jsx
import { lireFiches } from '../lib/supabase'

vi.mock('../lib/supabase', async (importOriginal) => ({
  ...(await importOriginal()),
  lireFiches: vi.fn(),
}))

beforeEach(() => { lireFiches.mockReset(); lireFiches.mockResolvedValue(null) })
```

Remplacer les tests « affiche les hommages » et « affiche les témoignages » par :

```jsx
test('affiche les hommages et témoignages d’origine si la base ne répond pas', async () => {
  render(<Histoire />, { wrapper: Wrapper })
  expect((await screen.findAllByText(/Fred FORTE/)).length).toBeGreaterThan(0)
  expect(screen.getAllByText(/Thierry RUPERT/).length).toBeGreaterThan(0)
  expect(screen.getByText(/Matthieu LORENTZ/)).toBeInTheDocument()
  expect(screen.getByText(/Richard BILLANT/)).toBeInTheDocument()
  expect(screen.getByText(/Paris McCURDY/)).toBeInTheDocument()
})

const fiche = (type, nom, extra = {}) => ({
  id: nom, type, nom, fonction: `Fonction de ${nom}`, titre: `Titre de ${nom}`,
  texte: `Premier paragraphe de ${nom}.\n\nSecond paragraphe de ${nom}.`, images: [], ...extra,
})

test('affiche les fiches de la base, dans l’ordre reçu', async () => {
  lireFiches.mockResolvedValue([
    fiche('hommage', 'Alice', { images: [{ url: '/a.jpg', legende: 'Alice au club' }] }),
    fiche('temoignage', 'Bruno'),
    fiche('temoignage', 'Chloé'),
  ])
  render(<Histoire />, { wrapper: Wrapper })
  const hommages = await screen.findByRole('region', { name: /ceux qui m’ont|ceux qui m'ont/i })
  expect(within(hommages).getByRole('heading', { name: 'Alice' })).toBeInTheDocument()
  expect(within(hommages).getByText(/Titre de Alice/)).toBeInTheDocument()
  expect(within(hommages).getByText('Second paragraphe de Alice.')).toBeInTheDocument()
  expect(within(hommages).getByAltText('Alice au club')).toHaveAttribute('src', '/a.jpg')
  expect(within(hommages).getByText('Alice au club')).toBeInTheDocument()
  expect(screen.queryByText(/Fred FORTE/)).not.toBeInTheDocument()
  const noms = screen.getAllByTestId('temoignage-nom').map(n => n.textContent)
  expect(noms).toEqual(['Bruno', 'Chloé'])
})

test('un témoignage montre son titre, puis tout le texte au clic', async () => {
  lireFiches.mockResolvedValue([fiche('temoignage', 'Bruno')])
  render(<Histoire />, { wrapper: Wrapper })
  expect(await screen.findByText('Titre de Bruno')).toBeInTheDocument()
  expect(screen.queryByText('Second paragraphe de Bruno.')).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /lire le témoignage/i }))
  expect(screen.getByText('Second paragraphe de Bruno.')).toBeInTheDocument()
})

test('n’affiche pas les fiches d’origine pendant la lecture', () => {
  lireFiches.mockReturnValue(new Promise(() => {}))
  render(<Histoire />, { wrapper: Wrapper })
  expect(screen.queryByText(/Fred FORTE/)).not.toBeInTheDocument()
})
```

(ajouter `within` à l'import de Testing Library et `import userEvent from '@testing-library/user-event'`.)

- [ ] **Step 2: RED** — `npx vitest run src/pages/Histoire.test.jsx`.

- [ ] **Step 3: Implémenter** dans `src/pages/Histoire.jsx` :

1. Imports : retirer `HOMMAGES, TEMOIGNAGES` de l'import de `../content/data/histoire` ; ajouter `import { useFiches } from '../content/useFiches'`.
2. Dans `Histoire()` : `const fiches = useFiches()` puis
   `const hommages = fiches?.filter(f => f.type === 'hommage') ?? []` et
   `const temoignages = fiches?.filter(f => f.type === 'temoignage') ?? []`.
3. `<section id="hommages" …>` : ajouter `aria-labelledby="titre-hommages"` et `id="titre-hommages"` sur son `<h2>`. Remplacer `{HOMMAGES.map((h, i) => (` par `{hommages.map(h => (` avec `key={h.id}`, et dans le rendu :
   - images : `h.images.map(({ url, legende }, j) => (<figure key={j} …><img src={url} alt={legende || h.nom} …/>{legende && <figcaption …>{legende}</figcaption>}</figure>))` — le bloc d'images n'est rendu que si `h.images.length > 0` ;
   - `<h3 …>{h.nom}</h3>`, `<p …>{h.fonction}</p>` ;
   - citation : `{h.titre && (<p …>«&nbsp;{h.titre}&nbsp;»</p>)}` ;
   - paragraphes : `enParagraphes(h.texte).map(…)`.
4. `<section id="temoignages" …>` : `{temoignages.map(t => <Temoignage key={t.id} fiche={t} />)}`.
5. Réécrire `Temoignage` :

```jsx
/** Carte de témoignage : phrase mise en avant, texte intégral au clic. */
function Temoignage({ fiche: t }) {
  const [ouvert, setOuvert] = useState(false)
  const image = t.images[0]
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="rounded-2xl bg-white border border-green-deep/10 overflow-hidden shadow-sm"
    >
      {image && (
        <img
          src={image.url}
          alt={image.legende || t.nom}
          className="w-full h-auto block border-b border-green-deep/10"
          onError={e => { e.target.style.display = 'none' }}
        />
      )}
      <div className="p-7">
        <div className="font-poppins text-green-accent text-4xl leading-none mb-3">“</div>
        <div className="space-y-4">
          {(ouvert ? enParagraphes(t.texte) : [t.titre]).map((p, i) => (
            <p key={i} className="font-inter text-text-secondary leading-relaxed">{p}</p>
          ))}
        </div>
        {t.texte && (
          <button
            onClick={() => setOuvert(o => !o)}
            className="mt-5 font-poppins font-bold text-sm text-green-accent hover:text-teal-accent transition-colors"
          >
            {ouvert ? 'Réduire ↑' : 'Lire le témoignage →'}
          </button>
        )}
        <div className="mt-6 pt-5 border-t border-green-deep/10">
          <div data-testid="temoignage-nom" className="font-poppins font-bold text-text-primary">{t.nom}</div>
          <div className="font-inter text-text-secondary/70 text-sm">{t.fonction}</div>
        </div>
      </div>
    </motion.article>
  )
}
```

`useTextes` n'est plus utilisé dans `Temoignage` ; le laisser importé s'il sert ailleurs dans le fichier.

- [ ] **Step 4: GREEN** — `npx vitest run src/pages/Histoire.test.jsx`, puis suite complète.

- [ ] **Step 5: Commit** — `feat(fiches): la page Histoire affiche les hommages et témoignages de la base`.

---

### Task 4: Section Témoignages de l'accueil

**Files:** Modify `src/sections/Testimonials.jsx`, `src/sections/Testimonials.test.jsx`.

**Interfaces — Consumes:** `useFiches()`. Produces : `export const initiales = (nom) => string`, `export const tronquer = (texte, max = 220) => string`.

- [ ] **Step 1: Tests** — remplacer le contenu de `src/sections/Testimonials.test.jsx` :

```jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Testimonials, { initiales, tronquer } from './Testimonials'
import { lireFiches } from '../lib/supabase'

vi.mock('../lib/supabase', async (importOriginal) => ({
  ...(await importOriginal()),
  lireFiches: vi.fn(),
}))

beforeEach(() => { lireFiches.mockReset(); lireFiches.mockResolvedValue(null) })

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

const temoignage = (nom, titre = `Titre de ${nom}`) =>
  ({ id: nom, type: 'temoignage', nom, fonction: `Fonction de ${nom}`, titre, texte: '', images: [] })

test('rend les 3 témoignages d’origine si la base ne répond pas', async () => {
  renderWithRouter(<Testimonials />)
  expect(await screen.findByText(/Matthieu LORENTZ/)).toBeInTheDocument()
  expect(screen.getByText(/Richard BILLANT/)).toBeInTheDocument()
  expect(screen.getByText(/Paris McCURDY/)).toBeInTheDocument()
  expect(screen.getByText(/on parlait souvent des victoires/i)).toBeInTheDocument()
})

test('n’affiche que les 3 premiers témoignages de la base, jamais un hommage', async () => {
  lireFiches.mockResolvedValue([
    { ...temoignage('Hommage X'), type: 'hommage' },
    temoignage('Alice'), temoignage('Bruno'), temoignage('Chloé'), temoignage('David'),
  ])
  renderWithRouter(<Testimonials />)
  expect(await screen.findByText('Alice')).toBeInTheDocument()
  expect(screen.getByText('Chloé')).toBeInTheDocument()
  expect(screen.queryByText('David')).not.toBeInTheDocument()
  expect(screen.queryByText('Hommage X')).not.toBeInTheDocument()
  expect(screen.getByText('Titre de Alice')).toBeInTheDocument()
  expect(screen.getByText('Fonction de Alice')).toBeInTheDocument()
})

test('initiales et titre tronqué', () => {
  expect(initiales('Matthieu LORENTZ')).toBe('ML')
  expect(initiales('Paris McCURDY')).toBe('PM')
  expect(initiales('Cher')).toBe('C')
  const long = 'mot '.repeat(100).trim()
  const court = tronquer(long)
  expect(court.length).toBeLessThanOrEqual(221)
  expect(court.endsWith('…')).toBe(true)
  expect(tronquer('Court.')).toBe('Court.')
})

test('renvoie vers les hommages et les témoignages de la page Histoire', () => {
  renderWithRouter(<Testimonials />)
  expect(screen.getByRole('link', { name: /témoignages/i })).toHaveAttribute('href', '/histoire#temoignages')
  expect(screen.getByRole('link', { name: /hommages/i })).toHaveAttribute('href', '/histoire#hommages')
})
```

- [ ] **Step 2: RED** — `npx vitest run src/sections/Testimonials.test.jsx`.

- [ ] **Step 3: Implémenter** dans `src/sections/Testimonials.jsx` :
   - retirer l'import de `TESTIMONIALS` ; importer `useFiches` ;
   - ajouter :

```js
const DEGRADES = ['from-green-accent to-teal-accent', 'from-cyan-accent to-teal-accent', 'from-teal-accent to-green-accent']

/** « Matthieu LORENTZ » → « ML ». */
export const initiales = (nom) =>
  nom.split(/\s+/).filter(Boolean).slice(0, 2).map(m => m[0].toUpperCase()).join('')

/** Coupe au dernier espace avant `max` caractères et ajoute « … ». */
export function tronquer(texte, max = 220) {
  if (texte.length <= max) return texte
  const coupe = texte.slice(0, max)
  return coupe.slice(0, coupe.lastIndexOf(' ') > 0 ? coupe.lastIndexOf(' ') : max).trimEnd() + '…'
}
```

   - dans le composant : `const temoignages = (useFiches() ?? []).filter(f => f.type === 'temoignage').slice(0, 3)` ; la grille rend `temoignages.map((t, i) => …)` avec `key={t.id}`, le texte `{tronquer(t.titre)}`, la pastille `bg-gradient-to-br ${DEGRADES[i % 3]}` contenant `{initiales(t.nom)}`, puis `{t.nom}` et `{t.fonction}`. La grille n'est rendue que si `temoignages.length > 0`. En-tête, amorce et boutons inchangés.

- [ ] **Step 4: GREEN** puis suite complète.

- [ ] **Step 5: Commit** — `feat(fiches): l’accueil affiche les 3 premiers témoignages de la base`.

---

### Task 5: Registre — retrait des champs dérivés, libellés de la hero

**Files:** Modify `src/content/registre.js`, `src/content/registre.test.js` ; Delete `src/content/data/temoignages.js`.

**Interfaces — Produces:** clés `hero.hommages` (« HOMMAGES »), `hero.temoignages` (« TÉMOIGNAGES ») dans le groupe `hero` de la page `accueil`. Plus aucune clé `hommage.<n>.*`, `temoignage.<n>.*`, `temoin.<n>.*`.

- [ ] **Step 1: Tests** — ajouter à `src/content/registre.test.js` :

```js
test('les fiches ne sont plus des textes du registre', () => {
  const cles = Object.keys(DEFAUTS)
  expect(cles.filter(c => /^(hommage|temoignage|temoin)\.\d+\./.test(c))).toEqual([])
  for (const c of ['hommages.surtitre', 'hommages.titre1', 'temoignages.titre', 'temoins.surtitre', 'temoins.lien1']) {
    expect(cles).toContain(c)
  }
})

test('les liens Hommages et Témoignages de la hero sont éditables', () => {
  const bandeau = PAGES.find(p => p.id === 'accueil').groupes.find(g => g.id === 'hero')
  expect(bandeau.champs.map(c => c.cle)).toEqual(expect.arrayContaining(['hero.hommages', 'hero.temoignages']))
  expect(DEFAUTS['hero.hommages']).toBe('HOMMAGES')
  expect(DEFAUTS['hero.temoignages']).toBe('TÉMOIGNAGES')
})
```

- [ ] **Step 2: RED**, puis **implémenter** dans `src/content/registre.js` :
   - groupe `hero` de l'accueil : ajouter à la fin
     `champ('hero.hommages', 'Lien en haut à gauche', 'HOMMAGES'),` et
     `champ('hero.temoignages', 'Lien en haut à droite', 'TÉMOIGNAGES'),` ;
   - groupe `temoins` : retirer le `...depuisListe(TESTIMONIALS, 'temoin', […])` ;
   - groupe `hommages` : retirer le `...depuisListe(HOMMAGES, 'hommage', […])` ;
   - groupe `temoignages` : retirer le `...depuisListe(TEMOIGNAGES, 'temoignage', […])` ;
   - retirer `HOMMAGES, TEMOIGNAGES` de l'import de `./data/histoire` et supprimer l'import de `./data/temoignages` ;
   - `git rm src/content/data/temoignages.js` (vérifier avant avec `grep -rn "data/temoignages" src` qu'il n'a plus d'utilisateur).

- [ ] **Step 3: GREEN** — `npx vitest run` complet.

- [ ] **Step 4: Commit** — `refactor(registre): les fiches quittent le registre, liens de la hero éditables`.

---

### Task 6: Liens Hommages / Témoignages sur la hero

**Files:** Modify `src/sections/Hero.jsx`, `src/sections/Hero.test.jsx`.

**Interfaces — Consumes:** `hero.hommages`, `hero.temoignages` (Task 5).

- [ ] **Step 1: Test** — ajouter à `src/sections/Hero.test.jsx` :

```jsx
test('annonce les hommages en haut à gauche et les témoignages en haut à droite', () => {
  renderWithRouter(<Hero />)
  const hommages = screen.getByRole('link', { name: 'HOMMAGES' })
  const temoignages = screen.getByRole('link', { name: 'TÉMOIGNAGES' })
  expect(hommages).toHaveAttribute('href', '/histoire#hommages')
  expect(temoignages).toHaveAttribute('href', '/histoire#temoignages')
  expect(hommages.closest('[data-coin]')).toHaveAttribute('data-coin', 'gauche')
  expect(temoignages.closest('[data-coin]')).toHaveAttribute('data-coin', 'droite')
})
```

- [ ] **Step 2: RED**, puis **implémenter** dans `src/sections/Hero.jsx` — constante après `OVER_PHOTO_STYLE` :

```js
// Liens Hommages / Témoignages : même famille que « Histoire et formation »,
// en plus discret. Posés dans le ciel, sous la barre de navigation.
const COIN_STYLE = {
  fontSize: 'clamp(0.7rem, 1.1vw, 1rem)',
  letterSpacing: '0.15em',
  textShadow: OVER_PHOTO_STYLE.textShadow,
}
```

et, juste avant le bloc « Pied de hero », tous formats :

```jsx
      {/* Hommages (haut gauche) et témoignages (haut droite), dans le ciel */}
      <div className="absolute inset-x-0 top-[84px] desktop:top-[96px] z-20 px-6 desktop:px-12 flex justify-between pointer-events-none">
        {[
          { coin: 'gauche', to: '/histoire#hommages', cle: 'hero.hommages' },
          { coin: 'droite', to: '/histoire#temoignages', cle: 'hero.temoignages' },
        ].map(({ coin, to, cle }) => (
          <motion.div key={coin} data-coin={coin} variants={fadeUp}>
            <Link
              to={to}
              className="font-poppins font-extrabold uppercase text-white pointer-events-auto
                         hover:text-cyan-accent underline-offset-8 decoration-1 hover:underline transition-colors"
              style={COIN_STYLE}
            >
              {textes[cle]}
            </Link>
          </motion.div>
        ))}
      </div>
```

- [ ] **Step 3: GREEN** + suite complète. **Step 4: Commit** — `feat(hero): liens Hommages et Témoignages dans les coins du ciel`.

---

### Task 7: Onglet d'administration des fiches

**Files:** Create `src/pages/admin/Fiches.jsx`, `src/pages/admin/FicheFormulaire.jsx`, `src/pages/admin/Fiches.test.jsx`.

**Interfaces:**
- Consumes: `reduireImage(fichier) → { blob, extension, type }` (`src/lib/image.js`), `CHAMP` (`./Champ`), table `fiches`, bucket `fiches`.
- Produces: `export default function Fiches({ client, type })` ; `export const MAX_IMAGES = 4` (dans `FicheFormulaire.jsx`) ; `export default function FicheFormulaire({ client, type, fiche, ordre, onFini, onAnnuler })` où `fiche` est `null` (nouvelle) ou une ligne de la table, `onFini(avertissement: string | null)`.

Appels Supabase (v2) : `client.from('fiches').select('id, type, nom, fonction, titre, texte, images, ordre, cree_le').eq('type', type).order('ordre').order('cree_le')` ; `.insert(ligne)` ; `.update(valeurs).eq('id', id)` ; `.delete().eq('id', id)` ; `client.storage.from('fiches').upload(chemin, blob, { contentType, upsert: false })` / `.remove([chemins])` / `.getPublicUrl(chemin).data.publicUrl`.

- [ ] **Step 1: Tests `src/pages/admin/Fiches.test.jsx`**

```jsx
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Fiches from './Fiches'

vi.mock('../../lib/image', () => ({
  reduireImage: vi.fn(async () => ({ blob: new Blob(['x'], { type: 'image/webp' }), extension: 'webp', type: 'image/webp' })),
}))

beforeAll(() => { URL.createObjectURL = vi.fn(() => 'blob:apercu'); URL.revokeObjectURL = vi.fn() })

/** Faux client : garde les lignes en mémoire et espionne les appels. */
function fauxClient(lignes = []) {
  let donnees = lignes.map(l => ({ fonction: '', titre: '', texte: '', images: [], ...l }))
  const espions = {
    upload: vi.fn(async () => ({ error: null })),
    remove: vi.fn(async () => ({ error: null })),
    insert: vi.fn(async (ligne) => { donnees.push({ id: `n${donnees.length}`, ...ligne }); return { error: null } }),
    update: vi.fn(),
    delete: vi.fn(),
  }
  const client = {
    from: () => ({
      select: () => ({
        eq: (_c, type) => ({
          order: () => ({
            order: async () => ({
              data: donnees.filter(d => d.type === type).sort((a, b) => a.ordre - b.ordre),
              error: null,
            }),
          }),
        }),
      }),
      insert: espions.insert,
      update: (valeurs) => ({ eq: async (_c, id) => {
        espions.update(id, valeurs)
        donnees = donnees.map(d => d.id === id ? { ...d, ...valeurs } : d)
        return { error: null }
      } }),
      delete: () => ({ eq: async (_c, id) => {
        espions.delete(id)
        donnees = donnees.filter(d => d.id !== id)
        return { error: null }
      } }),
    }),
    storage: { from: () => ({
      upload: espions.upload,
      remove: espions.remove,
      getPublicUrl: (chemin) => ({ data: { publicUrl: `https://cdn/${chemin}` } }),
    }) },
  }
  return { client, espions }
}

const h = (i, extra = {}) => ({ id: `h${i}`, type: 'hommage', nom: `Nom ${i}`, ordre: i, ...extra })

test('liste les fiches du type, dans l’ordre', async () => {
  const { client } = fauxClient([h(1), h(0), { ...h(9), type: 'temoignage' }])
  render(<Fiches client={client} type="hommage" />)
  const items = await screen.findAllByRole('listitem')
  expect(items.map(li => within(li).getByTestId('fiche-nom').textContent)).toEqual(['Nom 0', 'Nom 1'])
})

test('ajoute une fiche avec une image réduite et envoyée au bucket', async () => {
  const { client, espions } = fauxClient([h(0)])
  render(<Fiches client={client} type="hommage" />)
  await userEvent.click(await screen.findByRole('button', { name: /ajouter une fiche/i }))
  await userEvent.type(screen.getByLabelText(/^nom$/i), 'Fred FORTE')
  await userEvent.type(screen.getByLabelText(/fonction/i), 'SIG Strasbourg')
  await userEvent.type(screen.getByLabelText(/phrase mise en avant/i), 'Voilà mon Manu')
  await userEvent.type(screen.getByLabelText(/^texte$/i), 'Un.{Enter}{Enter}Deux.')
  await userEvent.upload(screen.getByLabelText(/ajouter une image/i), new File(['i'], 'a.jpg', { type: 'image/jpeg' }))
  await userEvent.type(screen.getByLabelText(/légende de l’image 1/i), 'Sous le maillot')
  await userEvent.click(screen.getByRole('button', { name: /enregistrer la fiche/i }))

  await waitFor(() => expect(espions.insert).toHaveBeenCalled())
  const [chemin, blob, options] = espions.upload.mock.calls[0]
  expect(chemin).toMatch(/^[0-9a-f-]{36}\.webp$/)
  expect(blob.type).toBe('image/webp')
  expect(options.contentType).toBe('image/webp')
  expect(espions.insert).toHaveBeenCalledWith({
    type: 'hommage', nom: 'Fred FORTE', fonction: 'SIG Strasbourg', titre: 'Voilà mon Manu',
    texte: 'Un.\n\nDeux.', images: [{ chemin, legende: 'Sous le maillot' }], ordre: 1,
  })
  expect(await screen.findAllByRole('listitem')).toHaveLength(2)
})

test('supprime les images envoyées si l’enregistrement échoue', async () => {
  const { client, espions } = fauxClient()
  espions.insert.mockResolvedValueOnce({ error: { message: 'refusé' } })
  render(<Fiches client={client} type="hommage" />)
  await userEvent.click(await screen.findByRole('button', { name: /ajouter une fiche/i }))
  await userEvent.type(screen.getByLabelText(/^nom$/i), 'X')
  await userEvent.upload(screen.getByLabelText(/ajouter une image/i), new File(['i'], 'a.jpg', { type: 'image/jpeg' }))
  await userEvent.click(screen.getByRole('button', { name: /enregistrer la fiche/i }))
  expect(await screen.findByRole('alert')).toHaveTextContent(/refusé/)
  expect(espions.remove).toHaveBeenCalledWith([espions.upload.mock.calls[0][0]])
})

test('modifie une fiche et efface du bucket l’image retirée, jamais une image du site', async () => {
  const { client, espions } = fauxClient([h(0, {
    images: [{ chemin: '/images/site.jpg', legende: 'site' }, { chemin: 'bucket.webp', legende: 'bucket' }],
  })])
  render(<Fiches client={client} type="hommage" />)
  await userEvent.click(await screen.findByRole('button', { name: /modifier/i }))
  expect(screen.getByLabelText(/^nom$/i)).toHaveValue('Nom 0')
  await userEvent.click(screen.getByRole('button', { name: /retirer l’image 2/i }))
  await userEvent.click(screen.getByRole('button', { name: /retirer l’image 1/i }))
  await userEvent.click(screen.getByRole('button', { name: /enregistrer la fiche/i }))
  await waitFor(() => expect(espions.update).toHaveBeenCalledWith('h0', expect.objectContaining({ images: [] })))
  expect(espions.remove).toHaveBeenCalledWith(['bucket.webp'])
  expect(espions.remove.mock.calls.flat(2)).not.toContain('/images/site.jpg')
})

test('limite à 4 images', async () => {
  const { client } = fauxClient()
  render(<Fiches client={client} type="temoignage" />)
  await userEvent.click(await screen.findByRole('button', { name: /ajouter une fiche/i }))
  for (let i = 0; i < 4; i++) {
    await userEvent.upload(screen.getByLabelText(/ajouter une image/i), new File(['i'], `${i}.jpg`, { type: 'image/jpeg' }))
  }
  expect(screen.queryByLabelText(/ajouter une image/i)).not.toBeInTheDocument()
})

test('monte une fiche d’un cran', async () => {
  const { client, espions } = fauxClient([h(0), h(1)])
  render(<Fiches client={client} type="hommage" />)
  const items = await screen.findAllByRole('listitem')
  await userEvent.click(within(items[1]).getByRole('button', { name: /monter/i }))
  await waitFor(() => expect(espions.update).toHaveBeenCalledWith('h1', { ordre: 0 }))
  expect(espions.update).toHaveBeenCalledWith('h0', { ordre: 1 })
  await waitFor(() =>
    expect(screen.getAllByTestId('fiche-nom').map(n => n.textContent)).toEqual(['Nom 1', 'Nom 0']))
  expect(within(screen.getAllByRole('listitem')[0]).getByRole('button', { name: /monter/i })).toBeDisabled()
})

test('supprime une fiche après confirmation, avec ses images du bucket', async () => {
  const { client, espions } = fauxClient([h(0, { images: [{ chemin: '/images/site.jpg' }, { chemin: 'b.webp' }] })])
  vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)
  render(<Fiches client={client} type="hommage" />)
  await userEvent.click(await screen.findByRole('button', { name: /supprimer/i }))
  expect(espions.delete).not.toHaveBeenCalled()
  await userEvent.click(screen.getByRole('button', { name: /supprimer/i }))
  await waitFor(() => expect(espions.delete).toHaveBeenCalledWith('h0'))
  expect(espions.remove).toHaveBeenCalledWith(['b.webp'])
  await waitFor(() => expect(screen.queryAllByRole('listitem')).toHaveLength(0))
})
```

- [ ] **Step 2: RED** — `npx vitest run src/pages/admin/Fiches.test.jsx`.

- [ ] **Step 3: Implémenter `src/pages/admin/FicheFormulaire.jsx`**

```jsx
import { useState } from 'react'
import { reduireImage } from '../../lib/image'
import { CHAMP } from './Champ'

export const MAX_IMAGES = 4

const BOUTON = 'px-6 py-2.5 rounded-full bg-green-accent text-white font-poppins font-bold text-sm ' +
               'hover:bg-teal-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer'

/** Une image du site (« /images/… ») n'est jamais effacée : seul le bucket l'est. */
export const dansLeBucket = (chemin) => !chemin.startsWith('/')

/**
 * Formulaire d'une fiche. Les nouvelles images ne sont envoyées qu'à
 * l'enregistrement ; si la ligne est refusée, elles sont retirées du bucket.
 * Les images retirées du bucket ne le sont qu'une fois la ligne enregistrée.
 */
export default function FicheFormulaire({ client, type, fiche, ordre, onFini, onAnnuler }) {
  const [nom, setNom] = useState(fiche?.nom ?? '')
  const [fonction, setFonction] = useState(fiche?.fonction ?? '')
  const [titre, setTitre] = useState(fiche?.titre ?? '')
  const [texte, setTexte] = useState(fiche?.texte ?? '')
  // { chemin, legende } pour une image existante ; { fichier, apercu, legende } pour une nouvelle.
  const [images, setImages] = useState(fiche?.images ?? [])
  const [cleChamp, setCleChamp] = useState(0)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState(null)
  const stockage = client.storage.from('fiches')

  const apercu = (img) => img.apercu
    ?? (dansLeBucket(img.chemin) ? stockage.getPublicUrl(img.chemin).data.publicUrl : img.chemin)

  function ajouter(fichier) {
    if (!fichier || images.length >= MAX_IMAGES) return
    setImages(liste => [...liste, { fichier, apercu: URL.createObjectURL(fichier), legende: '' }])
    setCleChamp(k => k + 1)
  }

  const majLegende = (i, legende) => setImages(liste => liste.map((img, j) => j === i ? { ...img, legende } : img))
  const retirer = (i) => setImages(liste => liste.filter((_, j) => j !== i))

  async function enregistrer(e) {
    e.preventDefault()
    if (!nom.trim()) return
    setEnvoi(true)
    setErreur(null)
    const envoyees = []
    try {
      const finales = []
      for (const img of images) {
        if (!img.fichier) { finales.push({ chemin: img.chemin, legende: img.legende.trim() }); continue }
        const { blob, extension, type: mime } = await reduireImage(img.fichier)
        const chemin = `${crypto.randomUUID()}.${extension}`
        const { error } = await stockage.upload(chemin, blob, { contentType: mime, upsert: false })
        if (error) throw new Error(`Envoi d’une image refusé : ${error.message}`)
        envoyees.push(chemin)
        finales.push({ chemin, legende: img.legende.trim() })
      }
      const ligne = { type, nom: nom.trim(), fonction: fonction.trim(), titre: titre.trim(), texte: texte.trim(), images: finales }
      const { error } = fiche
        ? await client.from('fiches').update(ligne).eq('id', fiche.id)
        : await client.from('fiches').insert({ ...ligne, ordre })
      if (error) throw new Error(`Enregistrement refusé : ${error.message}`)

      const gardes = new Set(finales.map(i => i.chemin))
      const retirees = (fiche?.images ?? []).map(i => i.chemin).filter(c => dansLeBucket(c) && !gardes.has(c))
      let avertissement = null
      if (retirees.length) {
        const { error: errRetrait } = await stockage.remove(retirees)
        if (errRetrait) avertissement = `Fiche enregistrée, mais une image retirée n’a pas pu être effacée : ${errRetrait.message}`
      }
      images.forEach(img => img.apercu && URL.revokeObjectURL(img.apercu))
      onFini(avertissement)
    } catch (err) {
      if (envoyees.length) await stockage.remove(envoyees)
      setErreur(err.message)
      setEnvoi(false)
    }
  }

  const champ = (id, libelle, valeur, maj, props = {}) => (
    <div>
      <label htmlFor={id} className="block font-inter text-text-primary text-sm font-medium mb-2">{libelle}</label>
      {props.multi
        ? <textarea id={id} rows={props.rows ?? 3} value={valeur} onChange={e => maj(e.target.value)}
                    className={CHAMP + ' resize-y leading-relaxed'} />
        : <input id={id} type="text" value={valeur} onChange={e => maj(e.target.value)}
                 required={props.required} className={CHAMP} />}
    </div>
  )

  return (
    <form onSubmit={enregistrer} noValidate className="bg-white rounded-2xl border border-black/10 p-6 mb-10 space-y-5">
      <h3 className="font-poppins font-bold text-text-primary text-base">
        {fiche ? `Modifier « ${fiche.nom} »` : 'Nouvelle fiche'}
      </h3>
      {champ('fiche-nom', 'Nom', nom, setNom, { required: true })}
      {champ('fiche-fonction', 'Fonction ou métier', fonction, setFonction)}
      {champ('fiche-titre', 'Phrase mise en avant', titre, setTitre, { multi: true, rows: 2 })}
      {champ('fiche-texte', 'Texte', texte, setTexte, { multi: true, rows: 8 })}
      <p className="font-inter text-xs text-text-secondary/70 -mt-3">Une ligne vide entre deux paragraphes.</p>

      <fieldset className="space-y-3">
        <legend className="font-inter text-text-primary text-sm font-medium mb-2">Images ({images.length}/{MAX_IMAGES})</legend>
        {images.map((img, i) => (
          <div key={img.chemin ?? img.apercu} className="flex gap-4 items-center">
            <img src={apercu(img)} alt="" className="w-20 h-20 object-cover rounded-lg bg-black/5 shrink-0" />
            <input type="text" value={img.legende} onChange={e => majLegende(i, e.target.value)}
                   aria-label={`Légende de l’image ${i + 1}`} placeholder="Légende (facultative)"
                   className={CHAMP + ' text-sm'} />
            <button type="button" onClick={() => retirer(i)} aria-label={`Retirer l’image ${i + 1}`}
                    className="font-inter text-sm text-red-600 hover:underline cursor-pointer shrink-0">
              Retirer
            </button>
          </div>
        ))}
        {images.length < MAX_IMAGES && (
          <div>
            <label htmlFor="fiche-image" className="block font-inter text-sm text-green-accent mb-1">Ajouter une image</label>
            <input key={cleChamp} id="fiche-image" type="file" accept="image/*"
                   onChange={e => ajouter(e.target.files?.[0])}
                   className="block font-inter text-sm text-text-secondary" />
          </div>
        )}
      </fieldset>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={!nom.trim() || envoi} className={BOUTON}>
          {envoi ? 'Enregistrement…' : 'Enregistrer la fiche'}
        </button>
        <button type="button" onClick={onAnnuler} disabled={envoi}
                className="font-inter text-sm text-text-secondary hover:underline cursor-pointer">
          Annuler
        </button>
        {erreur && <span role="alert" className="font-inter text-sm text-red-600">{erreur}</span>}
      </div>
    </form>
  )
}
```

- [ ] **Step 4: Implémenter `src/pages/admin/Fiches.jsx`**

```jsx
import { useCallback, useEffect, useState } from 'react'
import FicheFormulaire, { dansLeBucket } from './FicheFormulaire'

const LIBELLES = {
  hommage: { titre: 'Hommages', aide: 'Affichés sur la page Histoire, dans cet ordre.' },
  temoignage: { titre: 'Témoignages', aide: 'Affichés sur la page Histoire, dans cet ordre ; les 3 premiers aussi sur l’accueil.' },
}

const PETIT = 'font-inter text-sm hover:underline disabled:opacity-30 disabled:no-underline cursor-pointer'

/** Onglet d'administration d'un type de fiche : liste, ordre, édition, suppression. */
export default function Fiches({ client, type }) {
  const [fiches, setFiches] = useState(null)
  const [edition, setEdition] = useState(undefined)   // undefined : aucune ; null : nouvelle ; ligne : existante
  const [message, setMessage] = useState(null)

  const charger = useCallback(async () => {
    const { data, error } = await client.from('fiches')
      .select('id, type, nom, fonction, titre, texte, images, ordre, cree_le')
      .eq('type', type).order('ordre').order('cree_le')
    if (error) { setMessage({ type: 'erreur', texte: `Lecture impossible : ${error.message}` }); setFiches([]); return }
    setFiches(data ?? [])
  }, [client, type])

  useEffect(() => { setEdition(undefined); setMessage(null); charger() }, [charger])

  async function deplacer(i, pas) {
    const liste = [...fiches]
    ;[liste[i], liste[i + pas]] = [liste[i + pas], liste[i]]
    setFiches(liste)
    // Renumérote toute la liste : robuste même si deux fiches partagent un ordre.
    const reponses = await Promise.all(liste.map((f, k) =>
      f.ordre === k ? null : client.from('fiches').update({ ordre: k }).eq('id', f.id)))
    const echec = reponses.find(r => r?.error)
    if (echec) setMessage({ type: 'erreur', texte: `Ordre non enregistré : ${echec.error.message}` })
    charger()
  }

  async function supprimer(fiche) {
    if (!window.confirm(`Supprimer définitivement la fiche « ${fiche.nom} » ?`)) return
    setMessage(null)
    const { error } = await client.from('fiches').delete().eq('id', fiche.id)
    if (error) { setMessage({ type: 'erreur', texte: `Suppression refusée : ${error.message}` }); return }
    const chemins = (fiche.images ?? []).map(i => i.chemin).filter(dansLeBucket)
    if (chemins.length) {
      const { error: errFichiers } = await client.storage.from('fiches').remove(chemins)
      if (errFichiers) setMessage({ type: 'erreur', texte: `Fiche supprimée, mais ses images n’ont pas pu être effacées : ${errFichiers.message}` })
    }
    charger()
  }

  const { titre, aide } = LIBELLES[type]
  const vignette = (f) => {
    const c = f.images?.[0]?.chemin
    if (!c) return null
    return dansLeBucket(c) ? client.storage.from('fiches').getPublicUrl(c).data.publicUrl : c
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="font-poppins font-bold text-text-primary text-2xl">{titre}</h2>
        <p className="font-inter text-sm text-text-secondary mt-1">{aide}</p>
      </div>

      {message && (
        <p role="alert" className={`font-inter text-sm mb-6 ${message.type === 'erreur' ? 'text-red-600' : 'text-green-accent'}`}>
          {message.texte}
        </p>
      )}

      {edition !== undefined ? (
        <FicheFormulaire
          key={edition?.id ?? 'nouvelle'}
          client={client} type={type} fiche={edition}
          ordre={fiches?.length ? Math.max(...fiches.map(f => f.ordre)) + 1 : 0}
          onAnnuler={() => setEdition(undefined)}
          onFini={(avertissement) => {
            setEdition(undefined)
            setMessage(avertissement ? { type: 'erreur', texte: avertissement } : { type: 'succes', texte: 'Fiche enregistrée.' })
            charger()
          }}
        />
      ) : (
        <button type="button" onClick={() => { setMessage(null); setEdition(null) }}
                className="mb-8 px-6 py-2.5 rounded-full bg-green-accent text-white font-poppins font-bold text-sm hover:bg-teal-accent transition-colors cursor-pointer">
          Ajouter une fiche
        </button>
      )}

      {fiches === null
        ? <p className="font-inter text-text-secondary">Chargement…</p>
        : fiches.length === 0
          ? <p className="font-inter text-text-secondary">Aucune fiche pour l’instant.</p>
          : (
            <ul className="space-y-4">
              {fiches.map((f, i) => (
                <li key={f.id} className="flex gap-5 items-start bg-white rounded-2xl border border-black/10 p-4">
                  {vignette(f)
                    ? <img src={vignette(f)} alt="" className="w-20 h-20 object-cover rounded-lg bg-black/5 shrink-0" />
                    : <div className="w-20 h-20 rounded-lg bg-black/5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div data-testid="fiche-nom" className="font-poppins font-bold text-text-primary">{f.nom}</div>
                    <div className="font-inter text-sm text-text-secondary">{f.fonction}</div>
                    {f.titre && <p className="font-inter text-sm text-text-secondary/80 mt-2 line-clamp-2">« {f.titre} »</p>}
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <button type="button" onClick={() => deplacer(i, -1)} disabled={i === 0}
                              aria-label={`Monter « ${f.nom} »`} className={PETIT + ' text-text-secondary'}>↑ Monter</button>
                      <button type="button" onClick={() => deplacer(i, 1)} disabled={i === fiches.length - 1}
                              aria-label={`Descendre « ${f.nom} »`} className={PETIT + ' text-text-secondary'}>↓ Descendre</button>
                      <button type="button" onClick={() => { setMessage(null); setEdition(f) }}
                              className={PETIT + ' text-green-accent'}>Modifier</button>
                      <button type="button" onClick={() => supprimer(f)}
                              className={PETIT + ' text-red-600'}>Supprimer</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
    </>
  )
}
```

- [ ] **Step 5: GREEN** — `npx vitest run src/pages/admin/Fiches.test.jsx` (7 PASS), puis suite complète. Si un test échoue sur un libellé (`getByLabelText`), ajuster le **composant** pour que les libellés correspondent exactement aux tests, pas l'inverse.

- [ ] **Step 6: Commit** — `feat(admin): gestion des hommages et témoignages (ajout, images, ordre, suppression)`.

---

### Task 8: Onglets dans l'administration

**Files:** Modify `src/pages/Admin.jsx`, `supabase/README.md` (déjà fait en Task 1 — rien).

**Interfaces — Consumes:** `Fiches({ client, type })` (Task 7).

- [ ] **Step 1: Implémenter** dans `src/pages/Admin.jsx` :
   - import : `import Fiches from './admin/Fiches'` ;
   - sous `const ONGLET_ACTUALITES = ACTUALITES.id` :

```js
/** Onglets des fiches (hommages, témoignages), sous « Actualités ». */
const ONGLETS_FICHES = [
  { id: 'fiches-hommage', type: 'hommage', titre: 'Hommages' },
  { id: 'fiches-temoignage', type: 'temoignage', titre: 'Témoignages' },
]
```

   - dans le `<div className="mt-5 pt-5 border-t border-black/10">` du sommaire, après le bouton Actualités, ajouter pour chaque onglet de `ONGLETS_FICHES` un bouton de même style (`mt-1`), `onClick={() => { setPageActive(o.id); setFiltre('') }}`, libellé `{o.titre}` ;
   - sélecteur mobile : `{ONGLETS_FICHES.map(o => <option key={o.id} value={o.id}>{o.titre}</option>)}` après l'option Actualités ;
   - zone principale : avant la branche `pageActive === ONGLET_ACTUALITES`, insérer
     ``ONGLETS_FICHES.some(o => o.id === pageActive) && !filtre ? <Fiches client={client} type={ONGLETS_FICHES.find(o => o.id === pageActive).type} /> :`` (le ternaire existant commence par `filtre ? <Resultats…/>` : placer la nouvelle branche juste après) ;
   - barre d'enregistrement : la masquer aussi sur ces onglets quand aucun texte n'attend :
     `!((pageActive === ONGLET_ACTUALITES || ONGLETS_FICHES.some(o => o.id === pageActive)) && !modifiees.length)`.

- [ ] **Step 2:** `npx vitest run` + `npm run build` → vert.

- [ ] **Step 3: Commit** — `feat(admin): onglets Hommages et Témoignages`.

---

### Task 9 (contrôleur): Migration Supabase et vérification

1. Vérifier `select cle from site_content where cle ~ '^(hommage|temoignage|temoin)\.'` → vide attendu (sinon reprendre ces valeurs dans les lignes insérées).
2. Appliquer la section 6 de `schema.sql` (`apply_migration`, nom `fiches_hommages_temoignages`).
3. Générer les `insert` des 5 fiches depuis `FICHES_ORIGINE` (script node dans le scratchpad, valeurs échappées par `JSON.stringify` → `$json$…$json$`), sans `id` (laisser `gen_random_uuid()`), et les appliquer (`execute_sql`). Vérifier : 2 hommages, 3 témoignages, ordres 0..n.
4. `get_advisors security` : aucune alerte nouvelle sur `fiches`.
5. Contrôle anonyme : lecture 200, insertion refusée (RLS).
6. Chrome : hero desktop 1440 / mobile 375 (liens visibles, lisibles, sans chevauchement avec la nav ni l'arbre), page Histoire (`/histoire#hommages`, `#temoignages`), accueil, onglets admin (session simulée).
