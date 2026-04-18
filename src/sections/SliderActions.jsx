import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'

const SLIDES = [
  {
    num: '01', title: 'Ostéopathie\ndu sport',
    desc: "Traitement des douleurs musculaires, articulaires et tendineuses liées à la pratique sportive. Une approche manuelle précise pour vous remettre en mouvement.",
    cta: 'Découvrir',
    href: '/bilan-osteopathique',
    bg: '/images/OSTEO-pic-5.jpg',
    accent: 'from-[var(--c-accent-hex)] to-[var(--c-accent-dark-hex)]',
    dot: 'var(--c-accent-hex)',
  },
  {
    num: '02', title: 'Coaching\npersonnalisé',
    desc: "Programmes d'entraînement sur mesure adaptés à vos objectifs, votre niveau et votre emploi du temps. Une méthode unique alliant performance et plaisir.",
    cta: 'Découvrir',
    href: '/projet-sportif',
    bg: '/images/OSTEO-pic-7.jpg',
    accent: 'from-[var(--c-accent-light-hex)] to-[var(--c-accent-hex)]',
    dot: 'var(--c-accent-light-hex)',
  },
  {
    num: '03', title: 'Préparation\nphysique',
    desc: "Renforcement musculaire, mobilité et travail de l'endurance pour repousser vos limites. Des protocoles adaptés à chaque discipline sportive.",
    cta: 'En savoir plus',
    href: '/projet-sportif',
    bg: '/images/OSTEO-pic-9.jpg',
    accent: 'from-[var(--c-accent-lighter-hex)] to-[var(--c-accent-light-hex)]',
    dot: 'var(--c-accent-lighter-hex)',
  },
  {
    num: '04', title: 'Suivi de\nperformance',
    desc: "Analyse régulière de vos progrès, ajustement continu des programmes et accompagnement sur le long terme pour atteindre votre meilleur niveau.",
    cta: 'En savoir plus',
    href: '/suivi-sportif',
    bg: '/images/OSTEO-pic-10.jpg',
    accent: 'from-[var(--c-accent-dark-hex)] to-[var(--c-deep-hex)]',
    dot: 'var(--c-accent-dark-hex)',
  },
]

export default function SliderActions() {
  const trackRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })

  const rawIndex = useTransform(scrollYProgress, [0, 1], [0, SLIDES.length - 1])

  return (
    <section ref={trackRef} className="relative" style={{ height: `${SLIDES.length * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {SLIDES.map((slide, i) => (
          <SlideBackground key={i} slide={slide} index={i} rawIndex={rawIndex} />
        ))}

        {/* Overlay bleu sombre transparent — fond homogène + protection texte à gauche */}
        <div className="absolute inset-0 z-10" style={{ background: 'rgba(13,30,43,0.72)' }} />
        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to right, rgba(13,30,43,0.45) 0%, transparent 65%)' }} />

        <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-24 max-w-3xl">
          {SLIDES.map((slide, i) => (
            <SlideContent key={i} slide={slide} index={i} rawIndex={rawIndex} total={SLIDES.length} />
          ))}
        </div>

        <div className="absolute bottom-8 left-8 md:left-24 right-8 md:right-24 h-px bg-white/20 z-20">
          <motion.div
            className="h-full bg-green-accent origin-left"
            style={{ scaleX: scrollYProgress }}
          />
        </div>

        <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
          {SLIDES.map((_, i) => (
            <DotButton key={i} index={i} rawIndex={rawIndex} trackRef={trackRef} total={SLIDES.length} dot={SLIDES[i].dot} />
          ))}
        </div>
      </div>
    </section>
  )
}

function SlideBackground({ slide, index, rawIndex }) {
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
  const navigate = useNavigate()

  return (
    <motion.div
      className="absolute"
      style={{ opacity, y }}
    >
      <div className="flex items-center gap-3 mb-6">
        <span
          className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${slide.accent} font-syne font-bold text-white text-sm`}
        >
          {slide.num}
        </span>
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
        href={slide.href}
        onClick={e => { e.preventDefault(); navigate(slide.href) }}
        className={`inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r ${slide.accent} text-white font-syne font-bold tracking-wide`}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        {slide.cta} →
      </motion.a>
    </motion.div>
  )
}

function DotButton({ index, rawIndex, trackRef, total, dot }) {
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
      className="w-2 h-2 rounded-full"
      style={{ opacity, scale, backgroundColor: dot }}
      onClick={scrollToSlide}
      aria-label={`Slide ${index + 1}`}
    />
  )
}
