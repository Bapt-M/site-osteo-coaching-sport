# React Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrer le site vanilla HTML/CSS/JS vers Vite + React 18 + Framer Motion v11 + Tailwind CSS v3 avec React Router v6 pour le multi-pages.

**Architecture:** Un composant par section dans `src/sections/`, les éléments partagés (Navbar, Footer) dans `src/components/`, les pages dans `src/pages/`. `App.jsx` orchestre le routing. Framer Motion remplace tous les effets JS manuels (scroll reveal, parallax, slider).

**Tech Stack:** Vite 5, React 18, React Router v6, Framer Motion v11, Tailwind CSS v3, Vitest + React Testing Library

---

## File Map

| Fichier | Action | Responsabilité |
|---|---|---|
| `package.json` | Créer | Dépendances du projet |
| `vite.config.js` | Créer | Config Vite + Vitest |
| `index.html` | Créer | Point d'entrée, Google Fonts |
| `tailwind.config.js` | Créer | Tokens design (couleurs, typo) |
| `postcss.config.js` | Créer | PostCSS pour Tailwind |
| `src/index.css` | Créer | Directives Tailwind + variables globales |
| `src/test-setup.js` | Créer | Setup jest-dom pour Vitest |
| `src/__mocks__/framer-motion.jsx` | Créer | Mock Framer Motion pour les tests |
| `src/main.jsx` | Créer | Point d'entrée React |
| `src/App.jsx` | Créer | Router + Routes |
| `src/pages/Home.jsx` | Créer | Page principale (assemble les sections) |
| `src/components/Navbar.jsx` | Créer | Navbar fixe avec glassmorphism au scroll |
| `src/components/Footer.jsx` | Créer | Footer avec liens |
| `src/sections/Hero.jsx` | Créer | Hero vidéo + logo + feuilles + parallax |
| `src/sections/SliderActions.jsx` | Créer | Slider scroll-driven (4 slides) |
| `src/sections/About.jsx` | Créer | Section à propos slide-in |
| `src/sections/Services.jsx` | Créer | Accordion services avec stagger |
| `src/sections/Testimonials.jsx` | Créer | Cards témoignages avec hover |
| `src/sections/Contact.jsx` | Créer | Contact + horaires |
| `public/videos/` | Copier | hero-final.mp4 |
| `public/images/` | Copier | Tous les assets images |
| `public/logo.png` | Copier | Logo blanc PNG |

---

## Task 1: Scaffold Vite + React + dépendances

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `tailwind.config.js`, `postcss.config.js`, `src/index.css`, `src/test-setup.js`

- [ ] **Step 1: Initialiser le projet dans le dossier courant**

```bash
cd "/Users/baptistemoog/Documents/Site Manu"
npm create vite@latest . -- --template react --force
```

Répondre `y` si demandé pour écraser les fichiers existants.

- [ ] **Step 2: Installer toutes les dépendances**

```bash
npm install framer-motion react-router-dom
npm install -D tailwindcss@3 postcss autoprefixer
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npx tailwindcss init -p
```

- [ ] **Step 3: Configurer vite.config.js**

```js
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.js',
  },
})
```

- [ ] **Step 4: Créer src/test-setup.js**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Créer src/__mocks__/framer-motion.jsx**

Ce mock remplace Framer Motion dans tous les tests (jsdom ne supporte pas les animations).

```jsx
import React from 'react'

const tags = ['div','section','nav','header','footer','span','p','h1','h2','h3','h4','ul','li','a','button','img','video']

export const motion = Object.fromEntries(
  tags.map(tag => [tag, React.forwardRef(({ children, ...props }, ref) => {
    // Filtrer les props FM non-standards pour éviter les warnings DOM
    const { initial, animate, exit, whileInView, whileHover, whileTap, variants,
            transition, viewport, layout, layoutId, onAnimationComplete, ...rest } = props
    return React.createElement(tag, { ...rest, ref }, children)
  })])
)

export const AnimatePresence = ({ children }) => <>{children}</>
export const useScroll = () => ({ scrollY: { get: () => 0 }, scrollYProgress: { get: () => 0 } })
export const useTransform = (_, __, output) => Array.isArray(output) ? output[0] : 0
export const useMotionValue = (v) => ({ get: () => v, set: () => {}, onChange: () => () => {} })
export const useSpring = (v) => v
export const useInView = () => [null, false]
export const useAnimation = () => ({ start: () => {}, set: () => {} })
```

- [ ] **Step 6: Configurer tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'green-deep': '#0a2e0e',
        'green-accent': '#00ff87',
        'teal-accent': '#00bfa5',
        'cyan-accent': '#00b0ff',
        'site-bg': '#fafafa',
        'text-primary': '#1a2a1c',
        'text-secondary': '#4a6350',
        'footer-bg': '#0d1a0e',
      },
      fontFamily: {
        Syne: ['Syne', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        xl: '20px',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 7: Créer src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { scroll-behavior: smooth; }
  body {
    @apply font-inter bg-site-bg text-text-primary overflow-x-hidden;
  }
  a { @apply no-underline; }
}

@layer utilities {
  .glass {
    @apply bg-white/80 backdrop-blur-xl border border-white/60;
    box-shadow: 0 8px 32px rgba(0,0,0,0.10);
  }
  .gradient-text {
    @apply bg-clip-text text-transparent;
    background-image: linear-gradient(135deg, #00ff87, #00bfa5);
  }
}
```

- [ ] **Step 8: Créer index.html**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ostéo et Coaching du Sport — Emmanuel Krieger</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

- [ ] **Step 9: Créer src/main.jsx**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 10: Créer src/App.jsx (skeleton)**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
```

- [ ] **Step 11: Créer src/pages/Home.jsx (skeleton)**

```jsx
export default function Home() {
  return <main>Home</main>
}
```

- [ ] **Step 12: Créer src/components/Navbar.jsx et Footer.jsx (skeletons)**

```jsx
// src/components/Navbar.jsx
export default function Navbar() { return <nav>Nav</nav> }
```

```jsx
// src/components/Footer.jsx
export default function Footer() { return <footer>Footer</footer> }
```

- [ ] **Step 13: Vérifier que le dev server démarre**

```bash
npm run dev
```

Ouvrir `http://localhost:5173`. Doit afficher "Home" sans erreur console.

- [ ] **Step 14: Vérifier que Vitest fonctionne**

Créer `src/App.test.jsx` temporaire :
```jsx
import { render } from '@testing-library/react'
import App from './App'

test('App renders without crash', () => {
  render(<App />)
})
```

```bash
npm run test -- --run
```

Doit passer en vert. Supprimer `src/App.test.jsx` après.

- [ ] **Step 15: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + Tailwind + Framer Motion"
```

---

## Task 2: Copier les assets dans public/

**Files:**
- Copy: `videos/hero-final.mp4` → `public/videos/hero-final.mp4`
- Copy: `images/*` → `public/images/`
- Copy: `AVANT - OSTEO ET COACHING DU SPORT - LOGOTYPE SITE BLANC - 2025.png` → `public/logo.png`

- [ ] **Step 1: Créer les dossiers et copier**

```bash
mkdir -p public/videos public/images
cp "videos/hero-final.mp4" public/videos/
cp images/* public/images/ 2>/dev/null || true
cp "AVANT - OSTEO ET COACHING DU SPORT - LOGOTYPE SITE BLANC - 2025.png" public/logo.png
```

- [ ] **Step 2: Vérifier**

```bash
ls public/videos/ && ls public/images/
```

Doit lister `hero-final.mp4` et les images.

- [ ] **Step 3: Commit**

```bash
git add public/
git commit -m "feat: copy assets to public/"
```

---

## Task 3: Navbar component

**Files:**
- Create: `src/components/Navbar.jsx`
- Create: `src/components/Navbar.test.jsx`

Le Navbar est fixe, transparent au sommet, glassmorphism au scroll. Menu mobile avec AnimatePresence.

- [ ] **Step 1: Écrire le test**

```jsx
// src/components/Navbar.test.jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from './Navbar'

test('rend les liens de navigation', () => {
  render(<MemoryRouter><Navbar /></MemoryRouter>)
  expect(screen.getByText('Témoignages')).toBeInTheDocument()
  expect(screen.getByText('Prendre rendez-vous')).toBeInTheDocument()
})

test('rend le bouton menu mobile', () => {
  render(<MemoryRouter><Navbar /></MemoryRouter>)
  expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument()
})
```

- [ ] **Step 2: Vérifier que le test échoue**

```bash
npm run test -- --run Navbar
```

Attendu : FAIL "Cannot find module './Navbar'"

- [ ] **Step 3: Implémenter Navbar.jsx**

```jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'

const navLinks = [
  { label: 'Hommages', href: '#hommages' },
  { label: 'Partenaires', href: '#partenaires' },
  { label: 'Témoignages', href: '#testimonials' },
  { label: 'Presse', href: '#presse' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { scrollY } = useScroll()

  const bgOpacity = useTransform(scrollY, [0, 80], [0, 0.96])
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 0.08])
  const shadowOpacity = useTransform(scrollY, [0, 80], [0, 0.1])

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
        style={{
          backgroundColor: `rgba(255,255,255,${bgOpacity})`,
          borderBottom: `1px solid rgba(0,0,0,${borderOpacity})`,
          boxShadow: `0 2px 24px rgba(0,0,0,${shadowOpacity})`,
        }}
      >
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 h-[72px] flex items-center justify-between">
          {/* Logo texte */}
          <motion.div
            className="font-syne font-bold text-xs leading-tight tracking-wide text-white"
            style={{ color: useTransform(scrollY, [0, 80], ['#ffffff', '#1a2a1c']) }}
          >
            OSTÉO<br /><span className="font-normal">ET COACHING</span><br />DU SPORT
          </motion.div>

          {/* Liens desktop */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <NavLink key={link.label} href={link.href} scrollY={scrollY}>
                {link.label}
              </NavLink>
            ))}
            <motion.a
              href="#contact"
              className="px-5 py-2 rounded-full text-sm font-semibold font-inter bg-green-accent text-green-deep hover:bg-teal-accent transition-colors"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Prendre rendez-vous
            </motion.a>
          </div>

          {/* Burger mobile */}
          <motion.button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            whileTap={{ scale: 0.9 }}
          >
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="block w-6 h-0.5 bg-current"
                animate={menuOpen
                  ? i === 0 ? { rotate: 45, y: 8 }
                  : i === 1 ? { opacity: 0 }
                  : { rotate: -45, y: -8 }
                  : { rotate: 0, y: 0, opacity: 1 }
                }
                transition={{ duration: 0.2 }}
              />
            ))}
          </motion.button>
        </div>
      </motion.nav>

      {/* Menu mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-green-deep flex flex-col items-center justify-center gap-8 md:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                className="text-white font-syne font-bold text-3xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </motion.a>
            ))}
            <motion.a
              href="#contact"
              className="mt-4 px-8 py-3 rounded-full bg-green-accent text-green-deep font-syne font-bold text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => setMenuOpen(false)}
            >
              Prendre rendez-vous
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function NavLink({ href, children, scrollY }) {
  const color = useTransform(scrollY, [0, 80], ['#ffffff', '#1a2a1c'])
  return (
    <motion.a
      href={href}
      className="relative text-sm font-inter font-medium group"
      style={{ color }}
      whileHover="hover"
    >
      {children}
      <motion.span
        className="absolute -bottom-0.5 left-0 h-px bg-green-accent"
        variants={{ hover: { width: '100%' }, initial: { width: 0 } }}
        initial="initial"
        style={{ width: 0 }}
        transition={{ duration: 0.2 }}
      />
    </motion.a>
  )
}
```

- [ ] **Step 4: Lancer les tests**

```bash
npm run test -- --run Navbar
```

Attendu : 2 tests PASS

- [ ] **Step 5: Vérifier visuellement**

```bash
npm run dev
```

Ouvrir `http://localhost:5173`. La navbar doit être visible (skeleton Home). Vérifier : transparente en haut, glassmorphism au scroll.

- [ ] **Step 6: Commit**

```bash
git add src/components/Navbar.jsx src/components/Navbar.test.jsx
git commit -m "feat: Navbar avec glassmorphism scroll + menu mobile animé"
```

---

## Task 4: Footer component

**Files:**
- Create: `src/components/Footer.jsx`
- Create: `src/components/Footer.test.jsx`

- [ ] **Step 1: Écrire le test**

```jsx
// src/components/Footer.test.jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Footer from './Footer'

test('rend la marque et les liens légaux', () => {
  render(<MemoryRouter><Footer /></MemoryRouter>)
  expect(screen.getByText(/OSTÉO/i)).toBeInTheDocument()
  expect(screen.getByText(/Mentions légales/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Vérifier que le test échoue**

```bash
npm run test -- --run Footer
```

Attendu : FAIL

- [ ] **Step 3: Implémenter Footer.jsx**

```jsx
import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <motion.footer
      className="bg-footer-bg text-white py-16 px-6"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="max-w-[1360px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div>
          <div className="font-syne font-bold text-lg leading-tight mb-4">
            OSTÉO<br /><span className="font-normal text-green-accent">ET COACHING</span><br />DU SPORT
          </div>
          <p className="text-white/50 text-sm font-inter">
            34 Rue de Strasbourg<br />67280 Furdenheim
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="font-syne font-bold text-sm tracking-widest text-white/40 uppercase">Navigation</h4>
          {['À Propos', 'Services', 'Témoignages', 'Contact'].map(label => (
            <a key={label} href={`#${label.toLowerCase()}`} className="text-white/70 hover:text-green-accent transition-colors text-sm font-inter">
              {label}
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="font-syne font-bold text-sm tracking-widest text-white/40 uppercase">Formations</h4>
          <a href="#" className="text-white/70 hover:text-green-accent transition-colors text-sm font-inter">Histoire et Formations</a>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="font-syne font-bold text-sm tracking-widest text-white/40 uppercase">Légal</h4>
          {['Mentions légales', 'Cookies', 'Plan du site'].map(label => (
            <a key={label} href="#" className="text-white/70 hover:text-green-accent transition-colors text-sm font-inter">
              {label}
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto mt-12 pt-6 border-t border-white/10 flex justify-between items-center">
        <p className="text-white/30 text-xs font-inter">© {new Date().getFullYear()} Emmanuel Krieger. Tous droits réservés.</p>
      </div>
    </motion.footer>
  )
}
```

- [ ] **Step 4: Lancer les tests**

```bash
npm run test -- --run Footer
```

Attendu : PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Footer.jsx src/components/Footer.test.jsx
git commit -m "feat: Footer"
```

---

## Task 5: Section Hero

**Files:**
- Create: `src/sections/Hero.jsx`
- Create: `src/sections/Hero.test.jsx`

Le Hero est la section la plus complexe : vidéo background, logo centré, 5 feuilles positionnées, texte identité en bas, parallax souris.

- [ ] **Step 1: Écrire le test**

```jsx
// src/sections/Hero.test.jsx
import { render, screen } from '@testing-library/react'
import Hero from './Hero'

test('rend le logo', () => {
  render(<Hero />)
  expect(screen.getByAltText(/Ostéo et Coaching/i)).toBeInTheDocument()
})

test('rend la phrase signature', () => {
  render(<Hero />)
  expect(screen.getByText(/UN DES HOMMES DE L'OMBRE/i)).toBeInTheDocument()
})

test('rend le nom Emmanuel Krieger', () => {
  render(<Hero />)
  expect(screen.getByText(/EMMANUEL KRIEGER/i)).toBeInTheDocument()
})

test('rend les 5 services feuilles', () => {
  render(<Hero />)
  expect(screen.getByText(/SUIVI SPORTIF/i)).toBeInTheDocument()
  expect(screen.getByText(/PERSONAL/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Vérifier que les tests échouent**

```bash
npm run test -- --run Hero
```

Attendu : FAIL

- [ ] **Step 3: Implémenter Hero.jsx**

```jsx
import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

const LEAVES = [
  { key: 'top',          label: 'SUIVI SPORTIF\nDE HAUT NIVEAU',    pos: 'top-[18%] left-1/2 -translate-x-1/2' },
  { key: 'left',         label: 'INTERVENTION\nEN ENTREPRISE',       pos: 'top-1/2 left-[10%] -translate-y-1/2' },
  { key: 'right',        label: 'PERSONAL\nSHOPPER',                 pos: 'top-1/2 right-[10%] -translate-y-1/2' },
  { key: 'bottom-left',  label: 'BILAN ET TRAITEMENT\nOSTÉOPATHIQUE', pos: 'bottom-[22%] left-[18%]' },
  { key: 'bottom-right', label: 'PROJET SPORTIF\nPERSONNALISÉ',      pos: 'bottom-[22%] right-[18%]' },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
}

export default function Hero() {
  const heroRef = useRef(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 })

  const logoX = useTransform(springX, v => v * 5)
  const logoY = useTransform(springY, v => v * 3)

  function onMouseMove(e) {
    const rect = heroRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function onMouseLeave() {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.section
      ref={heroRef}
      className="relative w-full h-screen overflow-hidden"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Vidéo background */}
      <div className="absolute inset-0 z-0">
        <video
          className="w-full h-full object-cover"
          src="/videos/hero-final.mp4"
          autoPlay muted loop playsInline preload="auto"
        />
        {/* Overlay gradient dramatique */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/50" />
      </div>

      {/* Logo central — wrapper pour centrage CSS, motion.div pour l'offset parallax */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <motion.div style={{ x: logoX, y: logoY }} variants={fadeUp}>
          <img
            src="/logo.png"
            alt="Ostéo et Coaching du Sport"
            className="w-48 md:w-64 drop-shadow-2xl"
          />
        </motion.div>
      </div>

      {/* Feuilles */}
      {LEAVES.map((leaf, i) => (
        <motion.div
          key={leaf.key}
          className={`absolute z-10 ${leaf.pos}`}
          variants={{
            hidden: { opacity: 0, scale: 0.8 },
            visible: {
              opacity: 1, scale: 1,
              transition: { duration: 0.6, delay: 0.4 + i * 0.1, ease: [0.22, 1, 0.36, 1] }
            },
          }}
          whileHover={{ scale: 1.08, filter: 'drop-shadow(0 0 12px rgba(0,255,135,0.6))' }}
        >
          <a
            href="#services"
            className="block px-5 py-3 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm
                       text-white text-center text-xs font-syne font-bold tracking-widest
                       hover:border-green-accent hover:bg-green-accent/10 transition-colors whitespace-pre-line"
          >
            {leaf.label}
          </a>
        </motion.div>
      ))}

      {/* Phrase signature */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-40 z-10 text-white/40 text-xs font-syne tracking-[0.4em]"
        variants={fadeUp}
      >
        UN DES HOMMES DE L'OMBRE
      </motion.div>

      {/* Racines */}
      <motion.div
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10"
        variants={fadeUp}
      >
        <a href="#about" className="text-white/60 text-xs font-syne tracking-[0.3em] hover:text-green-accent transition-colors">
          HISTOIRE ET FORMATION
        </a>
      </motion.div>

      {/* Identité */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-center"
        variants={fadeUp}
      >
        <div className="text-white font-syne font-bold text-sm tracking-[0.3em]">EMMANUEL KRIEGER</div>
        <div className="text-white/60 font-inter text-xs tracking-wider mt-1">
          OSTÉOPATHE ET COACHING DU SPORT À FURDENHEIM
        </div>
      </motion.div>
    </motion.section>
  )
}
```

- [ ] **Step 4: Lancer les tests**

```bash
npm run test -- --run Hero
```

Attendu : 4 tests PASS

- [ ] **Step 5: Intégrer dans Home et vérifier visuellement**

```jsx
// src/pages/Home.jsx
import Hero from '../sections/Hero'
export default function Home() {
  return <main><Hero /></main>
}
```

```bash
npm run dev
```

Vérifier : vidéo en fond, logo centré, 5 feuilles, texte identité en bas, parallax souris.

- [ ] **Step 6: Commit**

```bash
git add src/sections/Hero.jsx src/sections/Hero.test.jsx src/pages/Home.jsx
git commit -m "feat: Hero avec vidéo background, feuilles et parallax"
```

---

## Task 6: Section SliderActions

**Files:**
- Create: `src/sections/SliderActions.jsx`
- Create: `src/sections/SliderActions.test.jsx`

4 slides scroll-driven. `useScroll` sur la track + `useTransform` pour l'index de slide actif.

- [ ] **Step 1: Écrire le test**

```jsx
// src/sections/SliderActions.test.jsx
import { render, screen } from '@testing-library/react'
import SliderActions from './SliderActions'

test('rend le premier slide par défaut', () => {
  render(<SliderActions />)
  expect(screen.getByText(/Ostéopathie/i)).toBeInTheDocument()
})

test('rend les 4 slides dans le DOM', () => {
  render(<SliderActions />)
  expect(screen.getByText(/Coaching/i)).toBeInTheDocument()
  expect(screen.getByText(/Préparation/i)).toBeInTheDocument()
  expect(screen.getByText(/Suivi de/i)).toBeInTheDocument()
})

test('rend les 4 dots de navigation', () => {
  render(<SliderActions />)
  expect(screen.getAllByRole('button', { name: /Slide/i })).toHaveLength(4)
})
```

- [ ] **Step 2: Vérifier que les tests échouent**

```bash
npm run test -- --run SliderActions
```

Attendu : FAIL

- [ ] **Step 3: Implémenter SliderActions.jsx**

```jsx
import { useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'

const SLIDES = [
  {
    num: '01', title: 'Ostéopathie\ndu sport',
    desc: "Traitement des douleurs musculaires, articulaires et tendineuses liées à la pratique sportive. Une approche manuelle précise pour vous remettre en mouvement.",
    cta: 'Prendre rendez-vous',
    bg: '/images/OSTEO-pic-9.jpg',
  },
  {
    num: '02', title: 'Coaching\npersonnalisé',
    desc: "Programmes d'entraînement sur mesure adaptés à vos objectifs, votre niveau et votre emploi du temps. Une méthode unique alliant performance et plaisir.",
    cta: 'Découvrir',
    bg: '/images/OSTEO-pic-10.jpg',
  },
  {
    num: '03', title: 'Préparation\nphysique',
    desc: "Renforcement musculaire, mobilité et travail de l'endurance pour repousser vos limites. Des protocoles scientifiques adaptés à chaque discipline sportive.",
    cta: 'En savoir plus',
    bg: '/images/OSTEO-pic-9.jpg',
  },
  {
    num: '04', title: 'Suivi de\nperformance',
    desc: "Analyse régulière de vos progrès, ajustement continu des programmes et accompagnement sur le long terme pour atteindre et maintenir votre meilleur niveau.",
    cta: 'Commencer',
    bg: '/images/OSTEO-pic-10.jpg',
  },
]

export default function SliderActions() {
  const trackRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })

  // scrollYProgress 0→1 mappé sur index 0→3
  const rawIndex = useTransform(scrollYProgress, [0, 1], [0, SLIDES.length - 1])

  return (
    <section ref={trackRef} className="relative" style={{ height: `${SLIDES.length * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Fond par slide */}
        {SLIDES.map((slide, i) => (
          <SlideBackground key={i} slide={slide} index={i} rawIndex={rawIndex} total={SLIDES.length} />
        ))}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 z-10" />

        {/* Contenu */}
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-24 max-w-3xl">
          {SLIDES.map((slide, i) => (
            <SlideContent key={i} slide={slide} index={i} rawIndex={rawIndex} total={SLIDES.length} />
          ))}
        </div>

        {/* Barre de progression */}
        <div className="absolute bottom-8 left-8 md:left-24 right-8 md:right-24 h-px bg-white/20 z-20">
          <motion.div
            className="h-full bg-green-accent origin-left"
            style={{ scaleX: scrollYProgress }}
          />
        </div>

        {/* Dots */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
          {SLIDES.map((_, i) => (
            <DotButton key={i} index={i} rawIndex={rawIndex} trackRef={trackRef} total={SLIDES.length} />
          ))}
        </div>
      </div>
    </section>
  )
}

function SlideBackground({ slide, index, rawIndex, total }) {
  const opacity = useTransform(rawIndex, [index - 0.5, index, index + 0.5], [0, 1, 0])
  return (
    <motion.div
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url(${slide.bg})`, opacity }}
    />
  )
}

function SlideContent({ slide, index, rawIndex, total }) {
  const opacity = useTransform(rawIndex, [index - 0.4, index, index + 0.4], [0, 1, 0])
  const y = useTransform(rawIndex, [index - 0.5, index, index + 0.5], [40, 0, -40])

  return (
    <motion.div
      className="absolute"
      style={{ opacity, y }}
    >
      <div className="flex items-center gap-3 mb-6">
        <span className="font-syne font-bold text-green-accent text-lg">{slide.num}</span>
        <span className="text-white/30">—</span>
        <span className="text-white/30 font-syne text-sm">0{total}</span>
      </div>
      <h2 className="font-syne font-bold text-5xl md:text-7xl text-white leading-tight mb-6 whitespace-pre-line">
        {slide.title}
      </h2>
      <p className="font-inter text-white/70 text-lg max-w-lg mb-8 leading-relaxed">
        {slide.desc}
      </p>
      <motion.a
        href="#contact"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-green-accent text-green-deep font-syne font-bold tracking-wide"
        whileHover={{ scale: 1.04, backgroundColor: '#00bfa5' }}
        whileTap={{ scale: 0.97 }}
      >
        {slide.cta} →
      </motion.a>
    </motion.div>
  )
}

function DotButton({ index, rawIndex, trackRef, total }) {
  const opacity = useTransform(rawIndex, [index - 0.5, index, index + 0.5], [0.3, 1, 0.3])
  const scale = useTransform(rawIndex, [index - 0.5, index, index + 0.5], [0.8, 1.3, 0.8])

  function scrollToSlide() {
    const el = trackRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const totalHeight = el.offsetHeight - window.innerHeight
    const targetScroll = window.scrollY + rect.top + (index / (total - 1)) * totalHeight
    window.scrollTo({ top: targetScroll, behavior: 'smooth' })
  }

  return (
    <motion.button
      className="w-2 h-2 rounded-full bg-white"
      style={{ opacity, scale }}
      onClick={scrollToSlide}
      aria-label={`Slide ${index + 1}`}
    />
  )
}
```

- [ ] **Step 4: Lancer les tests**

```bash
npm run test -- --run SliderActions
```

Attendu : 3 tests PASS

- [ ] **Step 5: Intégrer dans Home et vérifier visuellement**

```jsx
// src/pages/Home.jsx
import Hero from '../sections/Hero'
import SliderActions from '../sections/SliderActions'
export default function Home() {
  return <main><Hero /><SliderActions /></main>
}
```

```bash
npm run dev
```

Vérifier : le slider change de slide en scrollant, la barre de progression avance, les dots sont cliquables.

- [ ] **Step 6: Commit**

```bash
git add src/sections/SliderActions.jsx src/sections/SliderActions.test.jsx src/pages/Home.jsx
git commit -m "feat: SliderActions scroll-driven avec Framer Motion"
```

---

## Task 7: Section About

**Files:**
- Create: `src/sections/About.jsx`
- Create: `src/sections/About.test.jsx`

- [ ] **Step 1: Écrire le test**

```jsx
// src/sections/About.test.jsx
import { render, screen } from '@testing-library/react'
import About from './About'

test('rend le titre de section', () => {
  render(<About />)
  expect(screen.getByText(/approche/i)).toBeInTheDocument()
})

test('rend le lien En savoir plus', () => {
  render(<About />)
  expect(screen.getByText(/En savoir plus/i)).toBeInTheDocument()
})

test('rend l\'image avec alt text', () => {
  render(<About />)
  expect(screen.getByAltText(/Emmanuel Krieger/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Vérifier que les tests échouent**

```bash
npm run test -- --run About
```

Attendu : FAIL

- [ ] **Step 3: Implémenter About.jsx**

```jsx
import { motion } from 'framer-motion'

const slideIn = (direction) => ({
  hidden: { opacity: 0, x: direction === 'left' ? -60 : 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
})

export default function About() {
  return (
    <section id="about" className="py-24 md:py-36 px-6 bg-site-bg">
      <div className="max-w-[1360px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Image */}
        <motion.div
          className="relative"
          variants={slideIn('left')}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
            <img
              src="/images/emmanuel.jpg"
              alt="Emmanuel Krieger ostéopathe"
              className="w-full h-full object-cover"
              onError={e => { e.target.style.display = 'none' }}
            />
            {/* Badge */}
            <div className="absolute bottom-6 left-6 right-6 glass rounded-xl p-4">
              <div className="font-syne font-bold text-text-primary">Emmanuel Krieger</div>
              <div className="font-inter text-sm text-text-secondary mt-0.5">Ostéopathe D.O. · Coach sportif</div>
            </div>
          </div>
          {/* Accent décoratif */}
          <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-green-accent/10 blur-2xl -z-10" />
        </motion.div>

        {/* Texte */}
        <motion.div
          variants={slideIn('right')}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-deep font-syne font-bold text-xs tracking-widest mb-6">
            À PROPOS
          </div>
          <h2 className="font-syne font-bold text-4xl md:text-5xl text-text-primary leading-tight mb-6">
            Une approche <span className="gradient-text">globale</span><br />de votre santé
          </h2>
          <p className="font-inter text-text-secondary text-lg leading-relaxed mb-4">
            Diplômé en ostéopathie et certifié coach sportif, je vous accompagne avec une méthode unique qui combine traitement ostéopathique et coaching personnalisé pour optimiser votre performance et prévenir les blessures.
          </p>
          <p className="font-inter text-text-secondary text-lg leading-relaxed mb-8">
            Que vous soyez athlète de haut niveau ou sportif amateur, mon approche s'adapte à vos besoins spécifiques.
          </p>
          <motion.a
            href="#services"
            className="inline-flex items-center gap-2 font-syne font-bold text-green-deep border-b-2 border-green-accent pb-0.5"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            En savoir plus →
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Lancer les tests**

```bash
npm run test -- --run About
```

Attendu : 3 tests PASS

- [ ] **Step 5: Intégrer dans Home**

Ajouter `<About />` dans `src/pages/Home.jsx` après `<SliderActions />`.

- [ ] **Step 6: Commit**

```bash
git add src/sections/About.jsx src/sections/About.test.jsx src/pages/Home.jsx
git commit -m "feat: About avec slide-in animations"
```

---

## Task 8: Section Services

**Files:**
- Create: `src/sections/Services.jsx`
- Create: `src/sections/Services.test.jsx`

Accordion animé avec AnimatePresence pour l'ouverture/fermeture. Numéros géants en fond.

- [ ] **Step 1: Écrire le test**

```jsx
// src/sections/Services.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import Services from './Services'

test('rend les 4 services', () => {
  render(<Services />)
  expect(screen.getByText(/Ostéopathie du sport/i)).toBeInTheDocument()
  expect(screen.getByText(/Coaching personnalisé/i)).toBeInTheDocument()
  expect(screen.getByText(/Préparation physique/i)).toBeInTheDocument()
  expect(screen.getByText(/Suivi de performance/i)).toBeInTheDocument()
})

test('ouvre un service au clic', () => {
  render(<Services />)
  const item = screen.getByText(/Ostéopathie du sport/i)
  fireEvent.click(item)
  expect(screen.getByText(/douleurs musculaires/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Vérifier que les tests échouent**

```bash
npm run test -- --run Services
```

Attendu : FAIL

- [ ] **Step 3: Implémenter Services.jsx**

```jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SERVICES = [
  { num: 1, title: 'Ostéopathie du sport', body: "Traitement des douleurs musculaires, articulaires et tendineuses liées à la pratique sportive." },
  { num: 2, title: 'Coaching personnalisé', body: "Programmes d'entraînement sur mesure adaptés à vos objectifs et votre condition physique." },
  { num: 3, title: 'Préparation physique', body: "Renforcement, mobilité et endurance pour atteindre votre potentiel maximum." },
  { num: 4, title: 'Suivi de performance', body: "Analyse et suivi régulier de vos progrès avec ajustement continu des programmes." },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export default function Services() {
  const [open, setOpen] = useState(null)

  return (
    <section id="services" className="py-24 md:py-36 px-6 bg-green-deep">
      <div className="max-w-[1360px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
        {/* Gauche */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-syne font-bold text-xs tracking-widest mb-6">
              PRESTATIONS
            </div>
            <h2 className="font-syne font-bold text-4xl md:text-5xl text-white leading-tight mb-4">
              Mes <span className="gradient-text">services</span>
            </h2>
            <p className="font-inter text-white/60 text-lg mb-12">
              Une gamme complète de soins et d'accompagnement adaptée aux sportifs de tous niveaux.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {SERVICES.map(service => (
              <motion.div key={service.num} variants={itemVariants}>
                <ServiceItem
                  service={service}
                  isOpen={open === service.num}
                  onToggle={() => setOpen(open === service.num ? null : service.num)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Droite : image */}
        <motion.div
          className="relative rounded-2xl overflow-hidden aspect-[3/4] hidden md:block"
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src="/images/OSTEO-pic-9.jpg" alt="Ostéopathie et coaching" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-green-deep/80 to-transparent" />
          <motion.a
            href="#contact"
            className="absolute bottom-8 left-8 right-8 py-4 rounded-xl bg-green-accent text-green-deep font-syne font-bold text-center tracking-wide"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Prendre rendez-vous →
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

function ServiceItem({ service, isOpen, onToggle }) {
  return (
    <div className="relative border-t border-white/10 py-5 overflow-hidden">
      {/* Numéro géant en fond */}
      <span className="absolute right-0 top-0 font-syne font-bold text-8xl text-white/[0.04] leading-none select-none pointer-events-none">
        {service.num}
      </span>

      <motion.button
        className="w-full flex items-center justify-between text-left gap-4"
        onClick={onToggle}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-4">
          <span className="font-syne font-bold text-green-accent text-sm w-5">{service.num}</span>
          <span className="font-syne font-bold text-white text-lg md:text-xl">{service.title}</span>
        </div>
        <motion.span
          className="text-green-accent font-bold text-xl shrink-0"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          +
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="font-inter text-white/60 text-base mt-3 pl-9 leading-relaxed">
              {service.body}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 4: Lancer les tests**

```bash
npm run test -- --run Services
```

Attendu : 2 tests PASS

- [ ] **Step 5: Intégrer dans Home**

Ajouter `<Services />` dans `src/pages/Home.jsx` après `<About />`.

- [ ] **Step 6: Commit**

```bash
git add src/sections/Services.jsx src/sections/Services.test.jsx src/pages/Home.jsx
git commit -m "feat: Services accordion animé avec stagger"
```

---

## Task 9: Section Testimonials

**Files:**
- Create: `src/sections/Testimonials.jsx`
- Create: `src/sections/Testimonials.test.jsx`

3 cards glassmorphism avec stagger `whileInView` + hover lift.

- [ ] **Step 1: Écrire le test**

```jsx
// src/sections/Testimonials.test.jsx
import { render, screen } from '@testing-library/react'
import Testimonials from './Testimonials'

test('rend les 3 témoignages', () => {
  render(<Testimonials />)
  expect(screen.getByText(/Michel Perraud/i)).toBeInTheDocument()
  expect(screen.getByText(/Sophie Martin/i)).toBeInTheDocument()
  expect(screen.getByText(/Thomas Lebrun/i)).toBeInTheDocument()
})

test('rend le titre de section', () => {
  render(<Testimonials />)
  expect(screen.getByText(/Ce que disent/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Vérifier que les tests échouent**

```bash
npm run test -- --run Testimonials
```

Attendu : FAIL

- [ ] **Step 3: Implémenter Testimonials.jsx**

```jsx
import { motion } from 'framer-motion'

const TESTIMONIALS = [
  {
    text: "Après des mois de douleurs au dos, Emmanuel a trouvé la solution en quelques séances. Son approche combinée ostéo + coaching est vraiment unique.",
    author: 'Michel Perraud', role: 'Coureur amateur', initial: 'M',
    gradient: 'from-green-accent to-teal-accent',
  },
  {
    text: "Le programme de coaching personnalisé a complètement transformé ma préparation. Je n'ai jamais été aussi performant sur mes compétitions.",
    author: 'Sophie Martin', role: 'Triathlète', initial: 'S',
    gradient: 'from-cyan-accent to-teal-accent',
  },
  {
    text: "Je recommande vivement. La prise en charge est complète, professionnelle et vraiment adaptée aux sportifs. Résultats visibles dès la première séance.",
    author: 'Thomas Lebrun', role: 'Footballeur', initial: 'T',
    gradient: 'from-teal-accent to-green-accent',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 md:py-36 px-6 bg-site-bg">
      <div className="max-w-[1360px] mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-deep font-syne font-bold text-xs tracking-widest mb-4">
            TÉMOIGNAGES
          </div>
          <h2 className="font-syne font-bold text-4xl md:text-5xl text-text-primary">
            Ce que disent mes patients
          </h2>
          <p className="font-inter text-text-secondary text-lg mt-3">
            Des résultats concrets, des vies transformées
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {TESTIMONIALS.map(t => (
            <motion.div
              key={t.author}
              variants={cardVariants}
              whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}
              className="glass rounded-2xl p-8 cursor-default border-t-2 border-green-accent/40"
            >
              <div className="text-5xl font-syne font-bold text-green-accent/30 leading-none mb-4">"</div>
              <p className="font-inter text-text-secondary text-base leading-relaxed mb-6">{t.text}</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-syne font-bold text-sm shrink-0`}>
                  {t.initial}
                </div>
                <div>
                  <div className="font-syne font-bold text-text-primary text-sm">{t.author}</div>
                  <div className="font-inter text-text-secondary text-xs">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Lancer les tests**

```bash
npm run test -- --run Testimonials
```

Attendu : 2 tests PASS

- [ ] **Step 5: Intégrer dans Home**

Ajouter `<Testimonials />` dans `src/pages/Home.jsx` après `<Services />`.

- [ ] **Step 6: Commit**

```bash
git add src/sections/Testimonials.jsx src/sections/Testimonials.test.jsx src/pages/Home.jsx
git commit -m "feat: Testimonials avec stagger et hover lift"
```

---

## Task 10: Section Contact

**Files:**
- Create: `src/sections/Contact.jsx`
- Create: `src/sections/Contact.test.jsx`

- [ ] **Step 1: Écrire le test**

```jsx
// src/sections/Contact.test.jsx
import { render, screen } from '@testing-library/react'
import Contact from './Contact'

test('rend le titre Prendre rendez-vous', () => {
  render(<Contact />)
  expect(screen.getByText(/Prendre rendez-vous/i)).toBeInTheDocument()
})

test('rend les horaires', () => {
  render(<Contact />)
  expect(screen.getByText(/Lundi/i)).toBeInTheDocument()
  expect(screen.getByText(/Vendredi/i)).toBeInTheDocument()
})

test('rend le CTA de réservation', () => {
  render(<Contact />)
  expect(screen.getByText(/Réserver en ligne/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Vérifier que les tests échouent**

```bash
npm run test -- --run Contact
```

Attendu : FAIL

- [ ] **Step 3: Implémenter Contact.jsx**

```jsx
import { motion } from 'framer-motion'

const HOURS = [
  { day: 'Lundi',    hours: '08:00–20:00' },
  { day: 'Mardi',    hours: '08:00–20:00' },
  { day: 'Mercredi', hours: '08:00–20:00' },
  { day: 'Jeudi',    hours: '08:00–20:00' },
  { day: 'Vendredi', hours: '08:00–18:00' },
  { day: 'Samedi',   hours: '08:00–12:00' },
]

const slideIn = (direction) => ({
  hidden: { opacity: 0, x: direction === 'left' ? -60 : 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
})

export default function Contact() {
  return (
    <section id="contact" className="py-24 md:py-36 px-6 bg-green-deep">
      <div className="max-w-[1360px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Image */}
        <motion.div
          className="relative rounded-2xl overflow-hidden aspect-[4/5] hidden md:block"
          variants={slideIn('left')}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <img src="/images/OSTEO-pic-10.jpg" alt="Marathon" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
          <div className="absolute inset-0 bg-gradient-to-t from-green-deep/60 to-transparent" />
        </motion.div>

        {/* Infos */}
        <motion.div
          variants={slideIn('right')}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-syne font-bold text-xs tracking-widest mb-6">
            CONTACT &amp; HORAIRES
          </div>
          <h2 className="font-syne font-bold text-4xl md:text-5xl text-white mb-8">
            Prendre rendez-vous
          </h2>

          <div className="glass rounded-2xl p-6 mb-6 bg-white/5 border-white/10">
            <p className="font-inter text-white/70 mb-2">📍 34 Rue de Strasbourg, 67280 Furdenheim</p>
            <p className="font-inter text-white/70">📞 +33 6 XX XX XX XX</p>
          </div>

          <motion.a
            href="#"
            className="inline-flex w-full justify-center py-4 rounded-xl bg-green-accent text-green-deep font-syne font-bold text-lg mb-6"
            whileHover={{ scale: 1.02, backgroundColor: '#00bfa5' }}
            whileTap={{ scale: 0.98 }}
          >
            Réserver en ligne →
          </motion.a>

          <div className="glass rounded-2xl p-6 bg-white/5 border-white/10">
            {HOURS.map((h, i) => (
              <motion.div
                key={h.day}
                className="flex justify-between py-2.5 border-b border-white/10 last:border-0"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <span className="font-inter text-white/70">{h.day}</span>
                <span className="font-syne font-bold text-green-accent">{h.hours}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Lancer les tests**

```bash
npm run test -- --run Contact
```

Attendu : 3 tests PASS

- [ ] **Step 5: Intégrer dans Home**

Ajouter `<Contact />` dans `src/pages/Home.jsx` après `<Testimonials />`.

- [ ] **Step 6: Commit**

```bash
git add src/sections/Contact.jsx src/sections/Contact.test.jsx src/pages/Home.jsx
git commit -m "feat: Contact avec horaires animés"
```

---

## Task 11: Assembler Home + finaliser App

**Files:**
- Modify: `src/pages/Home.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Finaliser Home.jsx**

```jsx
// src/pages/Home.jsx
import Hero from '../sections/Hero'
import SliderActions from '../sections/SliderActions'
import About from '../sections/About'
import Services from '../sections/Services'
import Testimonials from '../sections/Testimonials'
import Contact from '../sections/Contact'

export default function Home() {
  return (
    <main>
      <Hero />
      <SliderActions />
      <About />
      <Services />
      <Testimonials />
      <Contact />
    </main>
  )
}
```

- [ ] **Step 2: Vérifier App.jsx**

`src/App.jsx` doit déjà avoir `<Navbar />` et `<Footer />` autour de `<Routes>` (fait en Task 1). Vérifier qu'il ressemble à ceci :

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
```

- [ ] **Step 3: Lancer tous les tests**

```bash
npm run test -- --run
```

Attendu : tous PASS (Navbar, Footer, Hero, SliderActions, About, Services, Testimonials, Contact)

- [ ] **Step 4: Vérifier visuellement le site complet**

```bash
npm run dev
```

Parcourir le site de haut en bas :
- Navbar transparente → glassmorphism au scroll ✓
- Hero vidéo, feuilles, parallax souris ✓
- Slider scroll-driven ✓
- About slide-in ✓
- Services accordion vert foncé ✓
- Testimonials cards hover ✓
- Contact horaires ✓
- Footer ✓

- [ ] **Step 5: Commit**

```bash
git add src/pages/Home.jsx src/App.jsx
git commit -m "feat: Home page complète + routing configuré"
```

---

## Task 12: Build de production + nettoyage

**Files:**
- Delete: `css/style.css` (remplacé par Tailwind)
- Delete: `js/main.js` (remplacé par les composants React)
- Delete: ancien `index.html` (racine) — Vite a recréé le sien

- [ ] **Step 1: Build de production**

```bash
npm run build
```

Attendu : `dist/` créé sans erreur. La sortie doit lister les chunks JS/CSS.

- [ ] **Step 2: Prévisualiser le build**

```bash
npm run preview
```

Ouvrir `http://localhost:4173`. Vérifier que le site fonctionne identiquement au dev server.

- [ ] **Step 3: Supprimer les anciens fichiers vanilla**

```bash
rm css/style.css js/main.js
```

Note : ne pas supprimer `videos/` et `images/` à la racine s'ils sont encore référencés. Les assets sont maintenant dans `public/`.

- [ ] **Step 4: Vérifier que le build passe toujours**

```bash
npm run build && npm run preview
```

- [ ] **Step 5: Lancer tous les tests une dernière fois**

```bash
npm run test -- --run
```

Attendu : tous PASS

- [ ] **Step 6: Commit final**

```bash
git add -A
git commit -m "feat: migration React complète — build de production OK"
```

---

## Checklist déploiement (post-migration)

Pour déployer sur Vercel ou Netlify :

**Vercel :**
```bash
npx vercel
```
Framework preset : Vite. Build command : `npm run build`. Output dir : `dist`.

**Netlify :**
```bash
npx netlify-cli deploy --prod --dir=dist
```

Ou connecter le repo GitHub dans l'interface Netlify (Build command : `npm run build`, Publish dir : `dist`).
