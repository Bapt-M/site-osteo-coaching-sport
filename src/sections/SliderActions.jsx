import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useListe } from '../content/ContenuProvider'
import { TEINTES } from '../content/data/slides'
import { urlMedia } from '../lib/supabase'
import { estInterne } from '../components/Lien'

/** Diapositives modifiables dans l'administration ; les couleurs, elles, tournent en boucle. */
function useSlides() {
  return useListe('carrousel').map((s, i) => ({
    ...s,
    num: String(i + 1).padStart(2, '0'),
    bg: urlMedia(s.image),
    bgMobile: urlMedia(s.imageMobile),
    ...TEINTES[i % TEINTES.length],
  }))
}

/** Vrai en dessous du point de rupture `desktop` (850 px). */
function useEstMobile() {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(max-width: 849px)')
    const sync = () => setMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return mobile
}

export default function SliderActions() {
  const SLIDES = useSlides()
  const trackRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })

  const rawIndex = useTransform(scrollYProgress, [0, 1], [0, Math.max(0, SLIDES.length - 1)])

  if (!SLIDES.length) return null

  return (
    <section ref={trackRef} className="relative" style={{ height: `${SLIDES.length * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {SLIDES.map((slide, i) => (
          <SlideBackground key={i} slide={slide} index={i} rawIndex={rawIndex} />
        ))}

        {/* Pas de voile sur la photo : un seul dégradé, à gauche, sous le texte. */}
        <div
          className="absolute inset-0 z-10"
          style={{ background : "linear-gradient(to right, rgba(13, 30, 43, 0.88), rgba(13, 30, 43, 0.62) 3.36%, rgba(13, 30, 43, 0.12) 62%, transparent 78%)" }}
        />

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
  const mobile = useEstMobile()
  const fond = mobile && slide.bgMobile ? slide.bgMobile : slide.bg
  return (
    <motion.div
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: fond ? `url(${fond})` : 'none', opacity }}
    />
  )
}

function SlideContent({ slide, index, rawIndex, total }) {
  const opacity = useTransform(rawIndex, [index - 0.4, index, index + 0.4], [0, 1, 0])
  const y = useTransform(rawIndex, [index - 0.5, index, index + 0.5], [40, 0, -40])
  // Les diapositives sont empilées : sans cela, la dernière (au-dessus) capte
  // les clics de toutes les autres, et « Découvrir » de la 1re mène à la 4e page.
  const actif = useTransform(opacity, v => v > 0.5)
  const pointerEvents = useTransform(actif, a => a ? 'auto' : 'none')
  const visibility = useTransform(opacity, v => v > 0.01 ? 'visible' : 'hidden')
  const navigate = useNavigate()

  return (
    <motion.div
      className="absolute"
      style={{ opacity, y, pointerEvents, visibility }}
    >
      <div className="flex items-center gap-3 mb-6">
        <span
          className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${slide.accent} font-poppins font-bold text-white text-sm`}
        >
          {slide.num}
        </span>
        <span className="text-white/30">—</span>
        <span className="text-white/30 font-poppins text-sm">0{total}</span>
      </div>
      <h2 className="font-poppins font-bold text-5xl md:text-7xl text-white leading-tight mb-6 whitespace-pre-line"
        style={{ textShadow: '0 2px 18px rgba(0,0,0,0.6)' }}>
        {slide.titre}
      </h2>
      <p className="font-inter text-white/85 text-lg max-w-lg mb-8 leading-relaxed"
        style={{ textShadow: '0 1px 10px rgba(0,0,0,0.65)' }}>
        {slide.texte}
      </p>
      {slide.cta && slide.lien && <motion.a
        href={slide.lien}
        {...(estInterne(slide.lien) ? {} : { target: '_blank', rel: 'noreferrer' })}
        onClick={e => { if (estInterne(slide.lien)) { e.preventDefault(); navigate(slide.lien) } }}
        className={`inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r ${slide.accent} text-white font-poppins font-bold tracking-wide`}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        {slide.cta} →
      </motion.a>}
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
    const targetScroll = window.scrollY + rect.top + (total > 1 ? index / (total - 1) : 0) * totalHeight
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
