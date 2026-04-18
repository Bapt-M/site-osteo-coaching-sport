import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

const LEAF_STYLE = {
  fontSize: '0.7rem',
  letterSpacing: '0.15em',
  lineHeight: 1.4,
  whiteSpace: 'pre-line',
  textShadow: '0 2px 8px rgba(0,0,0,0.5)',
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

function Leaf({ label, href }) {
  const cls = 'font-syne font-extrabold uppercase'
  return (
    <motion.div variants={fadeUp} style={LEAF_STYLE}>
      {href === '#'
        ? <span className={`${cls} text-white/50 cursor-default`}>{label}</span>
        : <Link to={href} className={`${cls} text-white hover:text-cyan-accent transition-colors`}>{label}</Link>
      }
    </motion.div>
  )
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

  return (
    <motion.section
      ref={heroRef}
      className="relative w-full h-screen overflow-hidden"
      onMouseMove={onMouseMove}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0) }}
      initial="hidden"
      animate="visible"
    >
      {/* Fond vidéo */}
      <div className="absolute inset-0 z-0">
        <video className="w-full h-full object-cover" src="/videos/arbre-racines-1440p-hq.mp4" autoPlay muted loop playsInline />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/50" />
      </div>

      {/* ── MOBILE (<850px) ── logo + citation centrés, pas de feuilles ── */}
      <div className="desktop:hidden relative z-10 h-full flex flex-col items-center justify-center gap-6">
        <motion.div style={{ x: logoX, y: logoY }} variants={fadeUp} className="text-center">
          <img src="/logo.png" alt="Ostéo et Coaching du Sport" className="w-48 drop-shadow-2xl" />
        </motion.div>
        <motion.p variants={fadeUp} className="text-white/50 font-syne uppercase text-center" style={{ fontSize: '0.65rem', letterSpacing: '0.3em' }}>
          UN DES HOMMES DE L'OMBRE
        </motion.p>
      </div>

      {/* ── DESKTOP (≥850px) — col 1 = gouttière 5%, cols 2-6 = contenu ── */}
      <div className="hidden desktop:grid relative z-10 h-full grid-cols-[5%_repeat(5,minmax(0,1fr))] grid-rows-4">

        {/* L1 C4 — SUIVI SPORTIF */}
        <div className="row-start-1 col-start-4 flex text-center items-end justify-center pb-4">
          <Leaf label={"SUIVI SPORTIF\nDE HAUT NIVEAU"} href="/suivi-sportif" />
        </div>

        {/* L2 C3 — INTERVENTION */}
        <div className="row-start-2 col-start-3 flex items-center">
          <Leaf label={"INTERVENTION\nEN ENTREPRISE"} href="/intervention-entreprise" />
        </div>

        {/* L2-3 C4 — LOGO (lignes 2 et 3) + citation en bas de la ligne 3 */}
        <div className="row-start-2 row-span-2 col-start-4 flex flex-col items-center">
          <div className="flex-1 flex items-center justify-center">
            <motion.div style={{ x: logoX, y: logoY }} variants={fadeUp} className="text-center">
              <img src="/logo.png" alt="Ostéo et Coaching du Sport" className="w-48 desktop:w-64 drop-shadow-2xl" />
            </motion.div>
          </div>
          <motion.p variants={fadeUp} className="text-white font-syne uppercase pb-3" style={{ fontSize: '1.5rem', textAlign: 'center' }}>
            UN DES HOMMES DE L'OMBRE
          </motion.p>
        </div>

        {/* L2 C5 — KINESPORT FURD */}
        <div className="row-start-2 col-start-5 text-right flex items-center justify-end">
          <Leaf label={"KINESPORT\nFURD"} href="/kinesport-furd" />
        </div>

        {/* L3 C3 — BILAN */}
        <div className="row-start-3 col-start-3 flex items-start pt-4">
          <Leaf label={"BILAN ET TRAITEMENT\nOSTÉOPATHIQUE"} href="/bilan-osteopathique" />
        </div>

        {/* L3 C5 — PROJET SPORTIF */}
        <div className="row-start-3 col-start-5 text-right flex items-start justify-end pt-4">
          <Leaf label={"PROJET SPORTIF\nPERSONNALISÉ"} href="/projet-sportif" />
        </div>

        {/* L4 C4 — HISTOIRE ET FORMATION */}
        <div className="row-start-4 col-start-4 flex items-center justify-center">
          <motion.div variants={fadeUp} className="text-center">
            <Link to="/histoire" className="font-syne font-extrabold uppercase text-white block text-center hover:text-cyan-accent transition-colors" style={LEAF_STYLE}>
              HISTOIRE ET FORMATION
            </Link>
          </motion.div>
        </div>

      </div>

      {/* Pied de hero — EMMANUEL KRIEGER (desktop uniquement) */}
      <motion.div variants={fadeUp} className="hidden desktop:block absolute bottom-0 left-0 z-10 pb-6 px-8 desktop:px-12">
        <div className="text-white font-syne font-bold text-sm tracking-[0.3em]">EMMANUEL KRIEGER</div>
        <div className="text-white/60 font-inter text-xs tracking-wider mt-1">OSTÉOPATHE ET COACHING DU SPORT À FURDENHEIM</div>
      </motion.div>
    </motion.section>
  )
}
