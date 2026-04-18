# Redesign Dynamique Glassmorphism — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produire un site vitrine HTML/CSS/JS complet pour Emmanuel Krieger (ostéopathe & coach sportif) avec hero parallaxe souris, glassmorphism blanc vibrant, animations scroll sur toutes les sections.

**Architecture:** Trois fichiers séparés — `index.html` pour la structure, `css/style.css` pour tous les styles, `js/main.js` pour les interactions (parallaxe + IntersectionObserver). Chaque section est un `<section>` avec un id sémantique. Les variables CSS centralisent la palette.

**Tech Stack:** HTML5, CSS3 (custom properties, backdrop-filter, grid), Vanilla JS (mousemove, IntersectionObserver), SVG inline pour l'arbre.

---

## Structure des fichiers

| Fichier | Responsabilité |
|---|---|
| `index.html` | Structure HTML complète : navbar, hero, about, services, testimonials, contact, footer |
| `css/style.css` | Reset, variables CSS, navbar, hero, glassmorphism system, sections, footer, responsive |
| `js/main.js` | Parallaxe souris hero (6 couches), IntersectionObserver scroll animations |

---

## Task 1 : Scaffolding — structure de fichiers et variables CSS

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/main.js`

- [ ] **Step 1 : Créer `index.html` avec le squelette de base**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ostéo et Coaching du Sport — Emmanuel Krieger</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <!-- Navbar -->
  <nav class="navbar" id="navbar"></nav>
  <!-- Hero -->
  <section class="hero" id="hero"></section>
  <!-- About -->
  <section class="about" id="about"></section>
  <!-- Services -->
  <section class="services" id="services"></section>
  <!-- Testimonials -->
  <section class="testimonials" id="testimonials"></section>
  <!-- Contact -->
  <section class="contact" id="contact"></section>
  <!-- Footer -->
  <footer class="footer" id="footer"></footer>
  <div class="footer-bottom"></div>

  <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2 : Créer `css/style.css` avec reset et variables CSS**

```css
/* ── RESET ── */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: #f7f9f7;
  color: #263238;
  overflow-x: hidden;
}
a { text-decoration: none; }

/* ── CSS VARIABLES ── */
:root {
  --white: #ffffff;
  --bg: #f7f9f7;
  --green-dark: #1b5e20;
  --green: #00c853;
  --teal-dark: #00897b;
  --teal: #00bfa5;
  --cyan: #00b0ff;
  --cyan-light: #00e5ff;
  --lime: #76ff03;
  --orange: #ff6d00;
  --orange-light: #ffab00;
  --text-secondary: #546e7a;
  --text-primary: #263238;
  --footer-bg: #1b2a1c;
  --footer-dark: #0d1f1e;

  /* Glassmorphism system */
  --glass-bg: rgba(255, 255, 255, 0.82);
  --glass-border: rgba(255, 255, 255, 0.95);
  --glass-blur: blur(14px);
  --glass-shadow: 0 4px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(255,255,255,0.5) inset;
  --glass-radius: 16px;

  /* Accent gradients */
  --grad-green: linear-gradient(135deg, var(--green), var(--teal));
  --grad-cyan: linear-gradient(135deg, var(--cyan), var(--cyan-light));
  --grad-lime: linear-gradient(135deg, var(--lime), #00e676);
  --grad-orange: linear-gradient(135deg, var(--orange), var(--orange-light));
}
```

- [ ] **Step 3 : Créer `js/main.js` vide avec commentaires de structure**

```js
// main.js — Ostéo et Coaching du Sport
// 1. Navbar scroll effect
// 2. Hero parallax (mousemove, 6 layers)
// 3. Scroll reveal (IntersectionObserver)

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initParallax();
  initScrollReveal();
});

function initNavbarScroll() {}
function initParallax() {}
function initScrollReveal() {}
```

- [ ] **Step 4 : Ouvrir `index.html` dans le navigateur — page blanche sans erreur console**

- [ ] **Step 5 : Commit**

```bash
git init
git add index.html css/style.css js/main.js
git commit -m "feat: scaffolding initial — structure fichiers et variables CSS"
```

---

## Task 2 : Navbar

**Files:**
- Modify: `index.html` — section `<nav class="navbar">`
- Modify: `css/style.css` — styles navbar

- [ ] **Step 1 : Remplir le HTML de la navbar**

```html
<nav class="navbar" id="navbar">
  <div class="navbar-inner">
    <div class="logo">
      OSTÉO<br><span>ET COACHING</span><br>DU SPORT
    </div>
    <div class="nav-links">
      <a href="#about" class="nav-link">À Propos</a>
      <a href="#services" class="nav-link">Services</a>
      <a href="#testimonials" class="nav-link">Témoignages</a>
      <a href="#contact" class="nav-link">Contact</a>
    </div>
    <div class="nav-divider"></div>
    <a href="#contact" class="nav-cta">Rendez-vous</a>
  </div>
</nav>
```

- [ ] **Step 2 : Ajouter les styles navbar dans `css/style.css`**

```css
/* ── NAVBAR ── */
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-bottom: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 20px rgba(0,0,0,0.06);
  transition: box-shadow 0.3s;
}
.navbar.scrolled {
  box-shadow: 0 4px 32px rgba(0,0,0,0.1);
}
.navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 32px;
}
.logo {
  font-weight: 800;
  font-size: 13px;
  color: var(--green-dark);
  line-height: 1.25;
  margin-right: auto;
}
.logo span { color: var(--teal-dark); }
.nav-links { display: flex; gap: 28px; }
.nav-link {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  transition: color 0.2s;
}
.nav-link:hover { color: var(--teal-dark); }
.nav-divider { width: 1px; height: 24px; background: #ddd; }
.nav-cta {
  background: var(--grad-green);
  color: var(--white);
  padding: 8px 22px;
  border-radius: 24px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(0,200,83,0.35);
  transition: transform 0.2s, box-shadow 0.2s;
}
.nav-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0,200,83,0.45);
}
```

- [ ] **Step 3 : Implémenter `initNavbarScroll()` dans `js/main.js`**

```js
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}
```

- [ ] **Step 4 : Vérifier dans le navigateur — navbar fixe, blur, ombre au scroll**

- [ ] **Step 5 : Commit**

```bash
git add index.html css/style.css js/main.js
git commit -m "feat: navbar fixe glassmorphism avec effet scroll"
```

---

## Task 3 : Hero — structure HTML et couches SVG

**Files:**
- Modify: `index.html` — section `<section class="hero">`
- Modify: `css/style.css` — styles hero

- [ ] **Step 1 : Remplir le HTML de la hero**

```html
<section class="hero" id="hero">
  <!-- Couche 1 : ciel (statique) -->
  <div class="hero-sky"></div>

  <!-- Couche 2 : nuages -->
  <div class="hero-clouds" id="hero-clouds">
    <div class="cloud cloud-1"></div>
    <div class="cloud cloud-2"></div>
    <div class="cloud cloud-3"></div>
    <div class="cloud cloud-4"></div>
  </div>

  <!-- Couche 3 : sol -->
  <div class="hero-ground" id="hero-ground"></div>

  <!-- Couche 4 : arbre SVG -->
  <div class="hero-tree" id="hero-tree">
    <svg viewBox="0 0 260 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="115" y="220" width="30" height="80" rx="6" fill="#5d4037"/>
      <rect x="120" y="220" width="10" height="80" rx="4" fill="#795548" opacity="0.5"/>
      <ellipse cx="130" cy="295" rx="50" ry="8" fill="#4e342e" opacity="0.3"/>
      <ellipse cx="130" cy="180" rx="80" ry="70" fill="#2e7d32"/>
      <ellipse cx="130" cy="155" rx="65" ry="60" fill="#388e3c"/>
      <ellipse cx="130" cy="130" rx="55" ry="52" fill="#43a047"/>
      <ellipse cx="130" cy="108" rx="45" ry="44" fill="#4caf50"/>
      <ellipse cx="130" cy="88" rx="36" ry="38" fill="#66bb6a"/>
      <ellipse cx="130" cy="72" rx="28" ry="30" fill="#81c784"/>
      <ellipse cx="105" cy="120" rx="22" ry="20" fill="#a5d6a7" opacity="0.5"/>
      <ellipse cx="155" cy="105" rx="18" ry="16" fill="#c8e6c9" opacity="0.4"/>
      <ellipse cx="130" cy="95" rx="15" ry="12" fill="#e8f5e9" opacity="0.3"/>
    </svg>
  </div>

  <!-- Couche 5 : contenu central -->
  <div class="hero-center" id="hero-center">
    <div class="hero-eyebrow">Ostéopathie · Coaching · Sport</div>
    <h1 class="hero-title">
      Coaching<br><span>personnalisé</span><br>& Ostéopathie
    </h1>
    <p class="hero-subtitle">Votre santé et performance sportive entre de bonnes mains</p>
    <div class="hero-pills">
      <div class="hero-pill"><span class="pill-dot pill-dot--green"></span>Ostéopathie du sport</div>
      <div class="hero-pill"><span class="pill-dot pill-dot--cyan"></span>Coaching sur mesure</div>
      <div class="hero-pill"><span class="pill-dot pill-dot--lime"></span>Suivi performance</div>
    </div>
    <a href="#contact" class="hero-cta">Prendre rendez-vous →</a>
  </div>

  <!-- Couche 6 : cards stats flottantes -->
  <div class="hero-stat hero-stat--left" id="hero-stat-left">
    <span class="stat-value">+500</span>
    Patients suivis
  </div>
  <div class="hero-stat hero-stat--right" id="hero-stat-right">
    <span class="stat-value">12 ans</span>
    d'expérience
  </div>
</section>
```

- [ ] **Step 2 : Ajouter les styles hero dans `css/style.css`**

```css
/* ── HERO ── */
.hero {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 600px;
  overflow: hidden;
  margin-top: 64px; /* navbar height */
}

/* Ciel */
.hero-sky {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #b3e5fc 0%, #e8f5e9 50%, #a5d6a7 100%);
}

/* Nuages */
.hero-clouds { position: absolute; inset: 0; will-change: transform; }
.cloud {
  position: absolute;
  background: rgba(255,255,255,0.92);
  border-radius: 50px;
  filter: blur(1px);
}
.cloud::before {
  content: '';
  position: absolute;
  background: inherit;
  border-radius: 50%;
}
.cloud-1 { width: 200px; height: 58px; top: 10%; left: 58%; }
.cloud-1::before { width: 100px; height: 78px; top: -36px; left: 42px; }
.cloud-2 { width: 130px; height: 40px; top: 20%; left: 74%; opacity: 0.8; }
.cloud-3 { width: 100px; height: 32px; top: 7%; left: 48%; opacity: 0.6; }
.cloud-4 { width: 80px; height: 26px; top: 16%; left: 14%; opacity: 0.5; }

/* Sol */
.hero-ground {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 32%;
  background: linear-gradient(180deg, #66bb6a 0%, #43a047 60%, #388e3c 100%);
  border-radius: 50% 50% 0 0 / 18px 18px 0 0;
  will-change: transform;
}

/* Arbre */
.hero-tree {
  position: absolute;
  right: 10%;
  bottom: 28%;
  width: 300px;
  transform-origin: bottom center;
  will-change: transform;
  z-index: 2;
  filter: drop-shadow(0 24px 48px rgba(0,0,0,0.2));
}
.hero-tree svg { width: 100%; height: auto; }

/* Contenu central */
.hero-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
  will-change: transform;
}
.hero-eyebrow {
  display: inline-block;
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 30px;
  padding: 5px 18px;
  font-size: 11px;
  font-weight: 700;
  color: var(--teal-dark);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 14px;
  box-shadow: 0 2px 12px rgba(0,137,123,0.15);
}
.hero-title {
  font-size: 48px;
  font-weight: 900;
  color: var(--green-dark);
  line-height: 1.1;
  letter-spacing: -1.5px;
  text-shadow: 0 2px 20px rgba(255,255,255,0.8);
  margin-bottom: 12px;
}
.hero-title span {
  background: var(--grad-green);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-subtitle {
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 28px;
  font-weight: 500;
  text-shadow: 0 1px 8px rgba(255,255,255,0.7);
}
.hero-pills {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 28px;
}
.hero-pill {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: 50px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  color: var(--green-dark);
  box-shadow: var(--glass-shadow);
  transition: transform 0.2s, box-shadow 0.2s;
}
.hero-pill:hover { transform: translateY(-2px); }
.pill-dot {
  width: 9px; height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}
.pill-dot--green { background: var(--grad-green); }
.pill-dot--cyan { background: var(--grad-cyan); box-shadow: 0 0 8px rgba(0,176,255,0.5); }
.pill-dot--lime { background: var(--grad-lime); }
.hero-cta {
  display: inline-block;
  background: linear-gradient(135deg, var(--green-dark), var(--teal-dark));
  color: var(--white);
  padding: 16px 40px;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  box-shadow: 0 8px 32px rgba(27,94,32,0.4), 0 0 0 3px rgba(255,255,255,0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}
.hero-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(27,94,32,0.5);
}

/* Stats flottantes */
.hero-stat {
  position: absolute;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 14px 18px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  box-shadow: var(--glass-shadow);
  z-index: 8;
  will-change: transform;
}
.hero-stat--left { left: 5%; top: 48%; }
.hero-stat--right { right: 5%; top: 42%; }
.stat-value {
  display: block;
  font-size: 26px;
  font-weight: 900;
  color: var(--teal-dark);
  line-height: 1;
  margin-bottom: 4px;
}
```

- [ ] **Step 3 : Vérifier visuellement dans le navigateur — hero avec toutes les couches visible**

- [ ] **Step 4 : Commit**

```bash
git add index.html css/style.css
git commit -m "feat: hero section — structure HTML et styles complets"
```

---

## Task 4 : Hero — effet parallaxe souris

**Files:**
- Modify: `js/main.js` — fonction `initParallax()`

- [ ] **Step 1 : Implémenter `initParallax()` dans `js/main.js`**

```js
function initParallax() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const layers = {
    clouds: document.getElementById('hero-clouds'),
    ground: document.getElementById('hero-ground'),
    tree:   document.getElementById('hero-tree'),
    center: document.getElementById('hero-center'),
    statL:  document.getElementById('hero-stat-left'),
    statR:  document.getElementById('hero-stat-right'),
  };

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top)  / rect.height - 0.5;

    layers.clouds.style.transform = `translate(${cx * 20}px, ${cy * 8}px)`;
    layers.ground.style.transform = `translate(${cx * 8}px, ${cy * 5}px)`;
    layers.tree.style.transform   = `translate(${cx * -32}px, ${cy * -20}px)`;
    layers.center.style.transform = `translate(calc(-50% + ${cx * 5}px), calc(-50% + ${cy * 3}px))`;
    layers.statL.style.transform  = `translate(${cx * -10}px, ${cy * -6}px)`;
    layers.statR.style.transform  = `translate(${cx * -14}px, ${cy * -8}px)`;
  }, { passive: true });

  hero.addEventListener('mouseleave', () => {
    layers.clouds.style.transform = '';
    layers.ground.style.transform = '';
    layers.tree.style.transform   = '';
    layers.center.style.transform = 'translate(-50%, -50%)';
    layers.statL.style.transform  = '';
    layers.statR.style.transform  = '';
  });
}
```

- [ ] **Step 2 : Ajouter les transitions CSS sur chaque couche dans `css/style.css`**

```css
/* Transitions parallaxe */
.hero-clouds  { transition: transform 0.15s ease-out; }
.hero-ground  { transition: transform 0.18s ease-out; }
.hero-tree    { transition: transform 0.08s ease-out; }
.hero-center  { transition: transform 0.12s ease-out; }
.hero-stat    { transition: transform 0.1s ease-out, box-shadow 0.2s; }
```

- [ ] **Step 3 : Vérifier dans le navigateur — déplacer la souris sur la hero, 6 couches réagissent**

- [ ] **Step 4 : Commit**

```bash
git add js/main.js css/style.css
git commit -m "feat: hero parallaxe souris 6 couches"
```

---

## Task 5 : Animations scroll — IntersectionObserver

**Files:**
- Modify: `css/style.css` — classes `.reveal`, `.reveal-left`, `.reveal-right`
- Modify: `js/main.js` — fonction `initScrollReveal()`

- [ ] **Step 1 : Ajouter les classes d'animation dans `css/style.css`**

```css
/* ── SCROLL REVEAL ── */
.reveal,
.reveal-left,
.reveal-right {
  opacity: 0;
  transition: opacity 0.7s cubic-bezier(.22,1,.36,1),
              transform 0.7s cubic-bezier(.22,1,.36,1);
}
.reveal        { transform: translateY(36px); }
.reveal-left   { transform: translateX(-40px); }
.reveal-right  { transform: translateX(40px); }

.reveal.visible,
.reveal-left.visible,
.reveal-right.visible {
  opacity: 1;
  transform: none;
}
```

- [ ] **Step 2 : Implémenter `initScrollReveal()` dans `js/main.js`**

```js
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    .forEach(el => observer.observe(el));
}
```

- [ ] **Step 3 : Vérifier dans le navigateur — les éléments `.reveal` partent à opacité 0 (ouvrir les DevTools pour confirmer)**

- [ ] **Step 4 : Commit**

```bash
git add css/style.css js/main.js
git commit -m "feat: scroll reveal via IntersectionObserver"
```

---

## Task 6 : Section À Propos

**Files:**
- Modify: `index.html` — section `<section class="about">`
- Modify: `css/style.css` — styles about

- [ ] **Step 1 : Remplir le HTML de la section about**

```html
<section class="about" id="about">
  <div class="about-inner">
    <div class="about-img-wrap reveal-left">
      <div class="about-img">
        <img src="images/emmanuel.jpg" alt="Emmanuel Krieger ostéopathe" onerror="this.style.display='none'">
        <div class="about-img-placeholder">👨‍⚕️</div>
        <div class="about-img-badge">
          Emmanuel Krieger
          <span>Ostéopathe D.O. · Coach sportif</span>
        </div>
      </div>
    </div>
    <div class="about-text reveal-right">
      <div class="section-tag">À Propos</div>
      <h2>Une approche <span>globale</span><br>de votre santé</h2>
      <p>Diplômé en ostéopathie et certifié coach sportif, je vous accompagne avec une méthode unique qui combine traitement ostéopathique et coaching personnalisé pour optimiser votre performance et prévenir les blessures.</p>
      <p>Que vous soyez athlète de haut niveau ou sportif amateur, mon approche s'adapte à vos besoins spécifiques.</p>
      <a href="#services" class="about-link">En savoir plus</a>
    </div>
  </div>
</section>
```

- [ ] **Step 2 : Ajouter les styles about dans `css/style.css`**

```css
/* ── ABOUT ── */
.about { background: var(--white); padding: 100px 0; }
.about-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 60px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}
.about-img {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  height: 380px;
  background: linear-gradient(135deg, #e8f5e9, #b2dfdb);
  display: flex;
  align-items: center;
  justify-content: center;
}
.about-img img {
  width: 100%; height: 100%;
  object-fit: cover;
  position: absolute; inset: 0;
}
.about-img-placeholder { font-size: 80px; z-index: 1; }
.about-img-badge {
  position: absolute;
  bottom: 20px; left: 20px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 700;
  color: var(--green-dark);
  box-shadow: var(--glass-shadow);
  z-index: 2;
}
.about-img-badge span {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 2px;
}
.section-tag {
  display: inline-block;
  background: linear-gradient(135deg, #e8f5e9, #e3f2fd);
  color: var(--teal-dark);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 4px 14px;
  border-radius: 20px;
  border: 1px solid rgba(0,137,123,0.2);
  margin-bottom: 16px;
}
.about-text h2 {
  font-size: 34px;
  font-weight: 800;
  color: var(--green-dark);
  line-height: 1.2;
  margin-bottom: 20px;
}
.about-text h2 span {
  background: var(--grad-green);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.about-text p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 16px;
}
.about-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--teal-dark);
  font-weight: 700;
  font-size: 13px;
}
.about-link::after { content: '→'; transition: transform 0.2s; }
.about-link:hover::after { transform: translateX(5px); }
```

- [ ] **Step 3 : Vérifier visuellement et confirmer que les classes `.reveal-left` / `.reveal-right` s'animent au scroll**

- [ ] **Step 4 : Commit**

```bash
git add index.html css/style.css
git commit -m "feat: section à propos avec animations scroll"
```

---

## Task 7 : Section Prestations

**Files:**
- Modify: `index.html` — section `<section class="services">`
- Modify: `css/style.css` — styles services

- [ ] **Step 1 : Remplir le HTML de la section services**

```html
<section class="services" id="services">
  <div class="services-inner">
    <div class="services-left">
      <div class="reveal">
        <div class="section-tag">Prestations</div>
        <h2>Mes <span>services</span></h2>
        <p class="services-intro">Une gamme complète de soins et d'accompagnement adaptée aux sportifs de tous niveaux.</p>
      </div>
      <div class="service-list">
        <div class="service-item service-item--1 reveal" style="transition-delay:0.1s">
          <div class="service-header">
            <div class="service-header-left">
              <div class="service-num">1</div>
              Ostéopathie du sport
            </div>
            <span class="service-icon">+</span>
          </div>
          <div class="service-body">Traitement des douleurs musculaires, articulaires et tendineuses liées à la pratique sportive.</div>
        </div>
        <div class="service-item service-item--2 reveal" style="transition-delay:0.2s">
          <div class="service-header">
            <div class="service-header-left">
              <div class="service-num">2</div>
              Coaching personnalisé
            </div>
            <span class="service-icon">+</span>
          </div>
          <div class="service-body">Programmes d'entraînement sur mesure adaptés à vos objectifs et votre condition physique.</div>
        </div>
        <div class="service-item service-item--3 reveal" style="transition-delay:0.3s">
          <div class="service-header">
            <div class="service-header-left">
              <div class="service-num">3</div>
              Préparation physique
            </div>
            <span class="service-icon">+</span>
          </div>
          <div class="service-body">Renforcement, mobilité et endurance pour atteindre votre potentiel maximum.</div>
        </div>
        <div class="service-item service-item--4 reveal" style="transition-delay:0.4s">
          <div class="service-header">
            <div class="service-header-left">
              <div class="service-num">4</div>
              Suivi de performance
            </div>
            <span class="service-icon">+</span>
          </div>
          <div class="service-body">Analyse et suivi régulier de vos progrès avec ajustement continu des programmes.</div>
        </div>
      </div>
    </div>
    <div class="services-img reveal-right">
      <img src="images/mountains.jpg" alt="Montagnes" onerror="this.style.display='none'">
      <div class="services-img-placeholder">⛰️</div>
      <a href="#contact" class="services-cta">Prendre rendez-vous →</a>
    </div>
  </div>
</section>
```

- [ ] **Step 2 : Ajouter les styles services dans `css/style.css`**

```css
/* ── SERVICES ── */
.services {
  background: linear-gradient(180deg, #f1f8e9 0%, #f9fbe7 100%);
  padding: 100px 0;
}
.services-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 60px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: start;
}
.services-left h2 {
  font-size: 32px;
  font-weight: 800;
  color: var(--green-dark);
  margin-bottom: 8px;
}
.services-left h2 span {
  background: var(--grad-green);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.services-intro {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 28px;
}
.service-list { display: flex; flex-direction: column; gap: 10px; }
.service-item {
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(0,0,0,0.05);
  transition: box-shadow 0.2s, transform 0.2s;
  cursor: pointer;
}
.service-item:hover {
  transform: translateX(5px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}
.service-header {
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
  font-size: 13px;
  color: var(--text-primary);
}
.service-header-left { display: flex; align-items: center; gap: 12px; }
.service-num {
  width: 28px; height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  color: var(--white);
  flex-shrink: 0;
}
.service-item--1 .service-num { background: var(--grad-green); }
.service-item--2 .service-num { background: var(--grad-cyan); }
.service-item--3 .service-num { background: var(--grad-lime); color: var(--green-dark); }
.service-item--4 .service-num { background: var(--grad-orange); }
.service-icon { font-size: 20px; color: var(--text-secondary); transition: transform 0.2s; }
.service-item:hover .service-icon { transform: rotate(45deg); }
.service-body {
  padding: 0 18px 14px 58px;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.7;
}
.services-img {
  position: relative;
  border-radius: 24px;
  height: 420px;
  overflow: hidden;
  background: linear-gradient(135deg, #b2dfdb, #80cbc4, #4db6ac);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16px 48px rgba(0,0,0,0.12);
}
.services-img img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
}
.services-img-placeholder { font-size: 80px; z-index: 1; }
.services-img::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(180deg, transparent 40%, rgba(0,77,64,0.55));
  z-index: 2;
}
.services-cta {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--white);
  color: var(--green-dark);
  padding: 12px 30px;
  border-radius: 30px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  box-shadow: 0 6px 24px rgba(0,0,0,0.2);
  white-space: nowrap;
  z-index: 3;
  transition: transform 0.2s;
}
.services-cta:hover { transform: translateX(-50%) translateY(-2px); }
```

- [ ] **Step 3 : Vérifier les animations scroll et le hover translateX sur les items**

- [ ] **Step 4 : Commit**

```bash
git add index.html css/style.css
git commit -m "feat: section prestations avec accordion glassmorphism"
```

---

## Task 8 : Section Témoignages

**Files:**
- Modify: `index.html` — section `<section class="testimonials">`
- Modify: `css/style.css` — styles testimonials

- [ ] **Step 1 : Remplir le HTML de la section témoignages**

```html
<section class="testimonials" id="testimonials">
  <div class="testimonials-inner">
    <div class="reveal" style="text-align:center">
      <div class="section-tag">Témoignages</div>
      <h2>Ce que disent mes patients</h2>
      <p class="testimonials-subtitle">Des résultats concrets, des vies transformées</p>
    </div>
    <div class="testimonials-grid">
      <div class="testimonial-card testimonial-card--1 reveal" style="transition-delay:0.1s">
        <div class="quote-mark">"</div>
        <p class="testimonial-text">Après des mois de douleurs au dos, Emmanuel a trouvé la solution en quelques séances. Son approche combinée ostéo + coaching est vraiment unique.</p>
        <div class="testimonial-author">
          <div class="author-avatar author-avatar--1">M</div>
          <div>
            <div class="author-name">Michel Perraud</div>
            <div class="author-role">Coureur amateur</div>
          </div>
        </div>
      </div>
      <div class="testimonial-card testimonial-card--2 reveal" style="transition-delay:0.2s">
        <div class="quote-mark">"</div>
        <p class="testimonial-text">Le programme de coaching personnalisé a complètement transformé ma préparation. Je n'ai jamais été aussi performant sur mes compétitions.</p>
        <div class="testimonial-author">
          <div class="author-avatar author-avatar--2">S</div>
          <div>
            <div class="author-name">Sophie Martin</div>
            <div class="author-role">Triathlète</div>
          </div>
        </div>
      </div>
      <div class="testimonial-card testimonial-card--3 reveal" style="transition-delay:0.3s">
        <div class="quote-mark">"</div>
        <p class="testimonial-text">Je recommande vivement. La prise en charge est complète, professionnelle et vraiment adaptée aux sportifs. Résultats visibles dès la première séance.</p>
        <div class="testimonial-author">
          <div class="author-avatar author-avatar--3">T</div>
          <div>
            <div class="author-name">Thomas Lebrun</div>
            <div class="author-role">Footballeur</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2 : Ajouter les styles testimonials dans `css/style.css`**

```css
/* ── TESTIMONIALS ── */
.testimonials { background: var(--white); padding: 100px 0; }
.testimonials-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 60px;
}
.testimonials-inner h2 {
  font-size: 34px;
  font-weight: 800;
  color: var(--green-dark);
  margin-bottom: 8px;
}
.testimonials-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 48px;
}
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.testimonial-card {
  background: rgba(255,255,255,0.92);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(0,200,83,0.1);
  border-radius: 20px;
  padding: 28px 24px;
  box-shadow: var(--glass-shadow);
  position: relative;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}
.testimonial-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(0,0,0,0.1);
}
.testimonial-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  border-radius: 20px 20px 0 0;
}
.testimonial-card--1::before { background: var(--grad-green); }
.testimonial-card--2::before { background: var(--grad-cyan); }
.testimonial-card--3::before { background: var(--grad-lime); }
.quote-mark {
  font-size: 52px;
  color: #e8f5e9;
  font-family: Georgia, serif;
  line-height: 1;
  margin-bottom: 8px;
}
.testimonial-text {
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1.75;
  font-style: italic;
  margin-bottom: 20px;
}
.testimonial-author {
  display: flex;
  align-items: center;
  gap: 12px;
}
.author-avatar {
  width: 38px; height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  color: var(--white);
  flex-shrink: 0;
}
.author-avatar--1 { background: var(--grad-green); }
.author-avatar--2 { background: var(--grad-cyan); }
.author-avatar--3 { background: var(--grad-lime); color: var(--green-dark); }
.author-name { font-size: 12px; font-weight: 700; color: var(--green-dark); }
.author-role { font-size: 11px; color: #90a4ae; margin-top: 2px; }
```

- [ ] **Step 3 : Vérifier le hover lift et les animations scroll**

- [ ] **Step 4 : Commit**

```bash
git add index.html css/style.css
git commit -m "feat: section témoignages avec cards glassmorphism"
```

---

## Task 9 : Section Contact & Horaires

**Files:**
- Modify: `index.html` — section `<section class="contact">`
- Modify: `css/style.css` — styles contact

- [ ] **Step 1 : Remplir le HTML de la section contact**

```html
<section class="contact" id="contact">
  <div class="contact-inner">
    <div class="contact-img reveal-left">
      <img src="images/track.jpg" alt="Piste d'athlétisme" onerror="this.style.display='none'">
      <div class="contact-img-placeholder">🏃</div>
    </div>
    <div class="contact-info reveal-right">
      <div class="section-tag">Contact & Horaires</div>
      <h2>Prendre rendez-vous</h2>
      <div class="contact-glass">
        <p class="contact-address">📍 34 Rue de Strasbourg, 6117 Puidonhans</p>
        <p class="contact-address">📞 +33 6 XX XX XX XX</p>
      </div>
      <a href="#" class="contact-cta">Réserver en ligne →</a>
      <div class="contact-glass">
        <div class="hours-grid">
          <div class="hour-row"><span>Lundi</span><em>08:00–20:00</em></div>
          <div class="hour-row"><span>Mardi</span><em>08:00–20:00</em></div>
          <div class="hour-row"><span>Mercredi</span><em>08:00–20:00</em></div>
          <div class="hour-row"><span>Jeudi</span><em>08:00–20:00</em></div>
          <div class="hour-row"><span>Vendredi</span><em>08:00–18:00</em></div>
          <div class="hour-row"><span>Samedi</span><em>08:00–12:00</em></div>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2 : Ajouter les styles contact dans `css/style.css`**

```css
/* ── CONTACT ── */
.contact {
  background: linear-gradient(180deg, #f1f8e9 0%, #e8f5e9 100%);
  padding: 100px 0;
}
.contact-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 60px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}
.contact-img {
  border-radius: 24px;
  height: 360px;
  overflow: hidden;
  background: linear-gradient(135deg, #37474f, #546e7a);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16px 48px rgba(0,0,0,0.15);
  position: relative;
}
.contact-img img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
}
.contact-img-placeholder { font-size: 64px; z-index: 1; }
.contact-info h2 {
  font-size: 30px;
  font-weight: 800;
  color: var(--green-dark);
  margin-bottom: 20px;
}
.contact-glass {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: 18px;
  padding: 20px 24px;
  box-shadow: var(--glass-shadow);
  margin-bottom: 16px;
}
.contact-address {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.8;
}
.contact-cta {
  display: inline-block;
  background: linear-gradient(135deg, var(--green-dark), var(--teal-dark));
  color: var(--white);
  padding: 13px 30px;
  border-radius: 30px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  box-shadow: 0 6px 20px rgba(27,94,32,0.35);
  margin-bottom: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
  display: inline-block;
}
.contact-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(27,94,32,0.45);
}
.hours-grid { display: flex; flex-direction: column; gap: 2px; }
.hour-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  color: var(--text-secondary);
}
.hour-row:last-child { border-bottom: none; }
.hour-row span { font-weight: 700; color: var(--text-primary); }
.hour-row em { font-style: normal; }
```

- [ ] **Step 3 : Vérifier les animations slide-in et les cards glassmorphism**

- [ ] **Step 4 : Commit**

```bash
git add index.html css/style.css
git commit -m "feat: section contact et horaires"
```

---

## Task 10 : Footer

**Files:**
- Modify: `index.html` — `<footer>` et `.footer-bottom`
- Modify: `css/style.css` — styles footer

- [ ] **Step 1 : Remplir le HTML du footer**

```html
<footer class="footer" id="footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <div class="footer-logo">OSTÉO<br><span>ET COACHING</span><br>DU SPORT</div>
      <p class="footer-address">34 Rue de Strasbourg<br>6117 Puidonhans</p>
    </div>
    <div class="footer-col">
      <h4>Navigation</h4>
      <a href="#about">À Propos</a>
      <a href="#services">Services</a>
      <a href="#testimonials">Témoignages</a>
      <a href="#contact">Contact</a>
    </div>
    <div class="footer-col">
      <h4>Parcours</h4>
      <a href="#">Histoire</a>
      <a href="#">Formations</a>
    </div>
    <div class="footer-col">
      <h4>Légal</h4>
      <a href="#">Mentions légales</a>
      <a href="#">Cookies</a>
      <a href="#">Plan du site</a>
    </div>
  </div>
</footer>
```

- [ ] **Step 2 : Ajouter les styles footer dans `css/style.css`**

```css
/* ── FOOTER ── */
.footer {
  background: linear-gradient(135deg, var(--footer-bg), var(--footer-dark));
  padding: 64px 0 48px;
}
.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 60px;
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 48px;
}
.footer-logo {
  font-weight: 800;
  font-size: 15px;
  color: var(--white);
  line-height: 1.3;
  margin-bottom: 12px;
}
.footer-logo span { color: #69f0ae; }
.footer-address {
  font-size: 12px;
  color: #90a4ae;
  line-height: 1.7;
}
.footer-col h4 {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #69f0ae;
  margin-bottom: 16px;
}
.footer-col a {
  display: block;
  font-size: 13px;
  color: #b0bec5;
  margin-bottom: 10px;
  transition: color 0.2s;
}
.footer-col a:hover { color: var(--white); }
.footer-bottom {
  background: var(--footer-dark);
  padding: 14px 60px;
  font-size: 11px;
  color: #546e7a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 100%;
}
```

- [ ] **Step 3 : Vérifier le rendu global du footer**

- [ ] **Step 4 : Commit**

```bash
git add index.html css/style.css
git commit -m "feat: footer complet"
```

---

## Task 11 : Vérification finale et responsive minimal

**Files:**
- Modify: `css/style.css` — media queries

- [ ] **Step 1 : Ajouter les media queries responsive dans `css/style.css`**

```css
/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .about-inner,
  .services-inner,
  .contact-inner { grid-template-columns: 1fr; padding: 0 24px; }

  .testimonials-grid { grid-template-columns: 1fr; }

  .hero-title { font-size: 32px; }
  .hero-stat--left, .hero-stat--right { display: none; }

  .footer-inner {
    grid-template-columns: 1fr 1fr;
    padding: 0 24px;
  }

  .navbar-inner { padding: 0 20px; gap: 16px; }
  .nav-links { display: none; }
}
```

- [ ] **Step 2 : Tester en redimensionnant la fenêtre à 768px de large**

- [ ] **Step 3 : Ouvrir les DevTools > Console — zéro erreur JS**

- [ ] **Step 4 : Tester le parallaxe, les animations scroll sur toutes les sections**

- [ ] **Step 5 : Commit final**

```bash
git add css/style.css
git commit -m "feat: responsive media queries — site complet livrable"
```
