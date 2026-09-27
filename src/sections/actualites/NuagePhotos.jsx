import { useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Visionneuse from './Visionneuse'

/**
 * Emplacements fixes des tirages, du plus récent au plus ancien, en % du
 * conteneur (rapport 5:4). Fixes plutôt qu'aléatoires : la mise en page reste
 * identique d'une visite à l'autre et aucune photo n'est entièrement masquée.
 */
const EMPLACEMENTS = [
  { left: 30, top: 20, width: 40, rotate: -3, z: 5 },
  { left: 2,  top: 2,  width: 34, rotate: -8, z: 3 },
  { left: 64, top: 4,  width: 33, rotate: 7,  z: 2 },
  { left: 6,  top: 52, width: 32, rotate: 6,  z: 4 },
  { left: 60, top: 50, width: 34, rotate: -5, z: 1 },
]

export const texteAlternatif = (photo, rang) =>
  photo.description?.trim()
    ? (photo.description.length > 80 ? photo.description.slice(0, 80) + '…' : photo.description)
    : `Photo d’actualité ${rang + 1}`

export default function NuagePhotos({ photos }) {
  const [ouverte, setOuverte] = useState(null)
  const vignettes = useRef([])

  function fermer() {
    const rang = ouverte
    setOuverte(null)
    vignettes.current[rang]?.focus()
  }

  return (
    <>
      <div className="relative w-full aspect-[5/4]">
        {photos.slice(0, EMPLACEMENTS.length).map((photo, i) => {
          const e = EMPLACEMENTS[i]
          return (
            <button
              key={photo.id}
              ref={el => { vignettes.current[i] = el }}
              type="button"
              onClick={() => setOuverte(i)}
              aria-label={`Agrandir : ${texteAlternatif(photo, i)}`}
              style={{ left: `${e.left}%`, top: `${e.top}%`, width: `${e.width}%`,
                       zIndex: e.z, '--rot': `${e.rotate}deg` }}
              className="absolute bg-white p-[3%] pb-[12%] shadow-xl rounded-sm cursor-pointer
                         [transform:rotate(var(--rot))] transition-transform duration-300
                         hover:[transform:rotate(0deg)_scale(1.06)] hover:!z-10
                         focus-visible:[transform:rotate(0deg)_scale(1.06)] focus-visible:!z-10
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-accent"
            >
              <img src={photo.url} alt={texteAlternatif(photo, i)} loading="lazy"
                   className="w-full aspect-square object-cover bg-black/5" />
            </button>
          )
        })}
      </div>

      <AnimatePresence>
        {ouverte !== null && (
          <Visionneuse photos={photos.slice(0, EMPLACEMENTS.length)} index={ouverte}
                       onChange={setOuverte} onClose={fermer} />
        )}
      </AnimatePresence>
    </>
  )
}
