# Redesign Dynamique — Ostéo et Coaching du Sport

**Date :** 2026-03-20
**Projet :** Site vitrine d'Emmanuel Krieger — Ostéopathe & Coach sportif
**Approche retenue :** Vibrant & Fluide (A) + Lumineux & Aérien (C) combinés

---

## 1. Contexte

Redesign du webdesign existant (PDF Version 3) pour le rendre vivant et dynamique. Le site conserve l'identité visuelle nature/sport (arbre, ciel, vert) mais avec une palette plus vibrante, des animations scroll sur toutes les sections, et un effet de parallaxe souris sur la hero.

---

## 2. Palette de couleurs

| Rôle | Valeur |
|---|---|
| Fond principal | `#ffffff` / `#f7f9f7` (blanc lumineux) |
| Vert foncé (titres, CTA) | `#1b5e20` |
| Vert vif (accent 1) | `#00c853` |
| Teal (accent 2) | `#00bfa5` / `#00897b` |
| Cyan (accent 3) | `#00b0ff` / `#00e5ff` |
| Lime (accent 4) | `#76ff03` |
| Orange (accent 5 — prestation 4) | `#ff6d00` / `#ffab00` |
| Texte secondaire | `#546e7a` |
| Footer fond | `#1b2a1c` → `#0d1f1e` |

Les dégradés sur les accents se font toujours dans l'ordre vert → teal → cyan.

---

## 3. Système glassmorphism

Toutes les cards utilisent le même système :

```css
background: rgba(255, 255, 255, 0.72–0.88);
backdrop-filter: blur(12–16px);
border: 1px solid rgba(255, 255, 255, 0.9–0.95);
border-radius: 14–20px;
box-shadow: 0 4px 24px rgba(0,0,0,0.06–0.1),
            0 0 0 1px rgba(255,255,255,0.5) inset;
```

Chaque card a une ligne colorée en haut (3px, `border-radius` correspondant) avec un dégradé propre à son rang (vert, cyan, lime, orange).

---

## 4. Section 1 — Hero

### Layout
- **Titre centré** : "Coaching personnalisé & Ostéopathie" en grand (42px, font-weight 900), mot "personnalisé" en dégradé vert→cyan
- **Sous-titre** centré (16px)
- **3 pills glassmorphism** horizontales sous le titre (services résumés)
- **CTA principal** centré : bouton pill vert foncé→teal avec ombre colorée
- **2 cards stats flottantes** gauche/droite (ex: "+500 patients", "12 ans d'expérience")
- **Arbre SVG** en arrière-plan à droite (z-index bas)
- **Navbar** : blanc translucide, backdrop-filter blur, fixe au scroll

### Effet parallaxe souris (6 couches)
| Couche | Déplacement |
|---|---|
| Ciel/fond | Statique |
| Nuages | `cx * 20px, cy * 8px` (lent, même sens souris) |
| Sol | `cx * 8px, cy * 5px` (très lent) |
| Arbre | `cx * -32px, cy * -20px` (sens inverse, plus fort) |
| Contenu central | `cx * 5px, cy * 3px` (très léger) |
| Cards stats | `cx * -10–14px, cy * -6–8px` |

Toutes les couches utilisent `transition: transform 0.08–0.15s ease-out` pour fluidité.

---

## 5. Section 2 — À Propos

- Grid 2 colonnes : photo gauche, texte droite
- Photo avec badge glassmorphism en bas-gauche (nom + titre)
- Animation scroll : slide-in depuis gauche (photo) et droite (texte)
- Lien "En savoir plus" avec flèche animée au hover

---

## 6. Section 3 — Prestations

- Grid 2 colonnes : accordion gauche, image montagne droite
- 4 items accordion glassmorphism blanc, numérotés avec pastille dégradée colorée par prestation
- Hover : translateX(4px) + ombre renforcée
- Image droite avec CTA "Prendre rendez-vous" en overlay bas
- Fond : dégradé très léger vert clair (`#f1f8e9`)
- Animation scroll : fade-up avec `transition-delay` décalé (0.1s par item)

---

## 7. Section 4 — Témoignages

- 3 colonnes égales, fond blanc
- Chaque card : guillemet décoratif, texte italic, avatar initiales coloré
- Ligne colorée haut (3px dégradé, couleur différente par card)
- Hover : `translateY(-6px)` + ombre renforcée
- Animation scroll : fade-up décalé

---

## 8. Section 5 — Contact & Horaires

- Grid 2 colonnes : photo piste d'athlétisme gauche, infos droite
- Card glassmorphism : adresse + téléphone
- CTA "Réserver en ligne" pill vert
- Card glassmorphism : grille horaires (lundi–samedi)
- Fond : dégradé très léger vert (`#f1f8e9` → `#e8f5e9`)

---

## 9. Footer

- Fond : `linear-gradient(135deg, #1b2a1c, #0d1f1e)` (vert très sombre)
- Grid 4 colonnes : logo+adresse, navigation, parcours, légal
- Accents verts émeraude sur les titres de colonnes (`#69f0ae`)
- Bande footer-bottom séparée, fond encore plus sombre

---

## 10. Animations scroll globales

Trois classes CSS animées via `IntersectionObserver` (threshold 0.15) :

| Classe | Effet |
|---|---|
| `.reveal` | `opacity 0→1` + `translateY(36px→0)` |
| `.reveal-left` | `opacity 0→1` + `translateX(-40px→0)` |
| `.reveal-right` | `opacity 0→1` + `translateX(40px→0)` |

Easing : `cubic-bezier(.22,1,.36,1)` — duration `0.7s`
`transition-delay` décalé par item pour les listes (0.1s par item).

---

## 11. Stack technique

- Typographie : `'Segoe UI'`, `system-ui`, sans-serif (polices système, aucune dépendance Google Fonts)
- HTML5 / CSS3 pur (pas de framework CSS)
- Vanilla JavaScript (parallaxe souris, IntersectionObserver)
- Arbre en SVG inline (pas d'image externe)
- Aucune dépendance externe (pas de librairie JS)
- Compatible tous navigateurs modernes (backdrop-filter avec préfixe `-webkit-`)

---

## 12. Fichiers à produire

1. `index.html` — page complète avec toutes les sections
2. `css/style.css` — styles séparés
3. `js/main.js` — parallaxe + scroll animations
