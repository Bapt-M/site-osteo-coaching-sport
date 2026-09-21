import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTextes } from '../content/ContenuProvider'

// Photo de fond : arbre-raquette entouré de balles de padel.
const HERO_IMG = '/images/hero-padel.jpg'
const IMG_RATIO = 1376 / 768

// Ancrage du logo sur le tamis de la raquette, exprimé en % de la photo
// d'origine : le disque du logo vient se poser au centre du tamis, le
// lettrage retombe sur le manche et les branches.
const LOGO_ANCHOR = {
  left: '49.2%',
  top: '21.3%',
  width: '17.6%',
  transform: 'translateX(-50%)',
}

// Balle de padel : PNG détouré 1200×800 dont la balle occupe 553 px à
// partir de (69, 79). Ces trois valeurs la recadrent pile sur le cercle du
// conteneur, quelle que soit la taille de la balle.
const BALL_IMG = '/images/balle-padel.png'
const BALL_CROP = { width: '216.99%', left: '-12.48%', top: '-14.29%' }

// Rayons des balles présentes dans la photo : 27 à 62 px sur 1376 de large,
// soit ~63 à 145 px à l'écran. On reste dans cette famille de tailles pour
// que les balles-services ne se lisent pas comme des pastilles rapportées.
const BALL_SIZE = 'clamp(135px, 11.8vw, 172px)'

// Étalonnage colorimétrique mesuré sur la photo : ses balles sont en
// HSL(61°, 34%, 46°) — kaki, voilées par la brume — quand le PNG studio est
// en HSL(74°, 90%, 46%). On désature, on réchauffe, et on aplatit un peu le
// contraste : les balles de la photo n'ont presque aucun éclairage
// directionnel (barycentre lumineux mesuré à 0,005 rayon du centre).
const BALL_GRADE = 'saturate(0.95) hue-rotate(-18deg) contrast(0.95) brightness(0.98)'

// Centre de la balle exprimé dans le repère du PNG : pivot des rotations,
// pour que chaque balle tourne sur place sans sortir du cercle.
const BALL_PIVOT = '28.79% 44.44%'

// Voile de brume de la photo, repris sur les balles du fond.
const HAZE = '205, 216, 226'

// Les quatre services, chacun dans une balle, ancrés par leur centre
// (en % du viewport) aux quatre coins du feuillage. `rot` casse l'effet de
// clonage, `depth` place la balle dans le feuillage (0) ou au premier
// plan (1) : taille, brume et netteté en découlent.
const LEAVES = [
  { cle: 'balle.suivi',  href: '/suivi-sportif',       pos: { left: '32%', top: '26%' }, rot: -18, depth: 0 },
  { cle: 'balle.projet', href: '/projet-sportif',      pos: { left: '67%', top: '26%' }, rot: 127, depth: 0 },
  { cle: 'balle.bilan',  href: '/bilan-osteopathique', pos: { left: '27%', top: '50%' }, rot: 62,  depth: 1 },
  { cle: 'balle.remise', href: '/kinesport-furd',      pos: { left: '70%', top: '50%' }, rot: -96, depth: 1 },
]

// Pas d'ombre dans la balle : le titre passe en bleu profond de la charte,
// qui tient le contraste sur le jaune-vert sans assombrir la balle.
const LEAF_STYLE = {
  fontSize: 'clamp(0.58rem, 1.3vw, 1.3rem)',
  letterSpacing: '0.04em',
  lineHeight: 1.25,
  whiteSpace: 'pre',
  // Halo clair plutôt qu'ombre sombre : le texte est foncé.
  textShadow: '0 1px 2px rgb(7, 7, 7)',
}

// Axe vertical du tronc, en fraction de la largeur de la photo. Mesuré :
// le flux de racines est centré à 49,9 %, l'avant-bras — qui tient lieu de
// tronc — à 47,7 %. On cale entre les deux.
const TRUNK_X = 0.488

// Lien « Histoire et formation » : hors balle, sur la photo.
const OVER_PHOTO_STYLE = {
  fontSize: '1.5rem',
  letterSpacing: '0.15em',
  textShadow: '0 2px 10px rgba(0,0,0,0.85), 0 0 24px rgba(0,0,0,0.5)',
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

/**
 * Reproduit en JS le cadrage `object-fit: cover` de la photo : renvoie les
 * dimensions réelles de l'image une fois recadrée. Les éléments ancrés sur
 * un point précis de la photo (le logo) sont positionnés en % de cette boîte,
 * et non du viewport — ils restent collés à la raquette à tout format.
 */
function useCoverBox(ref) {
  const [box, setBox] = useState(null)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const measure = () => {
      const { width, height } = el.getBoundingClientRect()
      if (!width || !height) return
      setBox({
        width: Math.max(width, height * IMG_RATIO),
        height: Math.max(height, width / IMG_RATIO),
        hostWidth: width,
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return box
}

/** Un service, posé dans une balle de padel. */
function Leaf({ label, href, pos, rot = 0, depth = 1 }) {
  const size = depth ? BALL_SIZE : `calc(${BALL_SIZE} * 0.9)`
  const haze = depth ? 0.06 : 0.14
  const blur = depth ? 0 : 0.5
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ ...pos, width: size, height: size }}
    >
      <motion.div variants={fadeUp} className="w-full h-full">
      <Link
        to={href}
        className="group relative block w-full h-full rounded-full pointer-events-auto cursor-pointer"
      >
        <span
          className="absolute inset-0 rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-105"
          style={{ filter: `drop-shadow(0 ${depth ? 7 : 4}px ${depth ? 15 : 10}px rgba(0,0,0,0.35))` }}
        >
          <img
            src={BALL_IMG}
            alt=""
            className="absolute max-w-none"
            style={{
              ...BALL_CROP,
              transform: `rotate(${rot}deg)`,
              transformOrigin: BALL_PIVOT,
              filter: blur ? `${BALL_GRADE} blur(${blur}px)` : BALL_GRADE,
            }}
          />
          {/* brume : recule la balle dans le plan du feuillage */}
          <span className="absolute inset-0" style={{ background: `rgba(${HAZE}, ${haze})` }} />
          {/* occlusion douce sur le pourtour : la balle se pose, elle ne flotte pas */}
          <span className="absolute inset-0 rounded-full" style={{ boxShadow: 'inset 0 0 16px 3px rgba(0,0,0,0.20)' }} />
        </span>
        <span className="absolute inset-0 flex items-center justify-center px-[8%]">
          <span
            className="font-poppins font-extrabold uppercase text-white text-center cursor-pointer group-hover:text-white transition-colors"
            style={LEAF_STYLE}
          >
            {label}
          </span>
        </span>
      </Link>
      </motion.div>
    </div>
  )
}

export default function Hero() {
  const textes = useTextes()
  const heroRef = useRef(null)
  const box = useCoverBox(heroRef)
  const stageStyle = {
    width: box ? `${box.width}px` : '100%',
    height: box ? `${box.height}px` : '100%',
  }
  // Axe du tronc converti en px écran : position dans la photo, moins la
  // moitié de ce que le cadrage `cover` rogne de chaque côté.
  const trunkLeft = box
    ? `${box.width * TRUNK_X - (box.width - box.hostWidth) / 2}px`
    : `${TRUNK_X * 100}%`

  return (
    <motion.section
      ref={heroRef}
      className="relative w-full h-screen overflow-hidden"
      initial="hidden"
      animate="visible"
    >
      {/* Fond : photo fixe, sans parallaxe ni effet de profondeur. */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={stageStyle}>
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Logo — ancré sur le tamis de la raquette, mobile compris : le cadrage
          `cover` étant recalculé à chaque format, il suit toujours la raquette. */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={stageStyle}>
          <div className="absolute" style={LOGO_ANCHOR}>
            <motion.img
              variants={fadeUp}
              src="/logo.png"
              alt="Ostéo et Coaching du Sport"
              className="w-full drop-shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* ── DESKTOP (≥850px) — les 4 balles, aux coins du feuillage ── */}
      <div className="hidden desktop:block absolute inset-0 z-20 pointer-events-none">
        {LEAVES.map(leaf => <Leaf key={leaf.href} {...leaf} label={textes[leaf.cle]} />)}
      </div>

      {/* ── Citation + histoire, alignées sur le tronc (tous formats) ──
           Vertical : 75 % et 87,5 % de la hauteur.
           Horizontal : calé sur l'axe du tronc dans la photo, donc stable
           quel que soit le recadrage `cover`. */}
      <div className="absolute inset-0 z-20 pointer-events-none">

        {/* citation — son bas reste au niveau de l'ancienne ligne 3 */}
        <div
          className="absolute -translate-x-1/2 -translate-y-full text-center"
          style={{ left: trunkLeft, top: 'min(75%, calc(100% - 215px))',
                   width: 'min(100%, 88vw)', marginTop: '-0.75rem' }}
        >
          <motion.p
            variants={fadeUp}
            className="text-white font-poppins uppercase"
            style={{ fontSize: 'clamp(1.1rem, 5.2vw, 3rem)', textShadow: '0 2px 14px rgba(0,0,0,0.85), 0 0 30px rgba(0,0,0,0.5)' }}
          >
            {textes['hero.citation']}
          </motion.p>
        </div>

        {/* histoire et formation — centre de l'ancienne ligne 4 */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
          style={{ left: trunkLeft, top: 'min(83%, calc(100% - 150px))',
                   width: 'max-content', maxWidth: '88vw' }}
        >
          <motion.div variants={fadeUp}>
            <Link
              to="/histoire"
              className="font-poppins font-extrabold uppercase text-white pointer-events-auto cursor-pointer hover:text-cyan-accent transition-colors"
              style={OVER_PHOTO_STYLE}
            >
              {textes['hero.histoire']}
            </Link>
          </motion.div>
        </div>

      </div>

      {/* Pied de hero — EMMANUEL KRIEGER (tous formats) */}
      <motion.div variants={fadeUp} className="absolute bottom-0 left-0 z-20 pb-4 desktop:pb-6 px-6 desktop:px-12">
        <div className="text-white font-poppins font-bold tracking-[0.22em]" style={{ fontSize: 'clamp(1.05rem, 4.6vw, 2rem)', textShadow: '0 2px 10px rgba(0,0,0,0.85)' }}>{textes['hero.nom']}</div>
        <div className="text-white/90 font-inter tracking-wider mt-1.5" style={{ fontSize: 'clamp(0.72rem, 3.4vw, 1.5rem)', textShadow: '0 2px 10px rgba(0,0,0,0.85)' }}>{textes['hero.fonction']}</div>
      </motion.div>
    </motion.section>
  )
}
