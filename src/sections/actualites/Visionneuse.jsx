import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'

const BOUTON = 'w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl ' +
               'flex items-center justify-center transition-colors cursor-pointer'

/**
 * Photo agrandie et sa description. Rendue dans <body> : la section parente
 * est animée par Framer Motion, et un `transform` sur un ancêtre ferait d'un
 * `position: fixed` un simple `absolute`.
 */
export default function Visionneuse({ photos, index, onChange, onClose }) {
  const dialogue = useRef(null)
  const fermer = useRef(null)
  const photo = photos[index]
  const n = photos.length
  const aller = (pas) => onChange((index + pas + n) % n)

  useEffect(() => {
    fermer.current?.focus()
    const debordement = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = debordement }
  }, [])

  function touche(e) {
    if (e.key === 'Escape') { e.preventDefault(); onClose() }
    else if (e.key === 'ArrowRight' && n > 1) aller(1)
    else if (e.key === 'ArrowLeft' && n > 1) aller(-1)
    else if (e.key === 'Tab') {
      const focusables = [...dialogue.current.querySelectorAll('button')]
      const premier = focusables[0]
      const dernier = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus() }
      else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus() }
    }
  }

  return createPortal(
    <motion.div
      ref={dialogue}
      role="dialog" aria-modal="true" aria-label={`Photo ${index + 1} sur ${n}`}
      onKeyDown={touche}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      className="fixed inset-0 z-[100] bg-green-deep/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <button ref={fermer} type="button" onClick={onClose} aria-label="Fermer"
              className={BOUTON + ' absolute top-4 right-4'}>
        ×
      </button>

      {n > 1 && (
        <button type="button" onClick={() => aller(-1)} aria-label="Photo précédente"
                className={BOUTON + ' absolute left-2 md:left-6 top-1/2 -translate-y-1/2'}>
          ‹
        </button>
      )}

      <motion.figure
        key={photo.id}
        className="bg-white p-3 pb-5 rounded-sm shadow-2xl max-w-3xl w-full max-h-full flex flex-col"
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <img src={photo.url} alt="" className="w-full max-h-[65vh] object-contain bg-black/5" />
        <figcaption className="pt-4 px-1 flex items-start justify-between gap-4">
          <p className="font-inter text-text-primary leading-relaxed whitespace-pre-line">
            {photo.description}
          </p>
          <span className="font-inter text-text-secondary/60 text-sm shrink-0">{index + 1} / {n}</span>
        </figcaption>
      </motion.figure>

      {n > 1 && (
        <button type="button" onClick={() => aller(1)} aria-label="Photo suivante"
                className={BOUTON + ' absolute right-2 md:right-6 top-1/2 -translate-y-1/2'}>
          ›
        </button>
      )}
    </motion.div>,
    document.body,
  )
}
