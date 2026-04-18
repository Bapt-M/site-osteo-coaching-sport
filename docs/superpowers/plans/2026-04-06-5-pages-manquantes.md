# 5 Pages Manquantes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer les 5 pages manquantes du site (Histoire, Bilan Ostéopathique, Suivi Sportif, Intervention Entreprise, Projet Sportif) avec leurs routes, contenus tirés du drive, et photos traitées.

**Architecture:** Chaque page est un composant React dans `src/pages/`, stylé avec Tailwind + Framer Motion, branché dans le router `App.jsx`. Les liens du hero et de la navbar pointent vers ces routes. Les photos sont converties (HEIC→JPG) et upscalées dans `public/images/`.

**Tech Stack:** React 18, react-router-dom, Framer Motion, Tailwind CSS, Vite, Vitest + React Testing Library, Python 3 + Pillow (upscaling photos)

---

## Fichiers créés / modifiés

| Fichier | Action | Rôle |
|---------|--------|------|
| `src/App.jsx` | Modifier | Ajouter 5 routes |
| `src/components/Navbar.jsx` | Modifier | Ajouter liens vers les 5 pages |
| `src/sections/Hero.jsx` | Modifier | Changer href des feuilles → routes |
| `src/pages/Histoire.jsx` | Créer | Page histoire & formation |
| `src/pages/BilanOsteopathique.jsx` | Créer | Page bilan et traitement |
| `src/pages/SuiviSportif.jsx` | Créer | Page suivi sportif haut niveau |
| `src/pages/InterventionEntreprise.jsx` | Créer | Page intervention entreprise |
| `src/pages/ProjetSportif.jsx` | Créer | Page projet sportif personnalisé |
| `src/pages/Histoire.test.jsx` | Créer | Tests page Histoire |
| `src/pages/BilanOsteopathique.test.jsx` | Créer | Tests page Bilan |
| `src/pages/SuiviSportif.test.jsx` | Créer | Tests page Suivi Sportif |
| `src/pages/InterventionEntreprise.test.jsx` | Créer | Tests page Intervention |
| `src/pages/ProjetSportif.test.jsx` | Créer | Tests page Projet Sportif |
| `public/images/` | Modifier | Ajouter photos traitées |

---

## Task 1 : Traitement des photos

**Files:**
- Script Python : `scripts/process-photos.py`
- Output : `public/images/` (noms descriptifs)

**Photos source → destination :**

| Source (dans `OSTÉO ET COACHING DU SPORT/PHOTOS/`) | Dest `public/images/` | Usage |
|---|---|---|
| `010326 (11).HEIC` | `cabinet-1.jpg` | Bilan / Hero histoire |
| `010326 (12).HEIC` | `cabinet-2.jpg` | Bilan |
| `010326 (14).HEIC` | `cabinet-3.jpg` | Bilan |
| `010326 (15).HEIC` | `cabinet-4.jpg` | Bilan |
| `010326 (28).HEIC` | `cabinet-5.jpg` | Bilan |
| `010326 (29).HEIC` | `cabinet-6.jpg` | Bilan |
| `010326 (10).HEIC` | `terrain-1.jpg` | Intervention / Projet |
| `010326 (4).HEIC` | `terrain-2.jpg` | Intervention |
| `010326 (6).HEIC` | `terrain-3.jpg` | Intervention |
| `070226 (22).HEIC` | `action-1.jpg` | Suivi sportif |
| `070226 (23).HEIC` | `action-2.jpg` | Suivi sportif |
| `Juilien Motz.JPG` | `julien-motz.jpg` | Projet sportif |
| `Julien MOTZ 2.jpg` | `julien-motz-2.jpg` | Projet sportif |
| `Yannis.jpg` | `yannis-musser.jpg` | Projet sportif |
| `Alexis.jpg` | `alexis-koessler.jpg` | Projet sportif |
| `Nissim Manu.jpg` | `nissim-manu.jpg` | Histoire |
| `INSEP.jpg` | `insep.jpg` | Histoire / Suivi sportif |
| `U21 VITTEL.jpg` | `equipe-france-u21.jpg` | Histoire |
| `Vestiaire SIG.jpg` | `sig-vestiaire.jpg` | Histoire |
| `Malaga.jpg` | `malaga.jpg` | Histoire |
| `Temps mort.jpg` | `temps-mort-sig.jpg` | Suivi sportif |
| `Fred FORTE.jpg` | `fred-forte.jpg` | Suivi sportif |
| `Jennings.jpg` | `keith-jennings.jpg` | Suivi sportif |

- [ ] **Step 1 : Créer le script de traitement**

```python
# scripts/process-photos.py
import os, subprocess, sys
from pathlib import Path

# pip install Pillow si nécessaire
try:
    from PIL import Image
except ImportError:
    subprocess.run([sys.executable, '-m', 'pip', 'install', 'Pillow'], check=True)
    from PIL import Image

PHOTOS_DIR = Path("OSTÉO ET COACHING DU SPORT/PHOTOS")
OUTPUT_DIR = Path("public/images")
TARGET_W = 1920  # largeur cible

MAPPING = [
    ("010326 (11).HEIC", "cabinet-1.jpg"),
    ("010326 (12).HEIC", "cabinet-2.jpg"),
    ("010326 (14).HEIC", "cabinet-3.jpg"),
    ("010326 (15).HEIC", "cabinet-4.jpg"),
    ("010326 (28).HEIC", "cabinet-5.jpg"),
    ("010326 (29).HEIC", "cabinet-6.jpg"),
    ("010326 (10).HEIC", "terrain-1.jpg"),
    ("010326 (4).HEIC",  "terrain-2.jpg"),
    ("010326 (6).HEIC",  "terrain-3.jpg"),
    ("070226 (22).HEIC", "action-1.jpg"),
    ("070226 (23).HEIC", "action-2.jpg"),
    ("Juilien Motz.JPG", "julien-motz.jpg"),
    ("Julien MOTZ 2.jpg","julien-motz-2.jpg"),
    ("Yannis.jpg",       "yannis-musser.jpg"),
    ("Alexis.jpg",       "alexis-koessler.jpg"),
    ("Nissim Manu.jpg",  "nissim-manu.jpg"),
    ("INSEP.jpg",        "insep.jpg"),
    ("U21 VITTEL.jpg",   "equipe-france-u21.jpg"),
    ("Vestiaire SIG.jpg","sig-vestiaire.jpg"),
    ("Malaga.jpg",       "malaga.jpg"),
    ("Temps mort.jpg",   "temps-mort-sig.jpg"),
    ("Fred FORTE.jpg",   "fred-forte.jpg"),
    ("Jennings.jpg",     "keith-jennings.jpg"),
]

def convert_heic_to_jpg(src: Path, dst: Path):
    """Utilise sips (macOS natif) pour convertir HEIC → JPEG."""
    tmp = dst.with_suffix('.tmp.jpg')
    subprocess.run(['sips', '-s', 'format', 'jpeg', str(src), '--out', str(tmp)], check=True, capture_output=True)
    return tmp

def process(src_name: str, dst_name: str):
    src = PHOTOS_DIR / src_name
    dst = OUTPUT_DIR / dst_name
    if not src.exists():
        print(f"  SKIP (not found): {src_name}")
        return
    print(f"  Processing: {src_name} → {dst_name}")
    # Conversion HEIC si besoin
    if src.suffix.upper() == '.HEIC':
        tmp = convert_heic_to_jpg(src, dst)
        img = Image.open(tmp)
        tmp.unlink()
    else:
        img = Image.open(src)
    # Upscale ou downscale à TARGET_W
    w, h = img.size
    if w != TARGET_W:
        new_h = int(h * TARGET_W / w)
        img = img.resize((TARGET_W, new_h), Image.LANCZOS)
    img.convert('RGB').save(dst, 'JPEG', quality=88, optimize=True)
    print(f"    → {dst} ({img.width}x{img.height})")

if __name__ == '__main__':
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for src_name, dst_name in MAPPING:
        process(src_name, dst_name)
    print("Done.")
```

- [ ] **Step 2 : Lancer le script depuis la racine du projet**

```bash
python3 scripts/process-photos.py
```

Expected : chaque photo affiche `→ public/images/<nom>.jpg (1920xN)` sans erreur.

- [ ] **Step 3 : Vérifier les fichiers créés**

```bash
ls -lh public/images/*.jpg | grep -v "OSTEO-pic"
```

Expected : 23 nouveaux fichiers `.jpg` entre 200KB et 1.5MB chacun.

---

## Task 2 : Routing et Navbar

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/Navbar.jsx`
- Modify: `src/sections/Hero.jsx`

- [ ] **Step 1 : Mettre à jour `src/App.jsx`**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Histoire from './pages/Histoire'
import BilanOsteopathique from './pages/BilanOsteopathique'
import SuiviSportif from './pages/SuiviSportif'
import InterventionEntreprise from './pages/InterventionEntreprise'
import ProjetSportif from './pages/ProjetSportif'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/histoire" element={<Histoire />} />
        <Route path="/bilan-osteopathique" element={<BilanOsteopathique />} />
        <Route path="/suivi-sportif" element={<SuiviSportif />} />
        <Route path="/intervention-entreprise" element={<InterventionEntreprise />} />
        <Route path="/projet-sportif" element={<ProjetSportif />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
```

- [ ] **Step 2 : Mettre à jour les liens de la Navbar**

Dans `src/components/Navbar.jsx`, remplacer la constante `navLinks` :

```jsx
const navLinks = [
  { label: 'Histoire', href: '/histoire' },
  { label: 'Bilan Ostéopathique', href: '/bilan-osteopathique' },
  { label: 'Suivi Sportif', href: '/suivi-sportif' },
  { label: 'Intervention Entreprise', href: '/intervention-entreprise' },
  { label: 'Projet Sportif', href: '/projet-sportif' },
]
```

Et dans `NavLink`, changer `<motion.a href={href}>` en `<Link to={href}>` avec l'import :

```jsx
import { Link } from 'react-router-dom'
// ...
function NavLink({ href, children, scrollY }) {
  const color = useTransform(scrollY, [0, 80], ['#ffffff', '#1a2a1c'])
  return (
    <motion.div className="relative group" style={{ color }} whileHover="hover">
      <Link
        to={href}
        className="text-sm font-inter font-medium"
        style={{ color: 'inherit', textDecoration: 'none' }}
      >
        {children}
      </Link>
      <motion.span
        className="absolute -bottom-0.5 left-0 h-px bg-green-accent"
        variants={{ hover: { width: '100%' }, initial: { width: 0 } }}
        initial="initial"
        style={{ width: 0 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  )
}
```

Dans le menu mobile, remplacer les `<motion.a href=...>` par `<Link to=...>` aussi.

- [ ] **Step 3 : Mettre à jour les href des feuilles dans `src/sections/Hero.jsx`**

Remplacer la constante `LEAVES` :

```jsx
const LEAVES = [
  { key: 'top',          label: 'SUIVI SPORTIF\nDE HAUT NIVEAU',     pos: 'top-[13%] left-1/2 -translate-x-1/2', href: '/suivi-sportif' },
  { key: 'left',         label: 'INTERVENTION\nEN ENTREPRISE',        pos: 'top-[27%] left-[27%]',                href: '/intervention-entreprise' },
  { key: 'right',        label: 'PERSONAL\nSHOPPER',                  pos: 'top-[27%] right-[27%]',               href: '#' },
  { key: 'bottom-left',  label: 'BILAN ET TRAITEMENT\nOSTÉOPATHIQUE', pos: 'top-[44%] left-[24%]',               href: '/bilan-osteopathique' },
  { key: 'bottom-right', label: 'PROJET SPORTIF\nPERSONNALISÉ',       pos: 'top-[44%] right-[24%]',              href: '/projet-sportif' },
]
```

Et dans le rendu de chaque feuille, passer `leaf.href` :

```jsx
{LEAVES.map((leaf, i) => (
  <div key={leaf.key} className={`absolute z-10 text-center ${leaf.pos}`}>
    <motion.div variants={{ ... }}>
      <a
        href={leaf.href}
        className="inline-block font-syne font-extrabold uppercase text-white hover:text-[#ffab00] transition-colors"
        style={leafStyle}
      >
        {leaf.label}
      </a>
    </motion.div>
  </div>
))}
```

Et le lien "HISTOIRE ET FORMATION" (racine) :

```jsx
<a href="/histoire" ...>HISTOIRE ET FORMATION</a>
```

- [ ] **Step 4 : Vérifier que le dev server tourne sans erreur**

```bash
npm run dev
```

Expected : pas d'erreur de compilation dans le terminal. Naviguer vers `/histoire` retourne une page blanche (composant pas encore créé) sans crash.

- [ ] **Step 5 : Commit**

```bash
git add src/App.jsx src/components/Navbar.jsx src/sections/Hero.jsx
git commit -m "feat: routing 5 pages + navbar + liens hero"
```

---

## Task 3 : Page Histoire et Formation

**Files:**
- Create: `src/pages/Histoire.jsx`
- Create: `src/pages/Histoire.test.jsx`

Contenu source : `Origine et présentation.pdf` (biographie Emmanuel Krieger)

- [ ] **Step 1 : Écrire le test**

```jsx
// src/pages/Histoire.test.jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Histoire from './Histoire'

function Wrapper({ children }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

test('affiche le titre principal', () => {
  render(<Histoire />, { wrapper: Wrapper })
  expect(screen.getByRole('heading', { name: /histoire/i })).toBeInTheDocument()
})

test('affiche la section origines', () => {
  render(<Histoire />, { wrapper: Wrapper })
  expect(screen.getByText(/kleinfrankenheim/i)).toBeInTheDocument()
})

test('affiche la section parcours professionnel', () => {
  render(<Histoire />, { wrapper: Wrapper })
  expect(screen.getByText(/sig/i)).toBeInTheDocument()
})

test('affiche la section diplômes', () => {
  render(<Histoire />, { wrapper: Wrapper })
  expect(screen.getByText(/diplômes/i)).toBeInTheDocument()
})
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**

```bash
npx vitest run src/pages/Histoire.test.jsx
```

Expected : FAIL — "Cannot find module './Histoire'"

- [ ] **Step 3 : Créer `src/pages/Histoire.jsx`**

```jsx
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const TIMELINE = [
  {
    period: 'Enfance & Équitation',
    years: '–1990',
    text: 'Grandi à Kleinfrankenheim, capitale de l\'élevage équin en Alsace. Dès 7 ans, chaque soir à l\'écurie. Licence Gentleman Rider — monte en compétition aux côtés des jockeys professionnels.',
    img: null,
  },
  {
    period: 'Kiné → Ostéopathie',
    years: '1990–2000',
    text: 'Diplôme de kinésithérapeute, puis 6 ans de formation en ostéopathie à l\'AT Still Academy et à l\'Osteopathic Research Institute — dans un contexte où l\'ostéopathie n\'est pas encore reconnue officiellement. Spécialisation ostéopathie du sport à l\'UFR STAPS Montpellier.',
    img: null,
  },
  {
    period: 'SIG Basket & Équipe de France',
    years: '2000–2005',
    text: 'Rejoint la SIG Strasbourg nouvellement promue en Pro A. Intègre le staff médical de l\'Équipe de France U21 — génération Tony Parker, Boris Diaw, Ronny Turiaf, Mickaël Gelabale, sous la direction de Richard Billant.',
    img: '/images/equipe-france-u21.jpg',
  },
  {
    period: 'Cabinet & Club Med',
    years: '2005–2024',
    text: 'Ouverture du cabinet en 2005 à Oberhausbergen, exclusivement tourné vers les sportifs. Accompagnement de Mehdi Baala, Driss El Himer, Mélanie Skotnik, Mathieu Lorentz, joueurs du Racing Club de Strasbourg. Intersaisons comme G.O. au Club Med.',
    img: '/images/malaga.jpg',
  },
  {
    period: 'Padel & Aujourd\'hui',
    years: '2025–',
    text: 'Découverte du padel au Club Med Opio. Pratique quotidienne pour en maîtriser toutes les exigences. Accompagnement de Julien Motz (42ème français) et Yanis Muesser (15ème français).',
    img: '/images/julien-motz.jpg',
  },
]

const DIPLOMES = [
  'Diplôme de Kinésithérapeute',
  'Diplôme d\'Ostéopathie D.O. — AT Still Academy & Osteopathic Research Institute',
  'Certificat Ostéopathe du Sport — UFR STAPS Montpellier (2007)',
  'Formation Ostéopathie Équine — IFOREC & Michel Garcia',
]

export default function Histoire() {
  return (
    <main className="bg-site-bg">
      {/* Hero section */}
      <section className="relative min-h-[55vh] flex items-end pb-20 overflow-hidden bg-green-deep">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(/images/insep.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-deep/40 via-green-deep/60 to-green-deep" />
        <div className="relative z-10 max-w-[1360px] mx-auto px-6 md:px-12 pt-32">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-syne font-bold text-xs tracking-widest mb-6">
              HISTOIRE & FORMATION
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-syne font-black text-white text-5xl md:text-7xl leading-none mb-6" aria-label="histoire">
              Un parcours<br /><span className="text-green-accent">atypique</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="font-inter text-white/70 text-xl max-w-xl leading-relaxed">
              De l'écurie alsacienne aux parquets de Pro A — le chemin d'un praticien formé par la passion du sport et du soin.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-6 max-w-[1360px] mx-auto">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-20"
        >
          {TIMELINE.map((item, i) => (
            <motion.div
              key={item.period}
              variants={fadeUp}
              className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'md:[direction:rtl]' : ''}`}
            >
              <div className={i % 2 === 1 ? 'md:[direction:ltr]' : ''}>
                <div className="text-green-accent font-syne font-bold text-xs tracking-widest mb-2">{item.years}</div>
                <h2 className="font-syne font-bold text-text-primary text-3xl md:text-4xl mb-4">{item.period}</h2>
                <p className="font-inter text-text-secondary text-lg leading-relaxed">{item.text}</p>
              </div>
              {item.img ? (
                <div className={`rounded-2xl overflow-hidden aspect-[16/10] ${i % 2 === 1 ? 'md:[direction:ltr]' : ''}`}>
                  <img src={item.img} alt={item.period} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className={`rounded-2xl aspect-[16/10] bg-green-deep/5 flex items-center justify-center ${i % 2 === 1 ? 'md:[direction:ltr]' : ''}`}>
                  <span className="font-syne font-bold text-green-deep/20 text-6xl">{item.years}</span>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Diplômes */}
      <section className="py-20 px-6 bg-green-deep">
        <div className="max-w-[1360px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-syne font-bold text-xs tracking-widest mb-8">
              DIPLÔMES
            </div>
            <h2 className="font-syne font-bold text-white text-4xl mb-12">Formations & certifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DIPLOMES.map(d => (
                <div key={d} className="flex items-start gap-4 border border-white/10 rounded-xl p-6">
                  <span className="text-green-accent mt-1 shrink-0">✓</span>
                  <span className="font-inter text-white/80 text-base">{d}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Photos SIG / INSEP */}
      <section className="py-24 px-6 max-w-[1360px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-deep font-syne font-bold text-xs tracking-widest mb-4">
            GALERIE
          </div>
          <h2 className="font-syne font-bold text-text-primary text-4xl">Moments marquants</h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { src: '/images/sig-vestiaire.jpg', alt: 'Vestiaire SIG Basket' },
            { src: '/images/equipe-france-u21.jpg', alt: 'Équipe de France U21 — Vittel' },
            { src: '/images/insep.jpg', alt: 'INSEP' },
            { src: '/images/malaga.jpg', alt: 'Malaga' },
            { src: '/images/nissim-manu.jpg', alt: 'Avec Nissim' },
            { src: '/images/temps-mort-sig.jpg', alt: 'Temps mort SIG' },
          ].map(({ src, alt }) => (
            <motion.div
              key={src}
              className="rounded-xl overflow-hidden aspect-[4/3]"
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <img src={src} alt={alt} className="w-full h-full object-cover" onError={e => { e.target.parentElement.style.display = 'none' }} />
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  )
}
```

- [ ] **Step 4 : Lancer les tests**

```bash
npx vitest run src/pages/Histoire.test.jsx
```

Expected : 4 tests PASS

- [ ] **Step 5 : Commit**

```bash
git add src/pages/Histoire.jsx src/pages/Histoire.test.jsx
git commit -m "feat: page Histoire et Formation"
```

---

## Task 4 : Page Bilan et Traitement Ostéopathique

**Files:**
- Create: `src/pages/BilanOsteopathique.jsx`
- Create: `src/pages/BilanOsteopathique.test.jsx`

Contenu source : `Textes par thème site.pdf` → section "Bilan et suivi ostéopathique en cabinet"

- [ ] **Step 1 : Écrire le test**

```jsx
// src/pages/BilanOsteopathique.test.jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BilanOsteopathique from './BilanOsteopathique'

function Wrapper({ children }) { return <MemoryRouter>{children}</MemoryRouter> }

test('affiche le titre principal', () => {
  render(<BilanOsteopathique />, { wrapper: Wrapper })
  expect(screen.getByRole('heading', { name: /bilan/i })).toBeInTheDocument()
})

test('affiche la section premier rendez-vous', () => {
  render(<BilanOsteopathique />, { wrapper: Wrapper })
  expect(screen.getByText(/premier rendez-vous/i)).toBeInTheDocument()
})

test('affiche le CTA de prise de rendez-vous', () => {
  render(<BilanOsteopathique />, { wrapper: Wrapper })
  expect(screen.getByRole('link', { name: /rendez-vous/i })).toBeInTheDocument()
})
```

- [ ] **Step 2 : Lancer le test (vérifier qu'il échoue)**

```bash
npx vitest run src/pages/BilanOsteopathique.test.jsx
```

Expected : FAIL — "Cannot find module"

- [ ] **Step 3 : Créer `src/pages/BilanOsteopathique.jsx`**

```jsx
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const STEPS = [
  {
    num: '01',
    title: 'Premier rendez-vous',
    body: 'La première séance est consacrée à une ostéopathie complète et à l\'évaluation de vos besoins réels. Bilan complet de votre état, de vos antécédents sportifs et de vos objectifs.',
  },
  {
    num: '02',
    title: 'Calendrier personnalisé',
    body: 'À l\'issue du bilan, un calendrier de suivi personnalisé est proposé — adapté à votre rythme, votre discipline et vos objectifs. Fréquence et durée définies ensemble.',
  },
  {
    num: '03',
    title: 'Forfait annuel',
    body: 'Possibilité de mettre en place un forfait annuel selon les objectifs et la fréquence nécessaire. Une solution pour un suivi continu, optimisé et économique.',
  },
]

const GALERIE = [
  { src: '/images/cabinet-1.jpg', alt: 'Cabinet ostéopathique' },
  { src: '/images/cabinet-2.jpg', alt: 'Séance ostéopathique' },
  { src: '/images/cabinet-3.jpg', alt: 'Traitement manuel' },
  { src: '/images/cabinet-4.jpg', alt: 'Consultation' },
  { src: '/images/cabinet-5.jpg', alt: 'Cabinet — vue 2' },
  { src: '/images/cabinet-6.jpg', alt: 'Suivi patient' },
]

export default function BilanOsteopathique() {
  return (
    <main className="bg-site-bg">
      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-end pb-20 overflow-hidden bg-green-deep">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: 'url(/images/cabinet-1.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-deep/40 via-green-deep/60 to-green-deep" />
        <div className="relative z-10 max-w-[1360px] mx-auto px-6 md:px-12 pt-32">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={fadeUp} className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-syne font-bold text-xs tracking-widest mb-6">
              OSTÉOPATHIE
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-syne font-black text-white text-5xl md:text-7xl leading-none mb-6" aria-label="bilan">
              Bilan &<br /><span className="text-green-accent">Traitement</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="font-inter text-white/70 text-xl max-w-xl leading-relaxed">
              Une approche globale et individualisée du soin ostéopathique — en cabinet, adaptée à chaque patient.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* 3 étapes */}
      <section className="py-24 px-6">
        <div className="max-w-[1360px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-16"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-deep font-syne font-bold text-xs tracking-widest mb-4">
              DÉROULEMENT
            </div>
            <h2 className="font-syne font-bold text-text-primary text-4xl md:text-5xl">Comment ça fonctionne</h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {STEPS.map(step => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                className="border border-text-primary/10 rounded-2xl p-8 hover:border-green-accent/40 transition-colors"
              >
                <div className="font-syne font-black text-5xl text-green-accent/20 mb-4 leading-none">{step.num}</div>
                <h3 className="font-syne font-bold text-text-primary text-xl mb-3">{step.title}</h3>
                <p className="font-inter text-text-secondary leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Galerie cabinet */}
      <section className="py-12 px-6 bg-green-deep/5">
        <div className="max-w-[1360px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {GALERIE.map(({ src, alt }) => (
              <motion.div
                key={src}
                className="rounded-xl overflow-hidden aspect-[4/3]"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                <img src={src} alt={alt} className="w-full h-full object-cover" onError={e => { e.target.parentElement.style.display = 'none' }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-green-deep">
        <div className="max-w-[1360px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-syne font-bold text-white text-4xl mb-6">Prendre rendez-vous</h2>
            <p className="font-inter text-white/60 text-lg mb-10 max-w-lg mx-auto">
              Le premier rendez-vous est une séance ostéopathique complète. Aucun bilan préalable nécessaire.
            </p>
            <motion.a
              href="/#contact"
              className="inline-block px-10 py-4 rounded-full bg-green-accent text-green-deep font-syne font-bold text-base"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              aria-label="Prendre rendez-vous"
            >
              Prendre rendez-vous →
            </motion.a>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
```

- [ ] **Step 4 : Lancer les tests**

```bash
npx vitest run src/pages/BilanOsteopathique.test.jsx
```

Expected : 3 tests PASS

- [ ] **Step 5 : Commit**

```bash
git add src/pages/BilanOsteopathique.jsx src/pages/BilanOsteopathique.test.jsx
git commit -m "feat: page Bilan et Traitement Ostéopathique"
```

---

## Task 5 : Page Suivi Sportif de Haut Niveau

**Files:**
- Create: `src/pages/SuiviSportif.jsx`
- Create: `src/pages/SuiviSportif.test.jsx`

Contenu source : `Textes par thème site.pdf` → section "Suivi ostéopathique des sportifs de haut niveau"

- [ ] **Step 1 : Écrire le test**

```jsx
// src/pages/SuiviSportif.test.jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SuiviSportif from './SuiviSportif'

function Wrapper({ children }) { return <MemoryRouter>{children}</MemoryRouter> }

test('affiche le titre principal', () => {
  render(<SuiviSportif />, { wrapper: Wrapper })
  expect(screen.getByRole('heading', { name: /suivi/i })).toBeInTheDocument()
})

test('affiche la liste des modalités de suivi', () => {
  render(<SuiviSportif />, { wrapper: Wrapper })
  expect(screen.getByText(/suivi régulier/i)).toBeInTheDocument()
})

test('affiche la section athlètes', () => {
  render(<SuiviSportif />, { wrapper: Wrapper })
  expect(screen.getByText(/sig/i)).toBeInTheDocument()
})
```

- [ ] **Step 2 : Lancer le test (vérifier qu'il échoue)**

```bash
npx vitest run src/pages/SuiviSportif.test.jsx
```

Expected : FAIL — "Cannot find module"

- [ ] **Step 3 : Créer `src/pages/SuiviSportif.jsx`**

```jsx
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const MODALITES = [
  { icon: '📅', title: 'Suivi régulier en cabinet', desc: 'Séances récurrentes planifiées selon la saison sportive, les compétitions et les périodes de récupération.' },
  { icon: '📡', title: 'Suivi à distance', desc: 'Accompagnement par visio ou téléphone entre les séances. Conseils, ajustements et échanges sans déplacement.' },
  { icon: '🏆', title: 'Accompagnement en compétition', desc: 'Présence terrain lors des compétitions majeures — avant, pendant et après les épreuves pour optimiser la récupération.' },
  { icon: '🏋️', title: 'Périodes de préparation', desc: 'Interventions intensifiées lors des stages et préparations spécifiques pour prévenir les blessures et maintenir la performance.' },
]

const REFERENCES = [
  { nom: 'SIG Basket Strasbourg', detail: 'Plusieurs saisons en Pro A — ostéopathe attitré du club', img: '/images/sig-vestiaire.jpg' },
  { nom: 'Équipe de France U21', detail: 'Staff médical — génération Parker, Diaw, Turiaf, Gelabale', img: '/images/equipe-france-u21.jpg' },
  { nom: 'INSEP', detail: 'Accompagnement d\'athlètes en préparation nationale', img: '/images/insep.jpg' },
  { nom: 'Keith Jennings', detail: 'Joueur NBA et SIG Basket', img: '/images/keith-jennings.jpg' },
]

export default function SuiviSportif() {
  return (
    <main className="bg-site-bg">
      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-end pb-20 overflow-hidden bg-green-deep">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(/images/action-1.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-deep/40 via-green-deep/60 to-green-deep" />
        <div className="relative z-10 max-w-[1360px] mx-auto px-6 md:px-12 pt-32">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={fadeUp} className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-syne font-bold text-xs tracking-widest mb-6">
              HAUT NIVEAU
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-syne font-black text-white text-5xl md:text-7xl leading-none mb-6" aria-label="suivi sportif">
              Suivi sportif<br /><span className="text-green-accent">de haut niveau</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="font-inter text-white/70 text-xl max-w-xl leading-relaxed">
              L'ensemble des outils ostéopathiques disponibles au service de la performance, la récupération et la longévité sportive.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Modalités */}
      <section className="py-24 px-6">
        <div className="max-w-[1360px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-16"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-deep font-syne font-bold text-xs tracking-widest mb-4">
              MODALITÉS
            </div>
            <h2 className="font-syne font-bold text-text-primary text-4xl md:text-5xl">Un suivi adapté<br />à votre saison</h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {MODALITES.map(m => (
              <motion.div
                key={m.title}
                variants={fadeUp}
                className="flex gap-6 border border-text-primary/10 rounded-2xl p-8 hover:border-green-accent/40 transition-colors"
              >
                <span className="text-3xl shrink-0">{m.icon}</span>
                <div>
                  <h3 className="font-syne font-bold text-text-primary text-xl mb-2">{m.title}</h3>
                  <p className="font-inter text-text-secondary leading-relaxed">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Références */}
      <section className="py-24 px-6 bg-green-deep">
        <div className="max-w-[1360px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-16"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-syne font-bold text-xs tracking-widest mb-4">
              RÉFÉRENCES
            </div>
            <h2 className="font-syne font-bold text-white text-4xl">
              Clubs & athlètes accompagnés — <span className="text-green-accent">SIG</span>
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {REFERENCES.map(ref => (
              <motion.div
                key={ref.nom}
                variants={fadeUp}
                className="relative rounded-2xl overflow-hidden aspect-[16/9]"
              >
                <img src={ref.img} alt={ref.nom} className="w-full h-full object-cover" onError={e => { e.target.style.opacity = 0.1 }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="font-syne font-bold text-white text-xl">{ref.nom}</div>
                  <div className="font-inter text-white/60 text-sm mt-1">{ref.detail}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  )
}
```

- [ ] **Step 4 : Lancer les tests**

```bash
npx vitest run src/pages/SuiviSportif.test.jsx
```

Expected : 3 tests PASS

- [ ] **Step 5 : Commit**

```bash
git add src/pages/SuiviSportif.jsx src/pages/SuiviSportif.test.jsx
git commit -m "feat: page Suivi Sportif de Haut Niveau"
```

---

## Task 6 : Page Intervention en Entreprise

**Files:**
- Create: `src/pages/InterventionEntreprise.jsx`
- Create: `src/pages/InterventionEntreprise.test.jsx`

Contenu source : `Textes par thème site.pdf` → section "Intervention en entreprise"

- [ ] **Step 1 : Écrire le test**

```jsx
// src/pages/InterventionEntreprise.test.jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import InterventionEntreprise from './InterventionEntreprise'

function Wrapper({ children }) { return <MemoryRouter>{children}</MemoryRouter> }

test('affiche le titre principal', () => {
  render(<InterventionEntreprise />, { wrapper: Wrapper })
  expect(screen.getByRole('heading', { name: /intervention/i })).toBeInTheDocument()
})

test('affiche la section bien-être au travail', () => {
  render(<InterventionEntreprise />, { wrapper: Wrapper })
  expect(screen.getByText(/bien-être/i)).toBeInTheDocument()
})

test('affiche la section Club Med', () => {
  render(<InterventionEntreprise />, { wrapper: Wrapper })
  expect(screen.getByText(/club med/i)).toBeInTheDocument()
})
```

- [ ] **Step 2 : Lancer le test (vérifier qu'il échoue)**

```bash
npx vitest run src/pages/InterventionEntreprise.test.jsx
```

Expected : FAIL — "Cannot find module"

- [ ] **Step 3 : Créer `src/pages/InterventionEntreprise.jsx`**

```jsx
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const FORMATS = [
  {
    title: 'Bien-être au travail',
    tags: ['QVT', 'Prévention TMS', 'Journées santé'],
    desc: 'Interventions sur site pour des séances d\'ostéopathie individuelles ou collectives. Prévention des troubles musculo-squelettiques, amélioration des conditions de travail.',
    img: '/images/terrain-1.jpg',
  },
  {
    title: 'Événementiels',
    tags: ['Co-working', 'Team building', 'Conférences'],
    desc: 'Présence lors de vos événements d\'entreprise — journées santé, espaces bien-être, moments de cohésion. Un service distinctif pour vos collaborateurs.',
    img: '/images/terrain-2.jpg',
  },
  {
    title: 'Club Med',
    tags: ['Villages Club Med', 'Sur disponibilités'],
    desc: 'Interventions et accompagnements au sein de différents villages Club Med. Format à définir lors d\'un entretien préalable selon le village et les dates.',
    img: '/images/malaga.jpg',
  },
]

export default function InterventionEntreprise() {
  return (
    <main className="bg-site-bg">
      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-end pb-20 overflow-hidden bg-green-deep">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(/images/terrain-1.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-deep/40 via-green-deep/60 to-green-deep" />
        <div className="relative z-10 max-w-[1360px] mx-auto px-6 md:px-12 pt-32">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={fadeUp} className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-syne font-bold text-xs tracking-widest mb-6">
              ENTREPRISE
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-syne font-black text-white text-5xl md:text-7xl leading-none mb-6" aria-label="intervention en entreprise">
              Intervention<br /><span className="text-green-accent">en entreprise</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="font-inter text-white/70 text-xl max-w-xl leading-relaxed">
              Ostéopathie directement sur site — pour le bien-être de vos équipes, la prévention des TMS et des événements santé mémorables.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* 3 formats */}
      <section className="py-24 px-6">
        <div className="max-w-[1360px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-16"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-deep font-syne font-bold text-xs tracking-widest mb-4">
              FORMATS
            </div>
            <h2 className="font-syne font-bold text-text-primary text-4xl md:text-5xl">Trois façons d\'intervenir</h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-8"
          >
            {FORMATS.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {f.tags.map(t => (
                      <span key={t} className="px-3 py-1 rounded-full text-xs font-syne font-bold bg-green-accent/10 text-green-deep">{t}</span>
                    ))}
                  </div>
                  <h3 className="font-syne font-bold text-text-primary text-2xl md:text-3xl mb-4">{f.title}</h3>
                  <p className="font-inter text-text-secondary text-lg leading-relaxed">{f.desc}</p>
                </div>
                <div className={`rounded-2xl overflow-hidden aspect-[16/9] ${i % 2 === 1 ? 'md:order-1' : ''}`}>
                  <img src={f.img} alt={f.title} className="w-full h-full object-cover" onError={e => { e.target.parentElement.style.background = '#0a2e0e22' }} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA contact */}
      <section className="py-24 px-6 bg-green-deep">
        <div className="max-w-[1360px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-syne font-bold text-white text-4xl mb-4">Un projet en entreprise ?</h2>
            <p className="font-inter text-white/60 text-lg mb-10 max-w-lg mx-auto">
              Les modalités sont définies lors d\'un entretien préalable, selon vos besoins et votre contexte.
            </p>
            <motion.a
              href="/#contact"
              className="inline-block px-10 py-4 rounded-full bg-green-accent text-green-deep font-syne font-bold text-base"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Nous contacter →
            </motion.a>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
```

- [ ] **Step 4 : Lancer les tests**

```bash
npx vitest run src/pages/InterventionEntreprise.test.jsx
```

Expected : 3 tests PASS

- [ ] **Step 5 : Commit**

```bash
git add src/pages/InterventionEntreprise.jsx src/pages/InterventionEntreprise.test.jsx
git commit -m "feat: page Intervention en Entreprise"
```

---

## Task 7 : Page Projet Sportif Personnalisé

**Files:**
- Create: `src/pages/ProjetSportif.jsx`
- Create: `src/pages/ProjetSportif.test.jsx`

Contenu source : `Textes par thème site.pdf` → section "Projet sportif personnalisé"

- [ ] **Step 1 : Écrire le test**

```jsx
// src/pages/ProjetSportif.test.jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProjetSportif from './ProjetSportif'

function Wrapper({ children }) { return <MemoryRouter>{children}</MemoryRouter> }

test('affiche le titre principal', () => {
  render(<ProjetSportif />, { wrapper: Wrapper })
  expect(screen.getByRole('heading', { name: /projet/i })).toBeInTheDocument()
})

test('affiche la prise en charge globale', () => {
  render(<ProjetSportif />, { wrapper: Wrapper })
  expect(screen.getByText(/préparation physique/i)).toBeInTheDocument()
})

test('affiche les athlètes de référence', () => {
  render(<ProjetSportif />, { wrapper: Wrapper })
  expect(screen.getByText(/julien motz/i)).toBeInTheDocument()
})
```

- [ ] **Step 2 : Lancer le test (vérifier qu'il échoue)**

```bash
npx vitest run src/pages/ProjetSportif.test.jsx
```

Expected : FAIL — "Cannot find module"

- [ ] **Step 3 : Créer `src/pages/ProjetSportif.jsx`**

```jsx
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const COMPOSANTES = [
  { label: 'Préparation physique', desc: 'Renforcement, endurance, mobilité — adaptés à votre discipline.' },
  { label: 'Préparation mentale', desc: 'Gestion du stress, concentration, confiance en compétition.' },
  { label: 'Suivi ostéopathique', desc: 'Prévention des blessures, récupération optimisée, longévité.' },
  { label: 'Réseau de spécialistes', desc: 'Coordination avec podologue, médecins du sport, nutritionniste.' },
  { label: 'Logistique compétition', desc: 'Déplacements, hébergement, accompagnement terrain en compétition.' },
  { label: 'Participation à des épreuves', desc: 'Jusqu\'à la compétition finale, aux côtés d\'athlètes de haut niveau.' },
]

const ATHLETES = [
  { nom: 'Julien Motz', detail: '42ème français en padel', img: '/images/julien-motz.jpg' },
  { nom: 'Yanis Muesser', detail: '15ème français en padel', img: '/images/yannis-musser.jpg' },
  { nom: 'Driss El Himer', detail: 'Demi-fondiste — champion de France', img: null },
  { nom: 'Samir Baala', detail: 'Champion du monde du 1500m', img: null },
  { nom: 'Alexis Koessler', detail: 'Figure du sport alsacien', img: '/images/alexis-koessler.jpg' },
  { nom: 'Mathieu Lorentz', detail: 'Athlète de haut niveau', img: null },
]

export default function ProjetSportif() {
  return (
    <main className="bg-site-bg">
      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-end pb-20 overflow-hidden bg-green-deep">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(/images/julien-motz.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-deep/40 via-green-deep/60 to-green-deep" />
        <div className="relative z-10 max-w-[1360px] mx-auto px-6 md:px-12 pt-32">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={fadeUp} className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-syne font-bold text-xs tracking-widest mb-6">
              SUR MESURE
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-syne font-black text-white text-5xl md:text-7xl leading-none mb-6" aria-label="projet sportif personnalisé">
              Projet sportif<br /><span className="text-green-accent">personnalisé</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="font-inter text-white/70 text-xl max-w-xl leading-relaxed">
              Vous avez un objectif sportif ? Après un bilan complet, nous définissons ensemble un projet cohérent, réaliste et totalement individualisé.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Citation */}
      <section className="py-16 px-6 bg-green-deep/5">
        <div className="max-w-[900px] mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="font-syne font-bold text-text-primary text-2xl md:text-3xl italic leading-relaxed"
          >
            "Ne dit-on pas que qui peut le plus peut le moins…"
          </motion.p>
        </div>
      </section>

      {/* 6 composantes */}
      <section className="py-24 px-6">
        <div className="max-w-[1360px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-16"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-deep font-syne font-bold text-xs tracking-widest mb-4">
              PRISE EN CHARGE
            </div>
            <h2 className="font-syne font-bold text-text-primary text-4xl md:text-5xl">
              Une approche<br />globale et individualisée
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {COMPOSANTES.map((c, i) => (
              <motion.div
                key={c.label}
                variants={fadeUp}
                className="border border-text-primary/10 rounded-2xl p-8 hover:border-green-accent/40 transition-colors"
              >
                <div className="font-syne font-black text-4xl text-green-accent/15 mb-3 leading-none">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="font-syne font-bold text-text-primary text-xl mb-2">{c.label}</h3>
                <p className="font-inter text-text-secondary leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Athlètes accompagnés */}
      <section className="py-24 px-6 bg-green-deep">
        <div className="max-w-[1360px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-16"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-syne font-bold text-xs tracking-widest mb-4">
              ATHLÈTES
            </div>
            <h2 className="font-syne font-bold text-white text-4xl">
              Julien Motz, Samir Baala,<br /><span className="text-green-accent">et bien d'autres…</span>
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {ATHLETES.map(a => (
              <motion.div
                key={a.nom}
                variants={fadeUp}
                className="relative rounded-2xl overflow-hidden aspect-[3/4]"
              >
                {a.img ? (
                  <img src={a.img} alt={a.nom} className="w-full h-full object-cover" onError={e => { e.target.style.opacity = 0 }} />
                ) : (
                  <div className="w-full h-full bg-white/5" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="font-syne font-bold text-white text-base">{a.nom}</div>
                  <div className="font-inter text-white/50 text-sm mt-0.5">{a.detail}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 text-center"
          >
            <p className="font-inter text-white/40 text-sm">
              Les tarifs sont variables, définis en fonction du niveau d'accompagnement demandé et adaptés individuellement à chaque projet.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-[1360px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-syne font-bold text-text-primary text-4xl mb-4">Vous avez un projet ?</h2>
            <p className="font-inter text-text-secondary text-lg mb-10 max-w-lg mx-auto">
              Tout commence par un bilan ostéopathique complet et un rendez-vous de définition d'objectifs.
            </p>
            <motion.a
              href="/#contact"
              className="inline-block px-10 py-4 rounded-full bg-green-deep text-white font-syne font-bold text-base hover:bg-green-accent hover:text-green-deep transition-colors"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Discutons de votre projet →
            </motion.a>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
```

- [ ] **Step 4 : Lancer les tests**

```bash
npx vitest run src/pages/ProjetSportif.test.jsx
```

Expected : 3 tests PASS

- [ ] **Step 5 : Commit**

```bash
git add src/pages/ProjetSportif.jsx src/pages/ProjetSportif.test.jsx
git commit -m "feat: page Projet Sportif Personnalisé"
```

---

## Task 8 : Vérification finale et build

- [ ] **Step 1 : Lancer tous les tests**

```bash
npx vitest run
```

Expected : tous les tests PASS (aucun FAIL)

- [ ] **Step 2 : Build de production**

```bash
npm run build
```

Expected : `dist/` généré sans erreur. Aucun warning critique.

- [ ] **Step 3 : Vérification visuelle (dev server)**

```bash
npm run dev
```

Naviguer et vérifier :
- `http://localhost:5173/histoire` → page visible avec hero + timeline + diplômes
- `http://localhost:5173/bilan-osteopathique` → page avec 3 étapes + galerie + CTA
- `http://localhost:5173/suivi-sportif` → page avec modalités + références
- `http://localhost:5173/intervention-entreprise` → page avec 3 formats + CTA
- `http://localhost:5173/projet-sportif` → page avec composantes + athlètes + CTA
- Navbar : liens pointent vers les bonnes routes
- Hero home : feuilles pointent vers les routes (sauf Personal Shopper → `#`)

- [ ] **Step 4 : Commit final**

```bash
git add -A
git commit -m "feat: 5 pages complètes + photos traitées — site livrable"
```
