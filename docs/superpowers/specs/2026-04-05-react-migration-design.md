# Design Spec — Migration React + Framer Motion + Tailwind

**Date :** 2026-04-05  
**Projet :** Site Ostéo et Coaching du Sport — Emmanuel Krieger  
**Statut :** Approuvé

---

## Contexte

Le site actuel est un one-pager en vanilla HTML/CSS/JS. L'objectif est de migrer vers React pour pouvoir utiliser Framer Motion (animations avancées) et Tailwind CSS (upgrade visuel), tout en posant une infrastructure multi-pages pour les futures sections du site.

---

## Stack technique

| Outil | Version | Rôle |
|---|---|---|
| Vite | latest | Bundler + dev server |
| React | 18 | UI framework |
| React Router | v6 | Routing multi-pages |
| Framer Motion | v11 | Animations |
| Tailwind CSS | v3 | Styling utilitaire |

Déploiement : Vercel ou Netlify (build statique `dist/`).  
Langage : JavaScript (pas TypeScript).

---

## Architecture des fichiers

```
/
├── public/
│   ├── videos/          ← hero-final.mp4 (inchangé)
│   └── images/          ← tous les assets (inchangés)
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── Home.jsx     ← one-pager actuelle (toutes les sections)
│   │   └── [futures pages]
│   ├── sections/        ← sous-composants de Home
│   │   ├── Hero.jsx
│   │   ├── SliderActions.jsx
│   │   ├── About.jsx
│   │   ├── Services.jsx
│   │   ├── Testimonials.jsx
│   │   └── Contact.jsx
│   ├── App.jsx          ← <Router> + <Routes>
│   ├── main.jsx
│   └── index.css        ← directives Tailwind + variables CSS globales
├── index.html
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

**Règle :** `components/` = éléments partagés entre pages (Navbar, Footer). `sections/` = blocs propres à la Home.

---

## Animations Framer Motion

### Navbar
- `useScroll` détecte le scroll ; `useMotionValue` + `useTransform` pilotent le glassmorphism (background, backdrop-blur, border-color).
- Pas de classe `.scrolled` togglée en JS — tout est déclaratif via motion values.

### Hero
- Entrée en stagger : logo → feuilles (5, délai croissant) → texte identité → racines.
- Parallax souris : `useMotionValue` pour x/y + `useSpring` pour l'inertie. Appliqué au logo et aux feuilles avec des amplitudes différentes.
- Disposition identique à l'actuelle : vidéo bg, logo centré, 5 feuilles positionnées, identité en bas.

### SliderActions
- `useScroll({ target: trackRef })` + `useTransform` remplacent l'`IntersectionObserver` et le listener scroll manuel.
- Transitions entre slides : `AnimatePresence` + fade/slide du contenu texte.
- Fonds (backgrounds) : opacity animée via motion values.

### About & Contact
- `motion.div` avec `whileInView` + `initial={{ opacity: 0, x: ±60 }}` → slide-in gauche/droite.
- `viewport={{ once: true, margin: "-80px" }}` pour déclencher une seule fois.

### Services
- Items en stagger : `variants` avec `staggerChildren: 0.1`.
- Accordion open/close : `AnimatePresence` + `motion.div` avec `height: "auto"` → `height: 0`.

### Testimonials
- Cards : stagger `whileInView` (fade + translateY).
- `whileHover={{ y: -6, boxShadow: "..." }}` pour le lift effect.
- Border gradient animée via CSS custom property + Framer Motion.

### Micro-interactions globales
- Tous les boutons/CTAs : `whileHover={{ scale: 1.03 }}` + `whileTap={{ scale: 0.97 }}`.
- Nav links : pseudo-élément underline animé via `motion.span` en absolute.
- Shimmer effect sur les CTA principaux : `@keyframes` CSS animé, déclenché au hover.

---

## Upgrade visuel

### Typographie
- Titres : **Syne** (Google Fonts, weights 600–800)
- Corps : **Inter** (Google Fonts, weights 400–500)
- Import via `<link>` dans `index.html`

### Palette Tailwind
```js
// tailwind.config.js — couleurs custom
colors: {
  green: {
    deep: '#0a2e0e',
    DEFAULT: '#00ff87',
    teal: '#00bfa5',
  },
  bg: '#fafafa',
  'footer-bg': '#0d1a0e',
}
```

### Glassmorphism
- `backdrop-blur-xl` (renforcé vs actuel)
- `bg-white/80` + `border border-white/60`
- Ombre : `shadow-[0_8px_32px_rgba(0,0,0,0.10)]`

### Éléments visuels spécifiques
- Hero overlay : gradient `from-black/60 via-black/20 to-transparent` (plus dramatique)
- Feuilles hero : micro-animation hover (scale + glow vert)
- Boutons CTA principaux : gradient animé `from-green-DEFAULT to-green-teal` + shimmer
- Accordion services : numéros en grand (96px, opacity 0.08 en fond), ligne séparatrice animée
- Cards témoignages : border gradient vert/teal, glassmorphism prononcé

### Ce qui ne change pas
- Disposition hero (vidéo bg, logo centré, 5 feuilles, identité en bas)
- Structure et ordre des sections
- Contenu textuel (français)
- Assets (vidéo, images, logo PNG)

---

## Règles de migration

1. Les assets publics (`videos/`, `images/`, logo PNG) sont copiés dans `public/` sans modification.
2. Le CSS existant (`style.css`) est supprimé — tout passe en Tailwind + Framer Motion.
3. Les classes `.reveal`, `.reveal-left`, `.reveal-right` sont supprimées — remplacées par `whileInView`.
4. L'`IntersectionObserver` de `main.js` est supprimé.
5. Le slider scroll-driven est réécrit avec `useScroll`/`useTransform`.

---

## Futur (hors scope de cette migration)

- Pages additionnelles (à designer séparément)
- Formulaire de contact fonctionnel
- SEO (react-helmet ou Vite plugin)
- Analytics
